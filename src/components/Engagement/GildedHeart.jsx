import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import readerProgressService from '../../services/readerProgressService';

export const GildedHeart = ({ workId, initialCount = 0, onToggleLike }) => {
  const effectiveId = workId || 'default';
  const userIdScope = readerProgressService.getCurrentUserScope() || 'guest';
  const likedKey = `real_thing_u_${userIdScope}_liked_${effectiveId}`;

  const [hasLiked, setHasLiked] = useState(() => {
    try { return localStorage.getItem(likedKey) === 'true'; } catch { return false; }
  });

  const [displayCount, setDisplayCount] = useState(initialCount);

  const prevInitialCount = useRef(initialCount);
  useEffect(() => {
    if (prevInitialCount.current !== initialCount) {
      prevInitialCount.current = initialCount;
      const localLiked = (() => { try { return localStorage.getItem(likedKey) === 'true'; } catch { return false; } })();
      setDisplayCount(localLiked ? Math.max(0, initialCount) : Math.max(0, initialCount));
      setHasLiked(localLiked);
    }
  }, [initialCount, likedKey]);

  const [particles, setParticles] = useState([]);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === likedKey) {
        setHasLiked(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [likedKey]);

  const handleToggle = async () => {
    if (isPending || !workId) return;
    setIsPending(true);

    const nextLiked = !hasLiked;
    const increment = nextLiked ? 1 : -1;
    const nextCount = Math.max(0, displayCount + increment);

    setHasLiked(nextLiked);
    setDisplayCount(nextCount);
    try { localStorage.setItem(likedKey, nextLiked ? 'true' : 'false'); } catch {}

    if (nextLiked) {
      const newParticles = Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
        const distance = 35 + Math.random() * 65;
        const types = ['♥', '✦', '•', '✧'];
        return {
          id: Date.now() + i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 30,
          scale: Math.random() * 0.8 + 0.5,
          char: types[i % types.length],
          color: i % 2 === 0 ? '#D5B06C' : '#FEEFFF',
        };
      });
      setParticles(newParticles);
    }

    try {
      if (onToggleLike) {
        await onToggleLike(nextLiked, increment);
      }
    } catch (err) {
      console.warn('[GildedHeart] Like sync failed, rolling back:', err);
      setHasLiked(!nextLiked);
      setDisplayCount(displayCount);
      try { localStorage.setItem(likedKey, (!nextLiked) ? 'true' : 'false'); } catch {}
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-3 select-none">
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label="Gilded Resonance"
        className={`group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border-2 transition-all duration-300 cursor-pointer disabled:cursor-wait shadow-lg ${
          hasLiked
            ? 'border-[#D5B06C] bg-[#D5B06C]/20 shadow-[0_0_30px_rgba(213,176,108,0.5)] scale-105'
            : 'border-[#8A8177]/40 bg-[#0F1216]/90 hover:border-[#D5B06C] hover:bg-[#D5B06C]/10 hover:shadow-[0_0_20px_rgba(213,176,108,0.25)]'
        }`}
      >
        <motion.svg
          whileTap={{ scale: 0.85 }}
          animate={hasLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-300 ${
            hasLiked
              ? 'fill-[#D5B06C] stroke-[#D5B06C] drop-shadow-[0_0_10px_rgba(213,176,108,0.8)]'
              : 'fill-transparent stroke-[#8A8177] group-hover:stroke-[#D5B06C]'
          }`}
          strokeWidth="1.5"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </motion.svg>

        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.2 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="absolute pointer-events-none text-xs font-serif font-bold"
              style={{ color: p.color, textShadow: `0 0 8px ${p.color}` }}
            >
              {p.char}
            </motion.span>
          ))}
        </AnimatePresence>
      </button>

      <span className="font-sans text-xs md:text-sm tracking-widest uppercase font-medium text-[#8A8177]">
        <span className={`font-semibold ${hasLiked ? 'text-[#D5B06C]' : 'text-[#FEEFFF]'}`}>{displayCount}</span> {displayCount === 1 ? 'Resonance' : 'Resonances'}
      </span>
    </div>
  );
};

export default GildedHeart;