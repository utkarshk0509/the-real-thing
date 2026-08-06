class CacheService {
  constructor() {
    this.memoryCache = new Map();
  }

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

  set(key, data) {
    this.memoryCache.set(key, data);
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[CacheService] Write notice for key "${key}":`, e);
    }
  }

  invalidate(key) {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[CacheService] Invalidate notice for key "${key}":`, e);
    }
  }

  clear() {
    this.memoryCache.clear();
  }
}

export const cacheService = new CacheService();
export default cacheService;
