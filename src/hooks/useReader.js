import { useState, useEffect, useCallback } from 'react';
import workService from '../services/workService';
import cacheService from '../services/cacheService';
import { CACHE_KEYS } from '../config/constants';

export const useReader = (slug) => {
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWork = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await workService.getWorkBySlug(slug);
      setWork(data);
      setError(null);
    } catch (err) {
      console.warn('[useReader] Error fetching work by slug:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchWork();
  }, [slug, fetchWork]);

  const handleToggleLike = async (isLiking, newCount) => {
    if (!work) return;

    const updatedWork = { ...work, gilded_likes_count: newCount };
    setWork(updatedWork);

    // Update local cache
    const localWorks = cacheService.get(CACHE_KEYS.CUSTOM_WORKS) || [];
    const updatedLocal = localWorks.map((w) => (w.slug === slug ? updatedWork : w));
    cacheService.set(CACHE_KEYS.CUSTOM_WORKS, updatedLocal);

    // Atomic RPC update
    if (work.id) {
      const incrementBy = isLiking ? 1 : -1;
      await workService.incrementLikes(work.id, incrementBy);
    }
  };

  return { work, loading, error, setWork, handleToggleLike, refetch: fetchWork };
};

export default useReader;
