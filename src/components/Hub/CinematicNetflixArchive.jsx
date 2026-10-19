import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import CosmicSearchModal from '../Shared/CosmicSearchModal';
import CosmicSerendipityModal from './CosmicSerendipityModal';

// Signature curated cinematic images matching prototype panel 3
const SIGNATURE_BACKDROPS = {
  monster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
  her: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1920&auto=format&fit=crop',
  rain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920&auto=format&fit=crop',
  seasons: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920&auto=format&fit=crop',
  glance: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1920&auto=format&fit=crop',
  balloon: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=1920&auto=format&fit=crop',
  real: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
  things: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop',
};

const FALLBACK_LIST = [
  SIGNATURE_BACKDROPS.monster,
  SIGNATURE_BACKDROPS.her,
  SIGNATURE_BACKDROPS.rain,
  SIGNATURE_BACKDROPS.seasons,
  SIGNATURE_BACKDROPS.glance,
  SIGNATURE_BACKDROPS.balloon,
  SIGNATURE_BACKDROPS.real,
  SIGNATURE_BACKDROPS.things,
];

function getWorkBackdrop(work, index) {
  if (work.image_url) return work.image_url;
  const titleL = (work.title || '').toLowerCase();
  if (titleL.includes('monster') || titleL.includes('become')) return SIGNATURE_BACKDROPS.monster;
  if (titleL.includes('her') || titleL.includes('love')) return SIGNATURE_BACKDROPS.her;
  if (titleL.includes('rain') || titleL.includes('water')) return SIGNATURE_BACKDROPS.rain;
  if (titleL.includes('season') || titleL.includes('were')) return SIGNATURE_BACKDROPS.seasons;
  if (titleL.includes('glance')) return SIGNATURE_BACKDROPS.glance;
  if (titleL.includes('balloon')) return SIGNATURE_BACKDROPS.balloon;
  if (titleL.includes('wish') || titleL.includes('real')) return SIGNATURE_BACKDROPS.real;
  if (titleL.includes('things') || titleL.includes('never')) return SIGNATURE_BACKDROPS.things;
  return FALLBACK_LIST[index % FALLBACK_LIST.length];
}

