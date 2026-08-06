import { useState, useEffect, useCallback } from 'react';
import workService from '../services/workService';
import { supabase } from '../lib/supabase';

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

    if (supabase && slug) {
      const channel = supabase
        .channel(`realtime_work_${slug}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'works' }, (payload) => {
          if (payload.new && (payload.new.slug === slug || payload.new.id === work?.id)) {
            setWork((prev) => (prev ? { ...prev, gilded_likes_count: payload.new.gilded_likes_count } : prev));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [slug, fetchWork, work?.id]);

  const handleToggleLike = async (isLiking, increment) => {
    if (!work?.id) throw new Error('Work ID not available');

    const newCountFromServer = await workService.incrementLikes(work.id, increment);

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
