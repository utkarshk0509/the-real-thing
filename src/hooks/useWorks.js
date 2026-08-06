import { useState, useEffect, useCallback } from 'react';
import workService from '../services/workService';
import cacheService from '../services/cacheService';
import { CACHE_KEYS } from '../config/constants';
import { supabase } from '../lib/supabase';

export const useWorks = () => {
  const getCached = () => cacheService.get(CACHE_KEYS.HUB_WORKS) || [];

  const [works, setWorks] = useState(getCached);
  const [loading, setLoading] = useState(true);
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
      const cached = getCached();
      if (cached.length > 0) setWorks(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();

    if (supabase) {
      const channel = supabase
        .channel('realtime_works_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'works' }, () => {
          fetchWorks();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchWorks]);

  return { works, loading, error, refetch: fetchWorks };
};

export default useWorks;
