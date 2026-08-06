import { supabase } from '../lib/supabase';
import { CURATOR_EMAIL, CACHE_KEYS } from '../config/constants';

export const authService = {
  /**
   * Triggers Google OAuth sign-in flow.
   */
  async signInWithGoogle() {
    if (!supabase) return;

    const redirectTo = window.location.origin + '/hub';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
  },

  /**
   * Signs out current user session.
   */
  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(CACHE_KEYS.AUTHOR_AUTH);
  },

  /**
   * Gets current active auth session.
   */
  async getSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Subscribes to auth state changes.
   */
  onAuthStateChange(callback) {
    if (!supabase) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email === CURATOR_EMAIL) {
        sessionStorage.setItem(CACHE_KEYS.AUTHOR_AUTH, 'true');
      }
      callback(event, session);
    });
    return subscription;
  },

  /**
   * Checks if current user has Curator/Admin permissions.
   */
  isCurator(user) {
    if (sessionStorage.getItem(CACHE_KEYS.AUTHOR_AUTH) === 'true') return true;
    if (user && CURATOR_EMAIL && user.email === CURATOR_EMAIL) return true;
    return false;
  },

  /**
   * Fetches user's activity metrics (likes, comments, works) for navigation drawer.
   */
  async fetchUserData(userId) {
    if (!supabase || !userId) return { likes: [], comments: [], works: [] };

    try {
      const { data: likes } = await supabase
        .from('user_likes')
        .select('work_id, works(id, title, slug)')
        .eq('user_id', userId);

      const { data: comments } = await supabase
        .from('comments')
        .select('*, works(title, slug)')
        .eq('user_id', userId);

      const { data: works } = await supabase
        .from('works')
        .select('id, title, slug')
        .eq('user_id', userId);

      return {
        likes: likes ? likes.map((l) => l.works).filter(Boolean) : [],
        comments: comments || [],
        works: works || []
      };
    } catch (err) {
      console.warn('[authService] User data fetch error:', err);
      return { likes: [], comments: [], works: [] };
    }
  }
};

export default authService;
