import { supabase } from '../lib/supabase';
import { PROJECTIONS, CACHE_KEYS } from '../config/constants';
import cacheService from './cacheService';

export const workService = {
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

    const localCustom = (cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || []).filter(
      (item) => item && item.title && item.status === 'published'
    );

    const map = new Map();
    [...localCustom, ...remoteWorks].forEach((item) => {
      if (item && item.status === 'published') {
        map.set(item.slug, item);
      }
    });

    const uniqueWorks = Array.from(map.values());
    uniqueWorks.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    cacheService.set(CACHE_KEYS.HUB_WORKS, uniqueWorks);

    return uniqueWorks;
  },

  async getWorkBySlug(slug) {
    if (!slug) return null;

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

    const savedOrderMap = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const orderMap = new Map(savedOrderMap.map((item) => [item.slug, item.sort_order]));

    combinedWorks = combinedWorks.map((work) => {
      if (orderMap.has(work.slug)) {
        return { ...work, sort_order: orderMap.get(work.slug) };
      }
      return work;
    });

    combinedWorks.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    
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

    return null;
  },

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

          if (error) {
            console.error('[workService] Update failed:', error.message, error.details);
            throw new Error(`Update failed: ${error.message}`);
          }
          if (data) savedData = data;
        } else {
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
        throw err;
      }
    } else {
      const localCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
      const existing = localCustom.findIndex((w) => w.slug === workData.slug);
      if (existing >= 0) {
        localCustom[existing] = workData;
      } else {
        localCustom.push(workData);
      }
      cacheService.set(CACHE_KEYS.CUSTOM_WORKS, localCustom);
    }

    cacheService.invalidate(CACHE_KEYS.HUB_WORKS);
    await this.getAllWorksAdmin();
    return savedData;
  },

  async deleteWork({ id, slug }) {
    if (supabase) {
      try {
        if (slug) await supabase.from('works').delete().eq('slug', slug);
        if (id) await supabase.from('works').delete().eq('id', id);
      } catch (err) {
        console.warn('[workService] Delete work error:', err);
      }
    }

    const currentCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const filteredCustom = currentCustom.filter((w) => w.slug !== slug && w.id !== id);
    cacheService.set(CACHE_KEYS.CUSTOM_WORKS, filteredCustom);

    await this.getAllWorksAdmin();
  },

  async saveOrder(orderedWorks) {
    const updatedWorks = orderedWorks.map((work, idx) => ({
      ...work,
      sort_order: idx
    }));

    const lightweightMap = updatedWorks.map((w) => ({
      slug: w.slug,
      sort_order: w.sort_order
    }));
    cacheService.set(CACHE_KEYS.CUSTOM_WORKS, lightweightMap);

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

    const publishedOnly = updatedWorks.filter((w) => w.status === 'published');
    cacheService.set(CACHE_KEYS.HUB_WORKS, publishedOnly);

    return updatedWorks;
  },

  async togglePublishStatus(work) {
    const newStatus = work.status === 'published' ? 'draft' : 'published';
    const published_at = newStatus === 'published' ? (work.published_at || new Date().toISOString()) : null;

    if (supabase && work.id) {
      try {
        await supabase
          .from('works')
          .update({ status: newStatus, published_at })
          .eq('id', work.id);
      } catch (err) {
        console.warn('[workService] togglePublishStatus remote error:', err);
      }
    }

    const currentCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const idx = currentCustom.findIndex((w) => w.slug === work.slug || w.id === work.id);
    if (idx >= 0) {
      currentCustom[idx] = { ...currentCustom[idx], status: newStatus, published_at };
      cacheService.set(CACHE_KEYS.CUSTOM_WORKS, currentCustom);
    }

    cacheService.invalidate(CACHE_KEYS.HUB_WORKS);
    return await this.getAllWorksAdmin();
  },

  async duplicateWork(work) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newWork = {
      title: `${work.title} (Copy)`,
      slug: `${work.slug}-copy-${randomSuffix}`,
      author: work.author || 'Anonymous',
      category: work.category || 'poem',
      status: 'draft',
      excerpt: work.excerpt || '',
      body: work.body || '',
      image_url: work.image_url || '',
      read_time_minutes: work.read_time_minutes || 1,
      published_at: null,
      crop_scale: work.crop_scale || 1,
      crop_pos_x: work.crop_pos_x || 50,
      crop_pos_y: work.crop_pos_y || 50,
      bookshelf_crop_scale: work.bookshelf_crop_scale || 1,
      bookshelf_crop_pos_x: work.bookshelf_crop_pos_x || 50,
      bookshelf_crop_pos_y: work.bookshelf_crop_pos_y || 50,
      sort_order: (work.sort_order || 0) + 1,
    };

    return await this.upsertWork(newWork);
  },

  async batchUpdateStatus(workIds, newStatus) {
    if (!workIds || workIds.length === 0) return await this.getAllWorksAdmin();

    const published_at = newStatus === 'published' ? new Date().toISOString() : null;

    if (supabase) {
      try {
        await supabase
          .from('works')
          .update({ status: newStatus, published_at })
          .in('id', workIds);
      } catch (err) {
        console.warn('[workService] batchUpdateStatus remote error:', err);
      }
    }

    const currentCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const updated = currentCustom.map((w) => {
      if (workIds.includes(w.id) || workIds.includes(w.slug)) {
        return { ...w, status: newStatus, published_at };
      }
      return w;
    });
    cacheService.set(CACHE_KEYS.CUSTOM_WORKS, updated);

    cacheService.invalidate(CACHE_KEYS.HUB_WORKS);
    return await this.getAllWorksAdmin();
  },

  async batchDeleteWorks(workIds) {
    if (!workIds || workIds.length === 0) return await this.getAllWorksAdmin();

    if (supabase) {
      try {
        await supabase
          .from('works')
          .delete()
          .in('id', workIds);
      } catch (err) {
        console.warn('[workService] batchDeleteWorks remote error:', err);
      }
    }

    const currentCustom = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const updated = currentCustom.filter((w) => !workIds.includes(w.id) && !workIds.includes(w.slug));
    cacheService.set(CACHE_KEYS.CUSTOM_WORKS, updated);

    cacheService.invalidate(CACHE_KEYS.HUB_WORKS);
    return await this.getAllWorksAdmin();
  }
};

export default workService;
