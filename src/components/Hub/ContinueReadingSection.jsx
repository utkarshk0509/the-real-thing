import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export const ContinueReadingSection = ({ lastReadWork, fallbackPoem }) => {
  const navigate = useNavigate();

  // If there's a real lastRead, use it; otherwise fall back to top poem to showcase the prototype section
  const currentWork = lastReadWork || fallbackPoem;
  if (!currentWork) return null;

  const rawPercent = currentWork.scrollPercentage !== undefined ? currentWork.scrollPercentage : 68;
  const progressPercent = Math.max(12, Math.min(100, Math.round(rawPercent)));

  const title = currentWork.title || "Monster I've Become";
  const slug = currentWork.slug || (fallbackPoem && fallbackPoem.slug) || '';
  const excerpt = currentWork.excerpt
    ? `“${currentWork.excerpt.replace(/\n+/g, ' ').slice(0, 75)}...”`
    : '“I never knew when the person I was afraid of... became me.”';

  const handleResume = () => {
    if (slug) {
      navigate(`/read/${slug}`);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-[#D5B06C]/30 bg-[#080A0C] shadow-[0_12px_45px_rgba(0,0,0,0.85),0_0_35px_rgba(213,176,108,0.12)] p-6 md:p-10 my-8"
    >
      {/* Background with Atmospheric Dark Moon Silhouette & Starfield (Panel 7) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dark night landscape backdrop */}
        <img
          src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover object-right opacity-35 filter contrast-125 brightness-75"
        />

        {/* Gradient overlays to guarantee text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#080A0C]/90 to-[#080A0C]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-[#050608]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,6,8,0.85)_100%)]" />

        {/* Subtle Constellation Stardust particles */}
        <div className="absolute top-6 right-16 w-1.5 h-1.5 rounded-full bg-[#D5B06C] opacity-70 animate-pulse" />
        <div className="absolute top-16 right-36 w-1 h-1 rounded-full bg-white opacity-60" />
        <div className="absolute bottom-12 right-28 w-1 h-1 rounded-full bg-[#D5B06C] opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
        {/* Left Side: Calligraphic / Italic Poetic Script (Panel 7) */}
        <div className="md:w-1/3 flex flex-col justify-center space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D5B06C] animate-pulse" />
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#D5B06C]/80 font-medium">
              Incomplete Journey
            </span>
          </div>
          <p className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-[#FEEFFF]/90 leading-tight">
            A page <br className="hidden md:inline" />
            <span className="text-[#D5B06C]/90">still waits for you...</span>
          </p>
        </div>

        {/* Center / Right Side: Reading Progress, Poem Details & Action (Panel 7) */}
        <div className="md:w-2/3 w-full flex flex-col items-start md:items-end text-left md:text-right space-y-4">
          <div className="space-y-1 w-full flex flex-col items-start md:items-end">
            <span className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-[#8A8177]">
              Continue Reading
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-[#FEEFFF] font-medium tracking-wide">
              {title}
            </h2>
            <p className="font-serif italic text-xs md:text-sm text-[#8A8177] max-w-lg">
              {excerpt}
            </p>
          </div>

          {/* Sophisticated Gold Progress Indicator */}
          <div className="w-full max-w-md space-y-2">
            <div className="flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.2em] text-[#8A8177]">
              <span className="text-[#D5B06C] font-semibold">{progressPercent}% completed</span>
              <span>{currentWork.category === 'story' ? 'Story' : 'Poem'}</span>
            </div>

            <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-[#D5B06C] to-amber-300 shadow-[0_0_12px_rgba(213,176,108,0.8)]"
              />
            </div>
          </div>

          {/* RESUME READING -> Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResume}
              className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#D5B06C] hover:bg-[#FEEFFF] text-[#080A06] font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(213,176,108,0.35)] hover:shadow-[0_4px_28px_rgba(254,239,255,0.45)] cursor-pointer"
            >
              <span>RESUME READING</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContinueReadingSection;