function formatWorkDate(dateStr) {
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

export const CinematicNetflixArchive = ({ works = [], activeRoute = '/poems' }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const filmstripRef = useRef(null);

  const total = works.length || 1;
  const currentWork = works[activeIndex] || works[0] || {
    title: "Monster I've Become",
    author: 'UTKARSH',
    slug: 'monster-ive-become',
    excerpt: 'I never knew when the person I was afraid of.... became me.',
    read_time_minutes: 2,
    published_at: '2026-09-14',
    category: 'poem',
  };

  const currentImage = getWorkBackdrop(currentWork, activeIndex);
  const formattedDate = formatWorkDate(currentWork.published_at);
  const readTime = currentWork.read_time_minutes || 2;
  const authorName = (currentWork.author || 'UTKARSH').toUpperCase();
  const isStory = currentWork.category === 'story' || activeRoute === '/stories';
  const actionLabel = isStory ? 'READ STORY →' : 'READ POEM →';

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }, [total]);

  // Keyboard navigation (Netflix style Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Mouse wheel scroll → cycle through tabs (Netflix-style)
  const scrollCooldown = useRef(false);
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (scrollCooldown.current) return;
      scrollCooldown.current = true;

      if (e.deltaY > 0) {
        handleNext();
      } else if (e.deltaY < 0) {
        handlePrev();
      }

      setTimeout(() => {
        scrollCooldown.current = false;
      }, 600); // 600ms cooldown for smooth Netflix-like pacing
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleNext, handlePrev]);

  // Smoothly scroll active thumbnail into view
  useEffect(() => {
    if (filmstripRef.current) {
      const activeEl = filmstripRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  const cleanExcerpt = currentWork.excerpt
    ? currentWork.excerpt.replace(/\n+/g, ' ').slice(0, 130)
    : 'I never knew when the person I was afraid of.... became me.';

  // Use crop settings from the work if available
  const cropScale = currentWork.crop_scale || 1;
  const cropPosX = currentWork.crop_pos_x ?? 50;
  const cropPosY = currentWork.crop_pos_y ?? 50;

  return (
    <>
      {/* FULL-SCREEN CINEMATIC LAYOUT — fixed to viewport, no scroll */}
      <div className="fixed inset-0 w-screen h-screen bg-[#030405] overflow-hidden select-none flex flex-col" style={{ zIndex: 1 }}>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 1. TOP NAVIGATION BAR (Exact Prototype Recreation)            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <nav className="relative z-30 w-full px-5 sm:px-8 py-3 flex items-center justify-between border-b border-white/8 bg-[#0a0b0d]/80 backdrop-blur-md shrink-0">
          {/* Left Brand */}
          <Link
            to="/"
            className="font-serif text-base sm:text-lg md:text-xl tracking-wider text-[#FEEFFF] hover:text-[#D5B06C] transition-colors cursor-pointer whitespace-nowrap"
          >
            The Real Thing
          </Link>

          {/* Right Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-5 md:gap-6">
            <Link
              to="/hub"
              className={`relative py-1 font-sans text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                activeRoute === '/hub' ? 'text-[#D5B06C] font-semibold' : 'text-[#8A8177] hover:text-[#D5B06C]'
              }`}
            >
              HUB
              {activeRoute === '/hub' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D5B06C] shadow-[0_0_8px_#D5B06C] rounded-full" />
              )}
            </Link>

            <Link
              to="/poems"
              className={`relative py-1 font-sans text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                activeRoute === '/poems' ? 'text-[#D5B06C] font-semibold' : 'text-[#8A8177] hover:text-[#D5B06C]'
              }`}
            >
              POEMS
              {activeRoute === '/poems' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D5B06C] shadow-[0_0_8px_#D5B06C] rounded-full" />
              )}
            </Link>

            <Link
              to="/stories"
              className={`relative py-1 font-sans text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                activeRoute === '/stories' ? 'text-[#D5B06C] font-semibold' : 'text-[#8A8177] hover:text-[#7CB9E8]'
              }`}
            >
              STORIES
              {activeRoute === '/stories' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D5B06C] shadow-[0_0_8px_#D5B06C] rounded-full" />
              )}
            </Link>

            <Link
              to="/about"
              className={`hidden sm:inline-block relative py-1 font-sans text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                activeRoute === '/about' ? 'text-[#C9A9FF] font-semibold' : 'text-[#8A8177] hover:text-[#C9A9FF]'
              }`}
            >
              ABOUT
              {activeRoute === '/about' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A9FF] shadow-[0_0_8px_#C9A9FF] rounded-full" />
              )}
            </Link>

            {/* Search */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-7 h-7 rounded-full border border-white/10 bg-white/5 hover:border-[#D5B06C]/50 flex items-center justify-center text-[#8A8177] hover:text-[#D5B06C] transition-all cursor-pointer"
              title="Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* ORACLE Button */}
            <button
              type="button"
              onClick={() => setIsOracleOpen(true)}
              className="px-3 py-1 rounded-full border border-[#D5B06C]/60 bg-transparent text-[#D5B06C] hover:bg-[#D5B06C] hover:text-[#080A06] font-sans text-[10px] uppercase tracking-[0.18em] font-medium transition-all cursor-pointer"
            >
              ORACLE
            </button>

            {/* Avatar Circle */}
            <div
              onClick={() => navigate('/portal')}
              className="w-7 h-7 rounded-full bg-[#5D3FD3] border border-[#7B5EE8] text-white flex items-center justify-center font-sans text-xs font-semibold shadow-[0_0_10px_rgba(93,63,211,0.5)] cursor-pointer"
              title="Curator Portal"
            >
              A
            </div>
          </div>
        </nav>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 2. HERO BILLBOARD — fills remaining space between nav & strip */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="relative flex-1 w-full overflow-hidden flex flex-col">

          {/* Full-bleed Cinematic Backdrop Image with Netflix Cross-Fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWork.slug || activeIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <img
                src={currentImage}
                alt={currentWork.title}
                className="w-full h-full object-cover brightness-[0.85] contrast-[1.15]"
                style={{
                  objectPosition: `${cropPosX}% ${cropPosY}%`,
                  transform: `scale(${cropScale})`,
                }}
              />

              {/* Netflix Dark Gradients: left, bottom, vignette */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#030405] via-[#030405]/70 via-40% to-transparent to-85%" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030405] via-transparent via-50% to-[#030405]/40" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(3,4,5,0.6)_100%)]" />
            </motion.div>
          </AnimatePresence>

          {/* Hero Content Layer */}
          <div className="relative z-20 flex-1 flex flex-col justify-between px-6 sm:px-10 md:px-14 py-5 sm:py-8">

            {/* Top Row: Counter + Navigation Controls */}
            <div className="flex items-center justify-between">
              <motion.div
                key={`counter-${activeIndex}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="font-mono text-xs sm:text-sm text-[#8A8177] tracking-[0.25em]"
              >
                {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </motion.div>

              {/* ← PREV | NEXT → */}
              <div className="flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.2em] text-[#8A8177]">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="hover:text-[#D5B06C] transition-colors cursor-pointer"
                >
                  ← PREV
                </button>
                <span className="text-white/20">|</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="hover:text-[#D5B06C] transition-colors cursor-pointer"
                >
                  NEXT →
                </button>
              </div>
            </div>

            {/* Center: Title, Author, Excerpt, Read Button */}
            <div className="max-w-xl space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`hero-text-${currentWork.slug || activeIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2.5"
                >
                  {/* Title */}
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-[#FEEFFF] font-normal tracking-wide leading-[1.1] drop-shadow-lg">
                    {currentWork.title}
                  </h1>

                  {/* Author */}
                  <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#D5B06C] font-semibold">
                    By {authorName}
                  </p>

                  {/* Excerpt */}
                  <p className="font-serif text-sm sm:text-base md:text-[17px] text-[#C9C3B8] leading-relaxed max-w-lg">
                    {cleanExcerpt}
                  </p>

                  {/* READ POEM → Button */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/read/${currentWork.slug}`)}
                      className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#D5B06C] bg-transparent hover:bg-[#D5B06C] text-[#D5B06C] hover:text-[#080A06] font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 cursor-pointer"
                    >
                      <span>{actionLabel}</span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Right: Metadata */}
            <div className="self-end font-sans text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#8A8177] drop-shadow-md">
              <span>{readTime} MIN READ</span>
              <span className="mx-2 text-[#D5B06C]">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 3. BOTTOM FILMSTRIP THUMBNAIL ROW (Netflix Carousel)          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="relative z-30 w-full border-t border-white/8 bg-[#080a0d]/90 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3 shrink-0">
          <div
            ref={filmstripRef}
            className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {works.map((item, idx) => {
              const isActive = idx === activeIndex;
              const thumbImg = getWorkBackdrop(item, idx);
              const thumbCropScale = item.crop_scale || 1;
              const thumbCropPosX = item.crop_pos_x ?? 50;
              const thumbCropPosY = item.crop_pos_y ?? 50;

              return (
                <motion.div
                  key={item.slug || idx}
                  whileHover={{ scale: 1.06, y: -3 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={() => setActiveIndex(idx)}
                  className="group relative flex-shrink-0 cursor-pointer text-center select-none"
                  style={{ width: 'clamp(80px, 10vw, 120px)' }}
                >
                  {/* Thumbnail Card */}
                  <div
                    className={`relative w-full rounded-lg overflow-hidden transition-all duration-300 ${
                      isActive
                        ? 'border-2 border-[#D5B06C] shadow-[0_0_14px_rgba(213,176,108,0.5)]'
                        : 'border border-white/12 opacity-55 hover:opacity-100 hover:border-white/35'
                    }`}
                    style={{ aspectRatio: '16/10' }}
                  >
                    <img
                      src={thumbImg}
                      alt={item.title}
                      className="w-full h-full object-cover brightness-90 group-hover:brightness-110 transition-all duration-300"
                      style={{
                        objectPosition: `${thumbCropPosX}% ${thumbCropPosY}%`,
                        transform: `scale(${thumbCropScale})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>

                  {/* Title Beneath Thumbnail */}
                  <p
                    className={`font-serif text-[10px] sm:text-[11px] mt-1.5 truncate px-0.5 leading-tight transition-colors duration-300 ${
                      isActive ? 'text-[#D5B06C] font-semibold' : 'text-[#8A8177] group-hover:text-[#FEEFFF]'
                    }`}
                  >
                    {item.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CosmicSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <CosmicSerendipityModal
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
      />
    </>
  );
};

export default CinematicNetflixArchive;
