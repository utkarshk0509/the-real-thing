import { supabase } from '../lib/supabase';
import { PROJECTIONS, CACHE_KEYS } from '../config/constants';
import cacheService from './cacheService';

export const workService = {
  /**
   * Fetches published works using lightweight CARD_LIST projection.
   * EXCLUDES heavy 'body' column to prevent PostgREST egress bloat.
   */
  async getPublishedWorks() {
    let remoteWorks = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('works')
        .select(PROJECTIONS.CARD_LIST)
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[workService] Failed to fetch remote works:', error.message);
      } else if (data) {
        remoteWorks = data;
      }
    }

    // Only merge local works that are full objects (not just order-map stubs)
    // CUSTOM_WORKS may contain lightweight {slug, sort_order} stubs from saveOrder —
    // filter those out so they don't appear as phantom cards.
    const localCustom = (cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || []).filter(
      (item) => item && item.title && item.status === 'published'
    );

    const map = new Map();
    // Remote always wins over local (remote is source of truth)
    [...localCustom, ...remoteWorks].forEach((item) => {
      if (item && item.status === 'published') {
        map.set(item.slug, item);
      }
    });

    const uniqueWorks = Array.from(map.values());
    uniqueWorks.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    // Always update SWR cache (even if empty, so stale data is cleared)
    cacheService.set(CACHE_KEYS.HUB_WORKS, uniqueWorks);

    return uniqueWorks;
  },

  /**
   * Fetches full work payload by slug using WORK_FULL projection for ReaderView.
   */
  async getWorkBySlug(slug) {
    if (!slug) return null;

    // Check local custom works first
    const localCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    let work = localCustom.find((w) => w.slug === slug) || null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('works')
          .select(PROJECTIONS.WORK_FULL)
          .eq('slug', slug)
          .single();

        if (!error && data) {
          work = data;
        }
      } catch (err) {
        console.warn(`[workService] Remote fetch failed for slug "${slug}":`, err);
      }
    }

    return work;
  },

  /**
   * Admin: Fetches all works (published + drafts) with WORK_FULL projection.
   */
  async getAllWorksAdmin() {
    let combinedWorks = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('works')
          .select(PROJECTIONS.WORK_FULL)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!error && data) combinedWorks = data;
      } catch (err) {
        console.warn('[workService] Admin works fetch warning:', err);
      }
    }

    // Re-apply local order map if present
    const savedOrderMap = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const orderMap = new Map(savedOrderMap.map((item) => [item.slug, item.sort_order]));

    combinedWorks = combinedWorks.map((work) => {
      if (orderMap.has(work.slug)) {
        return { ...work, sort_order: orderMap.get(work.slug) };
      }
      return work;
    });

    combinedWorks.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    
    // Refresh Hub cache with published works
    const publishedOnly = combinedWorks.filter((w) => w.status === 'published');
    cacheService.set(CACHE_KEYS.HUB_WORKS, publishedOnly);

    return combinedWorks;
  },

  async incrementLikes(workId, incrementBy = 1) {
    if (!workId) throw new Error('workId is required for incrementLikes');

    if (supabase) {
      const { data, error } = await supabase.rpc('increment_work_likes', {
        work_id_param: workId,
        increment_by: incrementBy
      });

      if (error) {
        console.error('[workService] RPC increment_work_likes failed:', error.message);
        throw new Error(error.message);
      }

      return data;
    }

    // Supabase not configured — like is already tracked locally in GildedHeart
    return null;
  },

  /**
   * Admin: Create or update a work entry.
   */
  async upsertWork(workData) {
    let savedData = workData;

    if (supabase) {
      try {
        if (workData.id && !String(workData.id).startsWith('17')) {
          // UPDATE existing work
          const { data, error } = await supabase
            .from('works')
            .update(workData)
            .eq('id', workData.id)
            .select(PROJECTIONS.WORK_FULL)
            .single();

          if (error) {
            console.error('[workService] Update failed:', error.message, error.details);
            throw new Error(`Update failed: ${error.message}`);
          }
          if (data) savedData = data;
        } else {
          // INSERT new work: omit undefined/null id
          const { id, ...insertPayload } = workData;
          const { data, error } = await supabase
            .from('works')
            .insert([insertPayload])
            .select(PROJECTIONS.WORK_FULL)
            .single();

          if (error) {
            console.error('[workService] Insert failed:', error.message, error.details);
            throw new Error(`Insert failed: ${error.message}`);
          }
          if (data) savedData = data;
        }
      } catch (err) {
        // Re-throw so AuthorPortal can show the real error to the author
        throw err;
      }
    } else {
      // Supabase not configured – fall back to local-only storage
      const localCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
      const existing = localCustom.findIndex((w) => w.slug === workData.slug);
      if (existing >= 0) {
        localCustom[existing] = workData;
      } else {
        localCustom.push(workData);
      }
      cacheService.set(CACHE_KEYS.CUSTOM_WORKS, localCustom);
    }

    // Invalidate HUB_WORKS so the next getPublishedWorks call fetches fresh data
    cacheService.invalidate(CACHE_KEYS.HUB_WORKS);
    // Refresh memory/local cache
    await this.getAllWorksAdmin();
    return savedData;
  },

  /**
   * Admin: Delete a work entry by ID or Slug.
   */
  async deleteWork({ id, slug }) {
    if (supabase) {
      try {
        if (slug) await supabase.from('works').delete().eq('slug', slug);
        if (id) await supabase.from('works').delete().eq('id', id);
      } catch (err) {
        console.warn('[workService] Delete work error:', err);
      }
    }

    // Update local cache
    const currentCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const filteredCustom = currentCustom.filter((w) => w.slug !== slug && w.id !== id);
    cacheService.set(CACHE_KEYS.CUSTOM_WORKS, filteredCustom);

    await this.getAllWorksAdmin();
  },

  /**
   * Admin: Batch update sort_order for constellation cards.
   */
  async saveOrder(orderedWorks) {
    const updatedWorks = orderedWorks.map((work, idx) => ({
      ...work,
      sort_order: idx
    }));

    // Save lightweight map to local storage
    const lightweightMap = updatedWorks.map((w) => ({
      slug: w.slug,
      sort_order: w.sort_order
    }));
    cacheService.set(CACHE_KEYS.CUSTOM_WORKS, lightweightMap);

    // Sync to Supabase
    if (supabase) {
      for (const work of updatedWorks) {
        try {
          if (work.id && !String(work.id).startsWith('17')) {
            await supabase
              .from('works')
              .update({ sort_order: work.sort_order })
              .eq('id', work.id);
          } else if (work.slug) {
            await supabase
              .from('works')
              .update({ sort_order: work.sort_order })
              .eq('slug', work.slug);
          }
        } catch (e) {
          console.warn('[workService] Order sync item notice:', e);
        }
      }
    }

    // Refresh hub cache
    const publishedOnly = updatedWorks.filter((w) => w.status === 'published');
    cacheService.set(CACHE_KEYS.HUB_WORKS, publishedOnly);

    return updatedWorks;
  }
};

export default workService;
