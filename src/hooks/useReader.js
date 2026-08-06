import { useState, useEffect, useCallback } from 'react';
import workService from '../services/workService';

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

  /**
   * Called by GildedHeart with (isLiking: bool, increment: +1 | -1).
   * Sends the delta to Supabase via RPC.
   * Throws on failure so GildedHeart can roll back its optimistic UI.
   */
  const handleToggleLike = async (isLiking, increment) => {
    if (!work?.id) throw new Error('Work ID not available');

    // RPC returns the new authoritative count from the DB
    const newCountFromServer = await workService.incrementLikes(work.id, increment);

    // Update in-memory work with the server's authoritative count if returned,
    // otherwise fall back to a local ±1 estimate.
    setWork((prev) => {
      if (!prev) return prev;
      const authoritative = typeof newCountFromServer === 'number' ? newCountFromServer : Math.max(0, (prev.gilded_likes_count || 0) + increment);
      return { ...prev, gilded_likes_count: authoritative };
    });

    return newCountFromServer;
  };

  return { work, loading, error, setWork, handleToggleLike, refetch: fetchWork };
};

export default useReader;
