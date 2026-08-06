import { useState, useEffect, useCallback } from 'react';
import commentService from '../services/commentService';

export const useComments = (workId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!workId) {
      setComments([]);
      return;
    }
    setLoading(true);
    try {
      const data = await commentService.getCommentsByWorkId(workId);
      setComments(data);
    } catch (err) {
      console.warn('[useComments] Fetch comments error:', err);
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => {
    fetchComments();
  }, [workId, fetchComments]);

  const addComment = async (commentData) => {
    const optimisticComment = {
      id: Date.now().toString(),
      work_id: workId,
      ...commentData,
      created_at: new Date().toISOString()
    };

    setComments((prev) => [optimisticComment, ...prev]);

    if (workId) {
      const savedComment = await commentService.addComment({
        work_id: workId,
        ...commentData
      });

      if (savedComment) {
        setComments((prev) =>
          prev.map((c) => (c.id === optimisticComment.id ? savedComment : c))
        );
      }
    }
  };

  const deleteComment = async (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await commentService.deleteComment(commentId);
  };

  return { comments, loading, addComment, deleteComment, refetch: fetchComments };
};

export default useComments;
