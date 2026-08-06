import { useState, useEffect, useCallback } from 'react';
import workService from '../services/workService';
import cacheService from '../services/cacheService';
import { CACHE_KEYS } from '../config/constants';

export const useWorks = () => {
  // Read instant cache for 0ms page loads (stale-while-revalidate)
  const getCached = () => cacheService.get(CACHE_KEYS.HUB_WORKS) || [];

  const [works, setWorks] = useState(getCached);
  const [loading, setLoading] = useState(true); // Always start loading to ensure fresh fetch
  const [error, setError] = useState(null);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workService.getPublishedWorks();
      setWorks(data);
      setError(null);
    } catch (err) {
      console.warn('[useWorks] Fetch error:', err);
      setError(err);
      // Fall back to whatever is cached
      const cached = getCached();
      if (cached.length > 0) setWorks(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, []);

  return { works, loading, error, refetch: fetchWorks };
};

export default useWorks;

