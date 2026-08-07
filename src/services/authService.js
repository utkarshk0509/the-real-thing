import { supabase } from '../lib/supabase';
import { CURATOR_EMAIL, CACHE_KEYS } from '../config/constants';
import readerProgressService from './readerProgressService';

export const authService = {
  async signInWithGoogle() {
    if (!supabase) return;

    const redirectTo = window.location.origin + '/hub';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(CACHE_KEYS.AUTHOR_AUTH);
    readerProgressService.setUserScope(null);
  },

  async getSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      readerProgressService.setUserScope(session.user.id);
    }
    return session;
  },

  onAuthStateChange(callback) {
    if (!supabase) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      readerProgressService.setUserScope(u?.id ?? null);
      if (u?.email === CURATOR_EMAIL) {
        sessionStorage.setItem(CACHE_KEYS.AUTHOR_AUTH, 'true');
      } else {
        sessionStorage.removeItem(CACHE_KEYS.AUTHOR_AUTH);
      }
      callback(event, session);
    });
    return subscription;
  },

  isCurator(user) {
    if (sessionStorage.getItem(CACHE_KEYS.AUTHOR_AUTH) === 'true') return true;
    if (user && CURATOR_EMAIL && user.email === CURATOR_EMAIL) return true;
    return false;
  },

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
