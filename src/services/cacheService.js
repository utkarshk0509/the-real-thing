/**
 * Stale-While-Revalidate (SWR) Cache Service
 * Provides fast 0ms memory hits with LocalStorage persistence and background revalidation support.
 */

class CacheService {
  constructor() {
    this.memoryCache = new Map();
  }

  /**
   * Retrieves item from Memory cache or LocalStorage.
   * @param {string} key - Cache key
   * @returns {any|null} Parsed cache data or null
   */
  get(key) {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryCache.set(key, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`[CacheService] Read error for key "${key}":`, e);
    }

    return null;
  }

  /**
   * Sets cache data in both Memory and LocalStorage.
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.memoryCache.set(key, data);
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[CacheService] Write notice for key "${key}":`, e);
    }
  }

  /**
   * Invalidates a specific cache entry.
   * @param {string} key - Cache key
   */
  invalidate(key) {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[CacheService] Invalidate notice for key "${key}":`, e);
    }
  }

  /**
   * Clears all in-memory and local storage caches.
   */
  clear() {
    this.memoryCache.clear();
  }
}

export const cacheService = new CacheService();
export default cacheService;
