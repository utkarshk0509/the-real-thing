import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { CACHE_KEYS } from '../../config/constants';
import readerProgressService from '../../services/readerProgressService';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, isCurator, login, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Profile Drawer Sub-Tabs State
  const [drawerTab, setDrawerTab] = useState('library'); // 'library' | 'quotes' | 'likes'
  const [libraryFilter, setLibraryFilter] = useState('Reading'); // 'Reading' | 'Saved' | 'Completed' | 'Want to Read' | 'Abandoned'

  const [readerStats, setReaderStats] = useState({ worksFinished: 0, commentsCount: 0, streakDays: 1 });
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [libraryStatuses, setLibraryStatuses] = useState({});

  useEffect(() => {
    if (isProfileOpen) {
      setReaderStats(readerProgressService.getReaderStats());
      setFavoriteQuotes(readerProgressService.getFavoriteQuotes());
      setLibraryStatuses(readerProgressService.getLibraryStatuses());
    }
  }, [isProfileOpen]);

  const handleCategoryNav = (targetPath) => {
    const isCategoryPage = ['/poems', '/stories', '/about'].includes(location.pathname);
    if (isCategoryPage) {
      navigate(targetPath, { replace: true });
    } else {
      navigate(targetPath);
    }
  };

  const handleGoogleLogin = async () => {
    await login();
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate('/hub');
  };

  const handleRemoveQuote = (id) => {
    const updated = readerProgressService.removeFavoriteQuote(id);
    setFavoriteQuotes(updated);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#080A06]/90 backdrop-blur-md border-b border-[#8A8177]/10 px-4 md:px-6 py-3.5 flex items-center justify-between">
        {/* Left Logo */}
        <Link to="/" className="font-serif text-base md:text-xl tracking-wider text-[#FEEFFF] hover:text-[#D5B06C] transition-colors whitespace-nowrap cursor-pointer">
          The Real Thing
        </Link>

        {/* Right side navigation items */}
        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => handleCategoryNav('/poems')}
            className="font-sans text-[11px] md:text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer"
          >
            Poems
          </button>
          <button
            onClick={() => handleCategoryNav('/stories')}
            className="font-sans text-[11px] md:text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer"
          >
            Stories
          </button>
          <button
            onClick={() => handleCategoryNav('/about')}
            className="hidden sm:inline-block font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer"
          >
            About
          </button>

          {isCurator && (
            <button
              onClick={() => {
                sessionStorage.setItem(CACHE_KEYS.AUTHOR_AUTH, 'true');
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

      {/* Reader Activity & Goodreads Personal Library Drawer */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-[#080A06]/75 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#0F1216] border-l border-[#8A8177]/20 p-6 flex flex-col justify-between h-full overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header User Info */}
                <div className="flex items-center justify-between border-b border-[#8A8177]/20 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/40'}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border border-[#D5B06C]/40"
                    />
                    <div>
                      <h3 className="font-serif text-lg text-[#FEEFFF]">{user?.user_metadata?.full_name || 'Reader'}</h3>
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

                {/* Reader Profile Action Stats (Streak, Books Finished, Comments) */}
                <div className="grid grid-cols-3 gap-2 bg-[#080A06]/80 p-3 rounded-xl border border-[#8A8177]/20 text-center">
                  <div>
                    <span className="block font-sans text-[9px] uppercase tracking-widest text-[#8A8177]">Finished</span>
                    <span className="font-serif text-lg text-[#D5B06C] font-semibold">{readerStats.worksFinished || 0}</span>
                  </div>
                  <div>
                    <span className="block font-sans text-[9px] uppercase tracking-widest text-[#8A8177]">Comments</span>
                    <span className="font-serif text-lg text-[#D5B06C] font-semibold">{readerStats.commentsCount || 0}</span>
                  </div>
                  <div>
                    <span className="block font-sans text-[9px] uppercase tracking-widest text-[#8A8177]">Streak</span>
                    <span className="font-serif text-lg text-[#D5B06C] font-semibold">{readerStats.streakDays || 1}d</span>
                  </div>
                </div>

                {/* Drawer View Tabs */}
                <div className="flex border-b border-[#8A8177]/20 gap-2 pb-1">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('library')}
                    className={`flex-1 py-1.5 text-center font-sans text-[10px] uppercase tracking-widest transition-colors cursor-pointer border-b-2 ${
                      drawerTab === 'library'
                        ? 'border-[#D5B06C] text-[#D5B06C]'
                        : 'border-transparent text-[#8A8177] hover:text-[#FEEFFF]'
                    }`}
                  >
                    Personal Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('quotes')}
                    className={`flex-1 py-1.5 text-center font-sans text-[10px] uppercase tracking-widest transition-colors cursor-pointer border-b-2 ${
                      drawerTab === 'quotes'
                        ? 'border-[#D5B06C] text-[#D5B06C]'
                        : 'border-transparent text-[#8A8177] hover:text-[#FEEFFF]'
                    }`}
                  >
                    Favorite Quotes ({favoriteQuotes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('likes')}
                    className={`flex-1 py-1.5 text-center font-sans text-[10px] uppercase tracking-widest transition-colors cursor-pointer border-b-2 ${
                      drawerTab === 'likes'
                        ? 'border-[#D5B06C] text-[#D5B06C]'
                        : 'border-transparent text-[#8A8177] hover:text-[#FEEFFF]'
                    }`}
                  >
                    Likes ({userData.likes.length})
                  </button>
                </div>

                {/* TAB 1: Goodreads Personal Library */}
                {drawerTab === 'library' && (
                  <div className="space-y-4">
                    {/* Goodreads Category Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {['Reading', 'Saved', 'Completed', 'Want to Read', 'Abandoned'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setLibraryFilter(cat)}
                          className={`px-2.5 py-1 rounded text-[9px] font-sans uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
                            libraryFilter === cat
                              ? 'bg-[#D5B06C]/20 border border-[#D5B06C] text-[#D5B06C]'
                              : 'bg-[#080A06] border border-[#8A8177]/20 text-[#8A8177]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Filtered Library List */}
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {Object.entries(libraryStatuses).filter(([_, status]) => status === libraryFilter).length === 0 ? (
                        <p className="text-center py-6 font-sans text-xs text-[#8A8177] italic">
                          No works currently marked as "{libraryFilter}".
                        </p>
                      ) : (
                        Object.entries(libraryStatuses)
                          .filter(([_, status]) => status === libraryFilter)
                          .map(([slug]) => (
                            <Link
                              key={slug}
                              to={`/read/${slug}`}
                              onClick={() => setIsProfileOpen(false)}
                              className="block p-3 rounded-lg bg-[#080A06]/70 border border-[#8A8177]/20 hover:border-[#D5B06C]/50 transition-colors"
                            >
                              <span className="font-serif text-sm text-[#FEEFFF] capitalize block">
                                {slug.replace(/-/g, ' ')}
                              </span>
                              <span className="font-sans text-[9px] uppercase tracking-widest text-[#D5B06C]">
                                Status: {libraryFilter}
                              </span>
                            </Link>
                          ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: Favorite Quotes Saver */}
                {drawerTab === 'quotes' && (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {favoriteQuotes.length === 0 ? (
                      <p className="text-center py-8 font-sans text-xs text-[#8A8177] italic">
                        No quotes saved yet. Highlight text in any work to save quotes!
                      </p>
                    ) : (
                      favoriteQuotes.map((q) => (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-lg bg-[#080A06]/70 border border-[#8A8177]/20 space-y-2 relative group"
                        >
                          <p className="font-serif text-xs text-[#FEEFFF] italic leading-relaxed">
                            "{q.quote}"
                          </p>
                          <div className="flex items-center justify-between font-sans text-[9px] uppercase tracking-widest text-[#8A8177]">
                            <span>— {q.author} ({q.workTitle})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuote(q.id)}
                              className="text-red-400 opacity-60 hover:opacity-100 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 3: Resonances / Likes */}
                {drawerTab === 'likes' && (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {userData.likes.length === 0 ? (
                      <p className="text-center py-8 font-sans text-xs text-[#8A8177] italic">
                        No liked works yet.
                      </p>
                    ) : (
                      userData.likes.map((w) => (
                        <Link
                          key={w.id || w.slug}
                          to={`/read/${w.slug}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="block p-3 rounded-lg bg-[#080A06]/60 border border-[#8A8177]/10 font-serif text-xs text-[#FEEFFF] hover:border-[#D5B06C]/40 transition-colors"
                        >
                          {w.title}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-500/20 border border-red-500/40 text-red-300 font-sans text-xs uppercase tracking-widest rounded hover:bg-red-500 hover:text-[#080A06] transition-colors cursor-pointer mt-4"
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