import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
];

export const CinematicPoetryArchiveView = ({ works, onSelectWork }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!works || works.length === 0) return null;

  const currentPoem = works[activeIndex] || works[0];
  const total = works.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  const currentImage = currentPoem.image_url || FALLBACK_THUMBNAILS[activeIndex % FALLBACK_THUMBNAILS.length];
  const readTime = currentPoem.read_time_minutes || 2;
  const authorName = (currentPoem.author || 'UTKARSH').toUpperCase();
  const excerptText = currentPoem.excerpt
    ? currentPoem.excerpt.replace(/\n+/g, ' ').slice(0, 110)
    : 'I never knew when the person I was afraid of... became me.';

  return (
    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-[#8A8177]/25 bg-[#050608] shadow-[0_20px_50px_rgba(0,0,0,0.9)] my-6">
      {/* Top Controls: 01 / 09, PREV, NEXT */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="font-mono text-xs text-[#D5B06C] tracking-widest font-medium">
          {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-[0.25em] text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>PREV</span>
          </button>
          <span className="text-white/20">|</span>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-[0.25em] text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer"
          >
            <span>NEXT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Cinematic Backdrop & Featured Poem Section */}
      <div className="relative min-h-[460px] md:min-h-[520px] flex flex-col justify-between p-6 md:p-12 overflow-hidden">
        {/* Full-bleed atmospheric background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPoem.slug || activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0"
          >
            <img
              src={currentImage}
              alt={currentPoem.title}
              className="w-full h-full object-cover object-center contrast-125 brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/85 via-50% to-[#050608]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-[#050608]/50" />
          </motion.div>
        </AnimatePresence>

        {/* Featured Content on Left */}
        <div className="relative z-10 max-w-xl my-auto space-y-4 pt-4">
          <motion.div
            key={`content-${currentPoem.slug || activeIndex}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="space-y-3"
          >
            <h2 className="font-serif text-3xl md:text-5xl text-[#FEEFFF] font-medium tracking-wide leading-tight">
              {currentPoem.title}
            </h2>

            <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#D5B06C] font-semibold">
              By {authorName}
            </p>

            <p className="font-serif italic text-base md:text-lg text-[#FEEFFF]/80 leading-relaxed max-w-lg pt-2">
              "{excerptText}"
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => onSelectWork(currentPoem)}
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#D5B06C] bg-[#D5B06C]/15 hover:bg-[#D5B06C] text-[#D5B06C] hover:text-[#080A06] font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(213,176,108,0.25)] cursor-pointer"
              >
                <span>READ POEM</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Right Reading Time */}
        <div className="relative z-10 self-end font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#8A8177]">
          {readTime} MIN READ <span className="text-[#D5B06C]">•</span> SEP 2026
        </div>
      </div>

      {/* Bottom Filmstrip Thumbnails Row (Panel 3) */}
      <div className="relative z-20 border-t border-white/10 bg-black/60 backdrop-blur-xl p-4 md:p-5 overflow-x-auto">
        <div className="flex items-center gap-3 md:gap-4 min-w-max pb-1">
          {works.map((poem, idx) => {
            const isActive = idx === activeIndex;
            const thumbImg = poem.image_url || FALLBACK_THUMBNAILS[idx % FALLBACK_THUMBNAILS.length];

            return (
              <button
                key={poem.slug || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`group relative w-24 md:w-32 h-16 md:h-20 rounded-lg overflow-hidden border transition-all duration-300 text-left cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'border-[#D5B06C] shadow-[0_0_15px_rgba(213,176,108,0.4)] scale-105'
                    : 'border-white/15 opacity-60 hover:opacity-90 hover:border-white/40'
                }`}
              >
                <img
                  src={thumbImg}
                  alt={poem.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2">
                  <span className="block font-serif text-[11px] md:text-xs text-[#FEEFFF] truncate">
                    {poem.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CinematicPoetryArchiveView;
