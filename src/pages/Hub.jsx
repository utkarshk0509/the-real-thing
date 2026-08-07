import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import Navigation from '../components/Shared/Navigation';
import CosmicNebulaBackground from '../components/Shared/CosmicNebulaBackground';
import { GlowingCard } from '../components/Shared/GlowingCard';
import BookshelfView from '../components/Hub/BookshelfView';
import AboutAuthorSanctuary from '../components/About/AboutAuthorSanctuary';
import useWorks from '../hooks/useWorks';
import siteService from '../services/siteService';
import readerProgressService from '../services/readerProgressService';

export const Hub = ({ filter }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { works, loading } = useWorks();
  const [aboutBio, setAboutBio] = useState('');
  const [lastRead, setLastRead] = useState(null);
  const [allProgress, setAllProgress] = useState({});
  const [viewMode, setViewMode] = useState(() => readerProgressService.getViewPreference());

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    readerProgressService.saveViewPreference(mode);
  };

  const currentPath = filter || location.pathname;
  const isPoemsOnly = currentPath === '/poems';
  const isStoriesOnly = currentPath === '/stories';
  const isAboutOnly = currentPath === '/about';

  useEffect(() => {
    const fetchLiveBio = async () => {
      const bio = await siteService.getAuthorBio();
      setAboutBio(bio);
    };

    if (isAboutOnly) {
      fetchLiveBio();
    }

    setAllProgress(readerProgressService.getAllProgress());

    const categoryFilter = isPoemsOnly ? 'poem' : isStoriesOnly ? 'story' : null;
    const savedLastRead = readerProgressService.getLastRead(categoryFilter);
    if (savedLastRead && savedLastRead.slug) {
      setLastRead(savedLastRead);
    } else {
      setLastRead(null);
    }
  }, [isAboutOnly, isPoemsOnly, isStoriesOnly, currentPath]);

  const poems = works.filter((w) => w.category === 'poem');
  const stories = works.filter((w) => w.category === 'story');

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.05 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  const CardSkeleton = () => (
    <div className="min-h-[125px] h-full rounded-xl border border-[#8A8177]/10 bg-[#0F1216]/50 p-6 flex flex-col justify-between animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-[#8A8177]/20 rounded w-1/2"></div>
        <div className="h-3 bg-[#8A8177]/10 rounded w-1/4"></div>
      </div>
      <div className="h-2 bg-[#8A8177]/10 rounded w-1/6"></div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF] pb-24"
    >
      <CosmicNebulaBackground variant={isAboutOnly ? 'about' : isStoriesOnly ? 'stories' : 'poems'} />
      <Navigation />

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-32 md:pt-36 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8A8177]/20 pb-4">
          <button
            onClick={() => {
              if (isPoemsOnly || isStoriesOnly || isAboutOnly) {
                navigate('/hub', { replace: true });
              } else {
                navigate('/', { replace: true });
              }
            }}
            className="group flex items-center gap-2 font-sans text-xs uppercase tracking-[0.25em] text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer bg-[#0F1216]/50 border border-[#8A8177]/20 hover:border-[#D5B06C]/40 px-4 py-2 rounded-lg backdrop-blur-sm self-start"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>
              {isPoemsOnly || isStoriesOnly || isAboutOnly ? 'Return to Constellation' : 'Return to Sanctuary'}
            </span>
          </button>

          {!isAboutOnly && (
            <div className="flex items-center gap-2 bg-[#0F1216]/60 border border-[#8A8177]/20 rounded-lg p-1 backdrop-blur-sm self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`px-3 py-1 rounded text-[10px] font-sans uppercase tracking-widest transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#D5B06C]/20 border border-[#D5B06C]/50 text-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Grid View
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('bookshelf')}
                className={`px-3 py-1 rounded text-[10px] font-sans uppercase tracking-widest transition-all cursor-pointer ${
                  viewMode === 'bookshelf'
                    ? 'bg-[#D5B06C]/20 border border-[#D5B06C]/50 text-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Animated Bookshelf
              </button>
            </div>
          )}
        </div>

        {lastRead && !isAboutOnly && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-[#0F1216] via-[#161B22] to-[#0F1216] border border-[#D5B06C]/40 shadow-[0_0_25px_rgba(213,176,108,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D5B06C] animate-pulse" />
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D5B06C]">
                  Continue Inscription Reading
                </span>
              </div>
              <h3 className="font-serif text-lg md:text-xl text-[#FEEFFF]">
                {lastRead.title}
              </h3>
            </div>
            <button
              onClick={() => navigate(`/read/${lastRead.slug}`)}
              className="px-5 py-2 rounded-full bg-[#D5B06C] text-[#080A06] font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#FEEFFF] transition-colors self-start sm:self-auto cursor-pointer shadow-md"
            >
              Resume Reading →
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'bookshelf' && !isAboutOnly ? (
              <motion.div
                key="bookshelf-mode"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <BookshelfView
                  works={isPoemsOnly ? poems : isStoriesOnly ? stories : works}
                  onSelectWork={(work) => navigate(`/read/${work.slug}`)}
                />
              </motion.div>
            ) : (
              <>
                {(isPoemsOnly || (!isStoriesOnly && !isAboutOnly)) && poems.length > 0 && (
                  <motion.section
                    key="poems-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4"
                  >
                    {!isPoemsOnly && (
                      <h2 className="font-serif text-xl md:text-2xl text-[#FEEFFF] border-b border-[#8A8177]/20 pb-2">
                        Poems
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {poems.map((poem) => (
                        <motion.div key={poem.slug} variants={itemVariants}>
                          <GlowingCard
                            image={poem.image_url}
                            cropScale={poem.crop_scale}
                            cropPosX={poem.crop_pos_x}
                            cropPosY={poem.crop_pos_y}
                            onClick={() => navigate(`/read/${poem.slug}`)}
                            className="min-h-[125px] h-full flex flex-col justify-between"
                          >
                            <div>
                              <h3 className="font-serif text-lg md:text-xl text-[#FEEFFF] group-hover:text-[#D5B06C] transition-colors leading-tight line-clamp-2">
                                {poem.title}
                              </h3>
                              <p className="font-sans text-xs text-[#D5B06C]/80 mt-1">
                                By {poem.author}
                              </p>
                            </div>

                            <div className="flex items-center justify-between font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-3 pt-1 border-t border-[#8A8177]/10">
                              <div>
                                {poem.read_time_minutes} min <span className="mx-1 text-[#D5B06C]">•</span> {new Date(poem.published_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </div>

                              <div className="flex items-center gap-3">
                                {allProgress[poem.slug] > 0 && (
                                  <span className="text-[#D5B06C] font-semibold border border-[#D5B06C]/30 px-1.5 py-0.5 rounded bg-[#D5B06C]/10">
                                    {allProgress[poem.slug]}%
                                  </span>
                                )}
                                {(poem.gilded_likes_count || 0) > 0 && (
                                  <span className="flex items-center gap-1 text-[#D5B06C] font-mono font-semibold">
                                    <Heart className="w-3 h-3 fill-[#D5B06C] text-[#D5B06C]" />
                                    <span>{poem.gilded_likes_count}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </GlowingCard>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {(isStoriesOnly || (!isPoemsOnly && !isAboutOnly)) && stories.length > 0 && (
                  <motion.section
                    key="stories-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4 pt-4"
                  >
                    {!isStoriesOnly && (
                      <h2 className="font-serif text-xl md:text-2xl text-[#FEEFFF] border-b border-[#8A8177]/20 pb-2">
                        Stories
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stories.map((story) => (
                        <motion.div key={story.slug} variants={itemVariants}>
                          <GlowingCard
                            image={story.image_url}
                            cropScale={story.crop_scale}
                            cropPosX={story.crop_pos_x}
                            cropPosY={story.crop_pos_y}
                            onClick={() => navigate(`/read/${story.slug}`)}
                            className="min-h-[125px] h-full flex flex-col justify-between"
                          >
                            <div>
                              <h3 className="font-serif text-lg md:text-xl text-[#FEEFFF] group-hover:text-[#7CB9E8] transition-colors leading-tight line-clamp-2">
                                {story.title}
                              </h3>
                              <p className="font-sans text-xs text-[#7CB9E8]/80 mt-1">
                                By {story.author}
                              </p>
                            </div>

                            <div className="flex items-center justify-between font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-3 pt-1 border-t border-[#8A8177]/10">
                              <div>
                                {story.read_time_minutes} min <span className="mx-1 text-[#7CB9E8]">•</span> {new Date(story.published_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </div>

                              <div className="flex items-center gap-3">
                                {allProgress[story.slug] > 0 && (
                                  <span className="text-[#7CB9E8] font-semibold border border-[#7CB9E8]/30 px-1.5 py-0.5 rounded bg-[#7CB9E8]/10">
                                    {allProgress[story.slug]}%
                                  </span>
                                )}
                                {(story.gilded_likes_count || 0) > 0 && (
                                  <span className="flex items-center gap-1 text-[#D5B06C] font-mono font-semibold">
                                    <Heart className="w-3 h-3 fill-[#D5B06C] text-[#D5B06C]" />
                                    <span>{story.gilded_likes_count}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </GlowingCard>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {isAboutOnly && (
                  <motion.section
                    key="about-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <AboutAuthorSanctuary works={works} bio={aboutBio} />
                  </motion.section>
                )}
              </>
            )}
          </AnimatePresence>
        )}
      </main>
    </motion.div>
  );
};

export default Hub;