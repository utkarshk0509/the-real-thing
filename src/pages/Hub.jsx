import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Shared/Navigation';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import { GlowingCard } from '../components/Shared/GlowingCard';

export const Hub = ({ filter }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active view based on route or prop
  const currentPath = filter || location.pathname;
  const isPoemsOnly = currentPath === '/poems';
  const isStoriesOnly = currentPath === '/stories';
  const isAboutOnly = currentPath === '/about';
  const isHome = currentPath === '/hub' || (!isPoemsOnly && !isStoriesOnly && !isAboutOnly);

  // Mock data structure
  const poems = [
    {
      slug: 'the-weight-of-feathers',
      title: 'The Weight of Feathers',
      author: 'Aureligious',
      readTime: '4 min',
      date: 'Aug 2026',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop'
    },
    {
      slug: 'ashes-without-smoke',
      title: 'Ashes Without Smoke',
      author: 'Aureligious',
      readTime: '3 min',
      date: 'Aug 2026',
      image: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=600&auto=format&fit=crop'
    },
    {
      slug: 'silence-before-rain',
      title: 'Silence Before Rain',
      author: 'Vesper',
      readTime: '5 min',
      date: 'Aug 2026',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'
    },
    {
      slug: 'where-we-used-to-be',
      title: 'Where We Used To Be',
      author: 'Veritas',
      readTime: '4 min',
      date: 'Aug 2026',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const stories = [
    {
      slug: 'mire',
      title: 'Mire',
      author: 'Etherealise',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=800&auto=format&fit=crop'
    },
    {
      slug: 'somnambulism',
      title: 'Somnambulism',
      author: 'Ellipsis',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop'
    }
  ];

  // Motion variants for smooth section enter/exit
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.08
      }
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF] pb-24">
      <AtmosphericBackground />
      <Navigation />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 space-y-12">
        <AnimatePresence mode="wait">
          {/* LATEST POEMS SECTION */}
          {(isHome || isPoemsOnly) && (
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
                  {isPoemsOnly ? 'All Poems' : 'Latest Poems'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {poems.map((poem) => (
                  <motion.div key={poem.slug} variants={itemVariants}>
                    <GlowingCard 
                      image={poem.image}
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
                        {poem.readTime} <span className="mx-1 text-[#D5B06C]">•</span> {poem.date}
                      </div>
                    </GlowingCard>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* STORIES SECTION */}
          {(isHome || isStoriesOnly) && (
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
                  {isStoriesOnly ? 'All Stories' : 'Stories'}
                </h2>
              </div>

              <div className="space-y-6">
                {stories.map((story) => (
                  <motion.div key={story.slug} variants={itemVariants}>
                    <GlowingCard 
                      image={story.image}
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
                          {story.readTime}
                        </div>
                      </div>
                    </GlowingCard>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ABOUT SECTION */}
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
                  About The Real Thing
                </h2>
              </div>
              <p className="font-serif text-lg leading-relaxed text-[#FEEFFF]/90">
                "The Real Thing" is an open-access literary sanctuary designed for poetry, prose, and quiet contemplation. Free from algorithms, distraction, and identity barriers.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Hub;