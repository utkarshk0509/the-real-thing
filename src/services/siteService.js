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
          .single();

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
  }
};

export default siteService;
