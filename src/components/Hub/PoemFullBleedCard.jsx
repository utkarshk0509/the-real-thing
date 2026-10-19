import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Heart, BookOpen } from 'lucide-react';

const ATMOSPHERIC_FALLBACKS = [
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop', // dark moon & silhouette
  'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1200&auto=format&fit=crop', // warm meadow nostalgic
  'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1200&auto=format&fit=crop', // moody night rain city
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop', // lone tree misty landscape
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop', // moody station night glance
  'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=1200&auto=format&fit=crop', // twilight lone balloon
];

function getPoemImage(poem, index) {
  if (poem.image_url) return poem.image_url;
  const titleLower = (poem.title || '').toLowerCase();
  if (titleLower.includes('monster') || titleLower.includes('moon')) return ATMOSPHERIC_FALLBACKS[0];
  if (titleLower.includes('her') || titleLower.includes('love')) return ATMOSPHERIC_FALLBACKS[1];
  if (titleLower.includes('rain') || titleLower.includes('water')) return ATMOSPHERIC_FALLBACKS[2];
  if (titleLower.includes('season') || titleLower.includes('tree')) return ATMOSPHERIC_FALLBACKS[3];
  if (titleLower.includes('glance') || titleLower.includes('night')) return ATMOSPHERIC_FALLBACKS[4];
  if (titleLower.includes('balloon') || titleLower.includes('sky')) return ATMOSPHERIC_FALLBACKS[5];
  return ATMOSPHERIC_FALLBACKS[index % ATMOSPHERIC_FALLBACKS.length];
}

function formatPoemDate(dateStr) {
  if (!dateStr) return 'SEP 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'SEP 2026';
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = d.getFullYear();
    return `${month} ${year}`;
  } catch (e) {
    return 'SEP 2026';
  }
}

function getCleanExcerpt(excerpt, body) {
  if (excerpt && excerpt.trim()) {
    const clean = excerpt.trim().replace(/\n+/g, ' ');
    return clean.length > 85 ? `${clean.slice(0, 82)}...` : clean;
  }
  if (body && body.trim()) {
    const firstLine = body.split('\n').map(l => l.trim()).filter(Boolean)[0] || '';
    return firstLine.length > 85 ? `${firstLine.slice(0, 82)}...` : firstLine;
  }
  return 'Some memories still sound like rain...';
}

export const PoemFullBleedCard = ({
  poem,
  index = 0,
  isDimmed = false,
  onHoverStart,
  onHoverEnd,
  onClick,
  readingProgress = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHoverStart) onHoverStart(poem.slug);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverEnd) onHoverEnd();
  };

  const imageUrl = getPoemImage(poem, index);
  const formattedDate = formatPoemDate(poem.published_at);
  const readTime = poem.read_time_minutes || 1;
  const authorName = (poem.author || 'UTKARSH').toUpperCase();
  const excerptText = getCleanExcerpt(poem.excerpt, poem.body);

  const cropScale = poem.crop_scale || 1.0;
  const cropPosX = poem.crop_pos_x ?? 50;
  const cropPosY = poem.crop_pos_y ?? 50;

  return (
    <motion.div
      layout
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        y: isHovered ? -8 : 0,
        opacity: isDimmed ? 0.45 : 1,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
      }}
      className={`group relative overflow-hidden rounded-xl md:rounded-2xl cursor-pointer select-none transition-all duration-300 border ${
        isHovered
          ? 'border-[#D5B06C]/80 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(213,176,108,0.25)]'
          : 'border-[#8A8177]/20 shadow-[0_10px_25px_rgba(0,0,0,0.6)]'
      } bg-[#080A0C] min-h-[260px] md:min-h-[290px] flex flex-col justify-end`}
    >
      {/* Background Image with Dark Vignette & Soft Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={poem.title}
          loading="lazy"
          animate={{
            scale: isHovered ? Math.max(cropScale * 1.08, 1.08) : cropScale,
            transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
          }}
          style={{
            objectPosition: `${cropPosX}% ${cropPosY}%`,
          }}
          className="w-full h-full object-cover transition-opacity duration-500 opacity-75 group-hover:opacity-90 contrast-[1.1] brightness-[0.85] group-hover:brightness-[0.92]"
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#080A0C]/80 via-45% to-transparent to-90% pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,6,8,0.6)_100%)] pointer-events-none" />

        {/* Ambient Gold Sheen on Hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#D5B06C]/10 to-transparent pointer-events-none transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Reading Progress Indicator Badge (if previously read) */}
      {readingProgress > 0 && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#080A0C]/80 border border-[#D5B06C]/40 backdrop-blur-md">
          <BookOpen className="w-2.5 h-2.5 text-[#D5B06C]" />
          <span className="font-sans text-[9px] uppercase tracking-widest text-[#D5B06C] font-semibold">
            {readingProgress}%
          </span>
        </div>
      )}

      {/* Diagonal Arrow in Default State (Panel 4 & Panel 8 Normal State) */}
      <div
        className={`absolute bottom-4 right-4 z-20 transition-all duration-300 pointer-events-none ${
          isHovered ? 'opacity-0 scale-75 translate-x-1 translate-y-1' : 'opacity-70 scale-100'
        }`}
      >
        <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8177] group-hover:text-[#D5B06C] transition-colors" />
        </div>
      </div>

      {/* Card Content Overlay */}
      <div className="relative z-10 p-5 md:p-6 flex flex-col justify-end">
        {/* Title */}
        <motion.h3
          layout="position"
          className="font-serif text-xl md:text-2xl text-[#FEEFFF] font-medium tracking-wide leading-tight group-hover:text-[#FFF8E7] transition-colors drop-shadow-md line-clamp-2"
        >
          {poem.title}
        </motion.h3>

        {/* Author */}
        <motion.p
          layout="position"
          className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#D5B06C]/90 font-medium mt-1 drop-shadow-sm"
        >
          By {authorName}
        </motion.p>

        {/* Revealable Excerpt on Hover (Panel 8 Enhanced Hover State) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="font-serif italic text-xs md:text-[13px] text-[#FEEFFF]/80 line-clamp-2 leading-relaxed border-l-2 border-[#D5B06C]/60 pl-2.5">
                "{excerptText}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Metadata & Action Bar */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
          <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.18em] text-[#8A8177]">
            <span>{readTime} MIN</span>
            <span className="text-[#D5B06C]/60">•</span>
            <span>{formattedDate}</span>

            {(poem.gilded_likes_count || 0) > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#D5B06C]/85">
                <Heart className="w-2.5 h-2.5 fill-[#D5B06C] text-[#D5B06C]" />
                <span className="font-mono text-[9px]">{poem.gilded_likes_count}</span>
              </span>
            )}
          </div>

          {/* READ -> Action Button on Hover (Panel 8) */}
          <div className="relative">
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onClick) onClick();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D5B06C] bg-[#D5B06C]/20 hover:bg-[#D5B06C] text-[#D5B06C] hover:text-[#080A06] font-sans text-[10px] uppercase tracking-widest font-semibold transition-all shadow-[0_0_15px_rgba(213,176,108,0.3)] cursor-pointer"
                  >
                    <span>READ</span>
                    <span className="text-[11px] leading-none">→</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PoemFullBleedCard;
