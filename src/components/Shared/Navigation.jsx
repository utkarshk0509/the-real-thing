import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userLikes, setUserLikes] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userWorks, setUserWorks] = useState([]);

  // Check if logged-in user is designated curator
  const CURATOR_EMAIL = import.meta.env.VITE_CURATOR_EMAIL || '';
  const isCurator = user && (user.email === CURATOR_EMAIL || sessionStorage.getItem('real_thing_author_auth') === 'true');

  useEffect(() => {
    // Get current auth session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchUserData(session.user.id);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
          // If curator logs in, grant portal access
          if (session.user.email === CURATOR_EMAIL) {
            sessionStorage.setItem('real_thing_author_auth', 'true');
          }
        }
      });

      return () => authListener?.subscription?.unsubscribe();
    }
  }, []);

  const fetchUserData = async (userId) => {
    if (!supabase) return;

    // Fetch Liked Works
    const { data: likes } = await supabase
      .from('user_likes')
      .select('work_id, works(*)')
      .eq('user_id', userId);

    // Fetch User Comments
    const { data: comments } = await supabase
      .from('comments')
      .select('*, works(title, slug)')
      .eq('user_id', userId);

    // Fetch Personal Saved Works / Drafts
    const { data: works } = await supabase
      .from('works')
      .select('*')
      .eq('user_id', userId);

    if (likes) setUserLikes(likes.map((l) => l.works).filter(Boolean));
    if (comments) setUserComments(comments);
    if (works) setUserWorks(works);
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin + '/hub' 
      }
    });
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    sessionStorage.removeItem('real_thing_author_auth');
    setUser(null);
    setIsProfileOpen(false);
    navigate('/hub');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#080A06]/80 backdrop-blur-md border-b border-[#8A8177]/10 px-6 py-4 flex items-center justify-between">
        <Link to="/hub" className="font-serif text-xl tracking-wider text-[#FEEFFF] hover:text-[#D5B06C] transition-colors">
          The Real Thing
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/poems" className="font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors">
            Poems
          </Link>
          <Link to="/stories" className="font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors">
            Stories
          </Link>
          <Link to="/about" className="font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors">
            About
          </Link>

          {/* Curator Direct Portal Button (Only visible if logged in as Curator) */}
          {isCurator && (
            <button
              onClick={() => {
                sessionStorage.setItem('real_thing_author_auth', 'true');
                navigate('/portal');
              }}
              className="px-3 py-1 rounded border border-[#D5B06C]/40 text-[#D5B06C] font-sans text-[10px] uppercase tracking-widest hover:bg-[#D5B06C] hover:text-[#080A06] transition-colors cursor-pointer"
            >
              Curator Portal
            </button>
          )}

          {/* Google Auth / Reader Profile Drawer Trigger */}
          {user ? (
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1 rounded-full border border-[#D5B06C]/40 hover:border-[#D5B06C] transition-colors cursor-pointer"
            >
              <img
                src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/32'}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 px-4 py-1.5 rounded border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs uppercase tracking-widest hover:border-[#D5B06C] hover:text-[#D5B06C] transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Reader Activity Drawer */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-[#080A06]/70 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#0F1216] border-l border-[#8A8177]/20 p-6 flex flex-col justify-between h-full overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#8A8177]/20 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.user_metadata?.avatar_url}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border border-[#D5B06C]/40"
                    />
                    <div>
                      <h3 className="font-serif text-lg text-[#FEEFFF]">{user?.user_metadata?.full_name}</h3>
                      <p className="font-sans text-[10px] text-[#8A8177]">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="text-[#8A8177] hover:text-[#FEEFFF] font-sans text-xs uppercase cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Liked Poems */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C]">
                    Resonances / Liked Poems ({userLikes.length})
                  </h4>
                  {userLikes.length === 0 ? (
                    <p className="font-sans text-[10px] text-[#8A8177] italic">No liked works yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userLikes.map((w) => (
                        <Link
                          key={w.id}
                          to={`/read/${w.slug}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="block p-2 rounded bg-[#080A06]/60 border border-[#8A8177]/10 hover:border-[#D5B06C]/40 font-serif text-xs text-[#FEEFFF]"
                        >
                          {w.title} <span className="text-[#8A8177] font-sans text-[9px]">• By {w.author}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Commented Poems */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C]">
                    Reflections / Commented Poems ({userComments.length})
                  </h4>
                  {userComments.length === 0 ? (
                    <p className="font-sans text-[10px] text-[#8A8177] italic">No comments posted yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userComments.map((c) => (
                        <Link
                          key={c.id}
                          to={`/read/${c.works?.slug}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="block p-2 rounded bg-[#080A06]/60 border border-[#8A8177]/10 hover:border-[#D5B06C]/40"
                        >
                          <p className="font-serif text-xs text-[#FEEFFF]">"{c.content}"</p>
                          <span className="text-[#8A8177] font-sans text-[9px]">On: {c.works?.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Personal Saved Works / Drafts */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C]">
                    My Inscriptions & Drafts ({userWorks.length})
                  </h4>
                  {userWorks.length === 0 ? (
                    <p className="font-sans text-[10px] text-[#8A8177] italic">No personal works saved.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userWorks.map((w) => (
                        <div key={w.id} className="p-2 rounded bg-[#080A06]/60 border border-[#8A8177]/10 flex justify-between items-center">
                          <span className="font-serif text-xs text-[#FEEFFF]">{w.title}</span>
                          <span className="text-[9px] font-sans uppercase text-[#8A8177]">{w.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-500/20 border border-red-500/40 text-red-300 font-sans text-xs uppercase tracking-widest rounded hover:bg-red-500 hover:text-[#080A06] transition-colors cursor-pointer mt-6"
              >
                Sign Out
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;