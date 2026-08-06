import { supabase } from '../lib/supabase';
import { PROJECTIONS } from '../config/constants';

export const commentService = {
  async getCommentsByWorkId(workId) {
    if (!workId || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(PROJECTIONS.COMMENT_LIST)
        .eq('work_id', workId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[commentService] Fetch comments error:', err);
    }

    return [];
  },

  async addComment(commentPayload) {
    const { work_id, author_alias, avatar_seed, content } = commentPayload;

    if (!supabase || !work_id) return null;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            work_id,
            author_alias: author_alias || 'Anonymous Reader',
            avatar_seed: avatar_seed || Math.random().toString(36).substring(2, 10),
            content,
            is_approved: true
          }
        ])
        .select(PROJECTIONS.COMMENT_LIST)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[commentService] Add comment error:', err);
    }

    return null;
  },

  async deleteComment(commentId) {
    if (!commentId || !supabase) return false;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      return !error;
    } catch (err) {
      console.warn('[commentService] Delete comment error:', err);
      return false;
    }
  }
};

export default commentService;
