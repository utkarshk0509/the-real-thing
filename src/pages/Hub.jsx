import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Shared/Navigation';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import { GlowingCard } from '../components/Shared/GlowingCard';
import { supabase } from '../lib/supabase';

export const Hub = ({ filter }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Load local cache immediately for instant 0ms painting (works for both poems and stories)
  const getCachedWorks = () => {
    try {
      const cached = localStorage.getItem('real_thing_cached_hub_works');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Initial cache read error:', e);
    }
    return [];
  };

  const [works, setWorks] = useState(getCachedWorks);
  // If we already have cached works, loading is false instantly!
  const [loading, setLoading] = useState(() => getCachedWorks().length === 0);
  const [aboutBio, setAboutBio] = useState('');

  const currentPath = filter || location.pathname;
  const isPoemsOnly = currentPath === '/poems';
  const isStoriesOnly = currentPath === '/stories';
  const isAboutOnly = currentPath === '/about';

  // Instant Cache + Self-Caching Background Sync
  useEffect(() => {
    const loadAllWorks = async () => {
      let remoteWorks = [];

      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('works')
            .select('slug, title, category, author, image_url, published_at, read_time_minutes, status, sort_order')
            .eq('status', 'published');

          if (!error && data) remoteWorks = data;
        }
      } catch (err) {
        console.warn('Supabase fetch failed:', err.message);
      }

      const localCustom = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
      
      const map = new Map();
      [...remoteWorks, ...localCustom].forEach((item) => {
        if (item.status === 'published') {
          map.set(item.slug, item);
        }
      });

      let uniqueWorks = Array.from(map.values());
      uniqueWorks.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      if (uniqueWorks.length > 0) {
        setWorks(uniqueWorks);
        setLoading(false);
        // Self-cache immediately so future reloads/visits to poems & stories are instant
        try {
          localStorage.setItem('real_thing_cached_hub_works', JSON.stringify(uniqueWorks));
        } catch (e) {
          console.warn('Cache write notice:', e);
        }
      }
    };

    loadAllWorks();
  }, [location.pathname]);

  // Fetch live About Bio instantly
  useEffect(() => {
    const fetchLiveBio = async () => {
      const cachedBio = localStorage.getItem('real_thing_author_bio');
      if (cachedBio) setAboutBio(cachedBio);

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'author_bio')
            .single();

          if (!error && data?.value) {
            setAboutBio(data.value);
            localStorage.setItem('real_thing_author_bio', data.value);
          }
        } catch (err) {
          console.warn('Cloud bio fetch warning:', err);
        }
      }
    };

    if (isAboutOnly) {
      fetchLiveBio();
    }
  }, [isAboutOnly]);

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
      <AtmosphericBackground />
      <Navigation />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-36 md:pt-45 space-y-10">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/hub')}
            className="group flex items-center gap-2 font-sans text-xs uppercase tracking-[0.25em] text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer bg-[#0F1216]/50 border border-[#8A8177]/20 hover:border-[#D5B06C]/40 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Return to Constellation</span>
          </button>
        </div>

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
            {isPoemsOnly && (
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
                        <div className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                          {poem.read_time_minutes} min <span className="mx-1 text-[#D5B06C]">•</span> {new Date(poem.published_at || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </div>
                      </GlowingCard>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {isStoriesOnly && (
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
                          <div className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                            {story.read_time_minutes} min read
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
                className="space-y-6 max-w-2xl mx-auto py-12 text-center"
              >
                <div className="border-b border-[#D5B06C]/30 pb-4 inline-block">
                  <h2 className="font-sans text-sm md:text-base font-medium uppercase tracking-[0.3em] text-[#D5B06C]">
                    About the Author
                  </h2>
                </div>
                <p className="font-serif text-lg leading-relaxed text-[#FEEFFF]/90 whitespace-pre-line">
                  {aboutBio || '"The Real Thing" is an open-access literary sanctuary designed for poetry, prose, and quiet contemplation.'}
                </p>
              </motion.section>
            )}
          </AnimatePresence>
        )}
      </main>
    </motion.div>
  );
};

export default Hub;