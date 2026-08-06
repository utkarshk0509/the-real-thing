import { supabase } from '../lib/supabase';
import { CACHE_KEYS, DEFAULT_AUTHOR_BIO } from '../config/constants';
import cacheService from './cacheService';

export const siteService = {
  /**
   * Fetches site author bio with SWR caching.
   * @returns {Promise<string>}
   */
  async getAuthorBio() {
    const cachedBio = cacheService.get(CACHE_KEYS.AUTHOR_BIO);
    if (cachedBio) return cachedBio;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'author_bio')
          .maybeSingle();

        if (!error && data?.value) {
          cacheService.set(CACHE_KEYS.AUTHOR_BIO, data.value);
          return data.value;
        }
      } catch (err) {
        console.warn('[siteService] Remote bio fetch error:', err);
      }
    }

    return DEFAULT_AUTHOR_BIO;
  },

  /**
   * Updates site author bio in Supabase and SWR cache.
   * @param {string} newBio
   * @returns {Promise<boolean>}
   */
  async updateAuthorBio(newBio) {
    cacheService.set(CACHE_KEYS.AUTHOR_BIO, newBio);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            key: 'author_bio',
            value: newBio,
            updated_at: new Date().toISOString()
          });

        if (!error) return true;
      } catch (err) {
        console.warn('[siteService] Remote bio update notice:', err);
      }
    }

    return true;
  },

  /**
   * Fetches full About Author Sanctuary custom settings.
   */
  async getAboutData() {
    const cached = cacheService.get('real_thing_about_data');
    if (cached) return cached;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'about_data')
          .maybeSingle();

        if (!error && data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          cacheService.set('real_thing_about_data', parsed);
          return parsed;
        }
      } catch (err) {
        console.warn('[siteService] Remote about fetch error:', err);
      }
    }

    try {
      const local = localStorage.getItem('real_thing_about_data');
      if (local) return JSON.parse(local);
    } catch (e) {}

    return null;
  },

  /**
   * Updates full About Author Sanctuary custom settings.
   */
  async updateAboutData(aboutData) {
    cacheService.set('real_thing_about_data', aboutData);
    try {
      localStorage.setItem('real_thing_about_data', JSON.stringify(aboutData));
    } catch (e) {}

    if (supabase) {
      try {
        await supabase
          .from('site_settings')
          .upsert({
            key: 'about_data',
            value: JSON.stringify(aboutData),
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.warn('[siteService] Remote about update notice:', err);
      }
    }

    return true;
  },

  /**
   * Fetches reader whispers from Supabase (or local fallback).
   */
  async getWhispers() {
    if (supabase) {
      try {
        // Try dedicated reader_whispers table first
        const { data, error } = await supabase
          .from('reader_whispers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map((w) => ({
            id: w.id,
            sender: w.sender || 'A Quiet Reader',
            text: w.message || w.text || '',
            timestamp: new Date(w.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          }));
          localStorage.setItem('real_thing_author_messages', JSON.stringify(formatted));
          return formatted;
        }
      } catch (err) {
        console.warn('[siteService] reader_whispers fetch error:', err);
      }

      // Fallback to site_settings key
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'reader_whispers')
          .maybeSingle();

        if (!error && data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          localStorage.setItem('real_thing_author_messages', JSON.stringify(parsed));
          return parsed;
        }
      } catch (err) {}
    }

    try {
      const local = localStorage.getItem('real_thing_author_messages');
      if (local) return JSON.parse(local);
    } catch (e) {}

    return [];
  },

  /**
   * Saves a new reader whisper into Supabase & LocalStorage.
   */
  async sendWhisper(whisperData) {
    const payload = {
      sender: whisperData.sender || 'A Quiet Reader',
      message: whisperData.text,
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reader_whispers')
          .insert([payload])
          .select();

        if (!error && data) {
          return await siteService.getWhispers();
        }
      } catch (err) {
        console.warn('[siteService] reader_whispers insert notice:', err);
      }

      // Fallback to site_settings
      try {
        const existing = await siteService.getWhispers();
        const newWhisper = {
          id: Date.now(),
          sender: whisperData.sender || 'A Quiet Reader',
          text: whisperData.text,
          timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        };
        const updated = [newWhisper, ...existing];
        await supabase
          .from('site_settings')
          .upsert({
            key: 'reader_whispers',
            value: JSON.stringify(updated),
            updated_at: new Date().toISOString()
          });
        return updated;
      } catch (e) {}
    }

    const existing = await siteService.getWhispers();
    const newWhisper = {
      id: Date.now(),
      sender: whisperData.sender || 'A Quiet Reader',
      text: whisperData.text,
      timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    const updated = [newWhisper, ...existing];
    try {
      localStorage.setItem('real_thing_author_messages', JSON.stringify(updated));
    } catch (e) {}
    return updated;
  },

  /**
   * Deletes a reader whisper by ID from Supabase & LocalStorage.
   */
  async deleteWhisper(id) {
    if (supabase) {
      try {
        await supabase
          .from('reader_whispers')
          .delete()
          .eq('id', id);
      } catch (err) {}
    }

    const existing = await siteService.getWhispers();
    const updated = existing.filter((w) => w.id !== id && String(w.id) !== String(id));
    try {
      localStorage.setItem('real_thing_author_messages', JSON.stringify(updated));
    } catch (e) {}

    if (supabase) {
      try {
        await supabase
          .from('site_settings')
          .upsert({
            key: 'reader_whispers',
            value: JSON.stringify(updated),
            updated_at: new Date().toISOString()
          });
      } catch (e) {}
    }

    return updated;
  }
};

export default siteService;
