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

    // Merge with any custom local works stored offline
    const localCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const map = new Map();

    [...remoteWorks, ...localCustom].forEach((item) => {
      if (item && item.status === 'published') {
        map.set(item.slug, item);
      }
    });

    const uniqueWorks = Array.from(map.values());
    uniqueWorks.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    // Update SWR cache
    if (uniqueWorks.length > 0) {
      cacheService.set(CACHE_KEYS.HUB_WORKS, uniqueWorks);
    }

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

  /**
   * Atomic RPC function call to handle likes without returning heavy row payloads.
   */
  async incrementLikes(workId, incrementBy = 1) {
    if (!workId) return null;

    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('increment_work_likes', {
          work_id_param: workId,
          increment_by: incrementBy
        });

        if (!error) return data;
      } catch (err) {
        console.warn('[workService] RPC increment_work_likes fallback:', err);
      }
    }

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
          const { data, error } = await supabase
            .from('works')
            .update(workData)
            .eq('id', workData.id)
            .select(PROJECTIONS.WORK_FULL)
            .single();

          if (!error && data) savedData = data;
        } else {
          // New insert: omit temporary numeric ID if generated client-side
          const { id, ...insertPayload } = workData;
          const { data, error } = await supabase
            .from('works')
            .insert([insertPayload])
            .select(PROJECTIONS.WORK_FULL)
            .single();

          if (!error && data) savedData = data;
        }
      } catch (err) {
        console.warn('[workService] Upsert work warning:', err);
      }
    }

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
