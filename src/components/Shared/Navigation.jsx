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

  const CURATOR_EMAIL = import.meta.env.VITE_CURATOR_EMAIL || '';
  const isCurator = user && (user.email === CURATOR_EMAIL || sessionStorage.getItem('real_thing_author_auth') === 'true');

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchUserData(session.user.id);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
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

    const { data: likes } = await supabase
      .from('user_likes')
      .select('work_id, works(*)')
      .eq('user_id', userId);

    const { data: comments } = await supabase
      .from('comments')
      .select('*, works(title, slug)')
      .eq('user_id', userId);

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
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#080A06]/90 backdrop-blur-md border-b border-[#8A8177]/10 px-4 md:px-6 py-3.5 flex items-center justify-between">
        {/* Left Logo - Prevent line wrapping on mobile */}
        <Link to="/" className="font-serif text-base md:text-xl tracking-wider text-[#FEEFFF] hover:text-[#D5B06C] transition-colors whitespace-nowrap cursor-pointer">
          The Real Thing
        </Link>

        {/* Right side navigation items */}
        <div className="flex items-center gap-3 md:gap-6">
          <Link to="/poems" className="font-sans text-[11px] md:text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors">
            Poems
          </Link>
          <Link to="/stories" className="font-sans text-[11px] md:text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors">
            Stories
          </Link>
          <Link to="/about" className="hidden sm:inline-block font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors">
            About
          </Link>

          {isCurator && (
            <button
              onClick={() => {
                sessionStorage.setItem('real_thing_author_auth', 'true');
                navigate('/portal');
              }}
              className="px-2.5 py-1 rounded border border-[#D5B06C]/40 text-[#D5B06C] font-sans text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-[#D5B06C] hover:text-[#080A06] transition-colors cursor-pointer"
            >
              Portal
            </button>
          )}

          {user ? (
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1 rounded-full border border-[#D5B06C]/40 hover:border-[#D5B06C] transition-colors cursor-pointer"
            >
              <img
                src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/32'}
                alt="Avatar"
                className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover"
              />
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-3 py-1.5 rounded border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-[10px] md:text-xs uppercase tracking-widest hover:border-[#D5B06C] hover:text-[#D5B06C] transition-colors cursor-pointer"
            >
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

                <div className="space-y-3">
                  <h4 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C]">
                    Resonances / Liked ({userLikes.length})
                  </h4>
                  {userLikes.map((w) => (
                    <Link
                      key={w.id}
                      to={`/read/${w.slug}`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block p-2 rounded bg-[#080A06]/60 border border-[#8A8177]/10 font-serif text-xs text-[#FEEFFF]"
                    >
                      {w.title}
                    </Link>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-500/20 border border-red-500/40 text-red-300 font-sans text-xs uppercase tracking-widest rounded hover:bg-red-500 hover:text-[#080A06] transition-colors cursor-pointer"
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