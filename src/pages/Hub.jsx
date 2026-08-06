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
    <div className="h-[110px] rounded-xl border border-[#8A8177]/10 bg-[#0F1216]/50 p-6 flex flex-col justify-between animate-pulse">
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
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#D5B06C] font-medium">
                Continue Reading
              </span>
              <h3 className="font-serif text-xl text-[#FEEFFF]">{lastRead.title}</h3>
              <p className="font-sans text-xs text-[#8A8177]">
                By {lastRead.author} • {lastRead.scrollPercentage || 0}% Completed
              </p>
            </div>

            <button
              onClick={() => navigate(`/read/${lastRead.slug}`)}
              className="px-5 py-2.5 rounded-lg bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto shadow-md"
            >
              Resume Inscription →
            </button>
          </motion.div>
        )}

        {loading && !isAboutOnly ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : works.length === 0 && !isAboutOnly ? (
          <div className="text-center py-24 space-y-4">
            <h3 className="font-serif text-2xl text-[#8A8177]">The Sanctuary is Silent</h3>
            <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]/60">
              No inscriptions published yet.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'bookshelf' && !isAboutOnly ? (
              <motion.div
                key="bookshelf-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BookshelfView
                  works={isPoemsOnly ? poems : isStoriesOnly ? stories : works}
                  onSelectWork={(w) => navigate(`/read/${w.slug}`)}
                />
              </motion.div>
            ) : (
              <>
                {(currentPath === '/hub' || isPoemsOnly) && (
                  <motion.section
                    key="poems-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 border-l-2 border-[#D5B06C] pl-3">
                      <h2 className="font-sans text-sm md:text-base font-medium uppercase tracking-[0.3em] text-[#D5B06C]">
                        All Poems
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {poems.map((poem) => (
                        <motion.div key={poem.slug} variants={itemVariants}>
                          <GlowingCard
                            image={poem.image_url}
                            cropScale={poem.crop_scale}
                            cropPosX={poem.crop_pos_x}
                            cropPosY={poem.crop_pos_y}
                            onClick={() => navigate(`/read/${poem.slug}`)}
                            className="h-[110px]"
                          >
                            <div>
                              <h3 className="font-serif text-lg md:text-xl text-[#FEEFFF] group-hover:text-[#D5B06C] transition-colors">
                                {poem.title}
                              </h3>
                              <p className="font-sans text-xs text-[#D5B06C]/80 mt-1">
                                By {poem.author}
                              </p>
                            </div>
                            <div className="flex items-center justify-between font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                              <div className="flex items-center gap-2">
                                <span>{poem.read_time_minutes} min <span className="mx-1 text-[#D5B06C]">•</span> {new Date(poem.published_at || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                <span className="inline-flex items-center gap-1 bg-[#D5B06C]/10 border border-[#D5B06C]/30 px-2 py-0.5 rounded-full text-[#D5B06C] font-sans text-[9px] font-medium lowercase tracking-normal">
                                  <Heart className="w-2.5 h-2.5 fill-[#D5B06C]" />
                                  <span>{poem.gilded_likes_count || poem.gildedLikesCount || 0}</span>
                                </span>
                              </div>
                              {allProgress[poem.slug] > 0 && (
                                <span className="inline-flex items-center gap-1 bg-[#D5B06C]/10 border border-[#D5B06C]/40 px-2 py-0.5 rounded-full text-[#D5B06C] font-sans text-[9px] uppercase tracking-widest font-semibold shadow-[0_0_10px_rgba(213,176,108,0.2)]">
                                  <span>{allProgress[poem.slug] >= 90 ? '100% Completed' : `${allProgress[poem.slug]}% Read`}</span>
                                </span>
                              )}
                            </div>
                          </GlowingCard>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {(currentPath === '/hub' || isStoriesOnly) && (
                  <motion.section
                    key="stories-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 border-l-2 border-[#D5B06C] pl-3">
                      <h2 className="font-sans text-sm md:text-base font-medium uppercase tracking-[0.3em] text-[#D5B06C]">
                        Stories
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {stories.map((story) => (
                        <motion.div key={story.slug} variants={itemVariants}>
                          <GlowingCard
                            image={story.image_url}
                            cropScale={story.crop_scale}
                            cropPosX={story.crop_pos_x}
                            cropPosY={story.crop_pos_y}
                            onClick={() => navigate(`/read/${story.slug}`)}
                            className="h-[110px]"
                          >
                            <div className="flex flex-col justify-between h-full">
                              <div>
                                <h3 className="font-serif text-xl md:text-2xl text-[#FEEFFF] group-hover:text-[#D5B06C] transition-colors">
                                  {story.title}
                                </h3>
                                <p className="font-sans text-xs text-[#D5B06C]/80 mt-1">
                                  By {story.author}
                                </p>
                              </div>
                              <div className="flex items-center justify-between font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                                <div className="flex items-center gap-2">
                                  <span>{story.read_time_minutes} min read</span>
                                  <span className="inline-flex items-center gap-1 bg-[#D5B06C]/10 border border-[#D5B06C]/30 px-2 py-0.5 rounded-full text-[#D5B06C] font-sans text-[9px] font-medium lowercase tracking-normal">
                                    <Heart className="w-2.5 h-2.5 fill-[#D5B06C]" />
                                    <span>{story.gilded_likes_count || story.gildedLikesCount || 0}</span>
                                  </span>
                                </div>
                                {allProgress[story.slug] > 0 && (
                                  <span className="inline-flex items-center gap-1 bg-[#7CB9E8]/10 border border-[#7CB9E8]/40 px-2 py-0.5 rounded-full text-[#7CB9E8] font-sans text-[9px] uppercase tracking-widest font-semibold shadow-[0_0_10px_rgba(124,185,232,0.2)]">
                                    <span>{allProgress[story.slug] >= 90 ? '100% Completed' : `${allProgress[story.slug]}% Read`}</span>
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