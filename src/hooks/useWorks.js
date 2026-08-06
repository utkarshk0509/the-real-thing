import { useState, useEffect, useCallback } from 'react';
import workService from '../services/workService';
import cacheService from '../services/cacheService';
import { CACHE_KEYS } from '../config/constants';

import { supabase } from '../lib/supabase';

export const useWorks = () => {
  // Read instant cache for 0ms page loads (stale-while-revalidate)
  const getCached = () => cacheService.get(CACHE_KEYS.HUB_WORKS) || [];

  const [works, setWorks] = useState(getCached);
  const [loading, setLoading] = useState(true); // Initial load state
  const [error, setError] = useState(null);

  const fetchWorks = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await workService.getPublishedWorks();
      setWorks(data);
      setError(null);
    } catch (err) {
      console.warn('[useWorks] Fetch error:', err);
      setError(err);
      const cached = getCached();
      if (cached.length > 0) setWorks(cached);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks(false);

    if (supabase) {
      const channel = supabase
        .channel('realtime_works_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'works' }, (payload) => {
          // Perform instant in-place state mutation for silky smooth zero-flicker real-time update
          if (payload.new) {
            setWorks((prev) =>
              prev.map((w) =>
                w.id === payload.new.id || w.slug === payload.new.slug
                  ? { ...w, ...payload.new }
                  : w
              )
            );
          }
          // Perform silent background refetch without triggering loading state (prevents skeleton cards flicker)
          fetchWorks(true);
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

