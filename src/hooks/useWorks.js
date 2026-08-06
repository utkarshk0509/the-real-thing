import { useState, useEffect, useCallback } from 'react';
import workService from '../services/workService';
import cacheService from '../services/cacheService';
import { CACHE_KEYS } from '../config/constants';

export const useWorks = () => {
  // Read instant cache for 0ms page loads
  const getCached = () => cacheService.get(CACHE_KEYS.HUB_WORKS) || [];

  const [works, setWorks] = useState(getCached);
  const [loading, setLoading] = useState(() => getCached().length === 0);
  const [error, setError] = useState(null);

  const fetchWorks = useCallback(async () => {
    try {
      if (works.length === 0) setLoading(true);
      const data = await workService.getPublishedWorks();
      setWorks(data);
      setError(null);
    } catch (err) {
      console.warn('[useWorks] Fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [works.length]);

  useEffect(() => {
    fetchWorks();
  }, []);

  return { works, loading, error, refetch: fetchWorks };
};

export default useWorks;
