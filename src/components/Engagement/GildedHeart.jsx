import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const GildedHeart = ({ workId, initialCount = 0, onToggleLike }) => {
  const storageKey = `real_thing_like_${workId}`;
  
  const [hasLiked, setHasLiked] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });
  const [likes, setLikes] = useState(initialCount);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setLikes(initialCount);
  }, [initialCount]);

  const handleToggle = async () => {
    const nextState = !hasLiked;
    const nextCount = nextState ? likes + 1 : Math.max(0, likes - 1);

    setHasLiked(nextState);
    setLikes(nextCount);
    localStorage.setItem(storageKey, nextState ? 'true' : 'false');

    // Spawn golden spark particles on like
    if (nextState) {
      const newParticles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 60,
        y: -Math.random() * 50 - 20,
        scale: Math.random() * 0.6 + 0.4,
      }));
      setParticles(newParticles);
    }

    if (onToggleLike) {
      await onToggleLike(nextState, nextCount);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-3 select-none">
      <button
        onClick={handleToggle}
        aria-label="Gilded Resonance"
        className={`group relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 cursor-pointer ${
          hasLiked
            ? 'border-[#D5B06C] bg-[#D5B06C]/15 shadow-[0_0_20px_rgba(213,176,108,0.35)]'
            : 'border-[#8A8177]/30 bg-[#0F1216] hover:border-[#D5B06C] hover:bg-[#D5B06C]/5'
        }`}
      >
        <motion.svg
          whileTap={{ scale: 0.85 }}
          animate={hasLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`w-5 h-5 transition-colors duration-300 ${
            hasLiked 
              ? 'fill-[#D5B06C] stroke-[#D5B06C]' 
              : 'fill-transparent stroke-[#8A8177] group-hover:stroke-[#D5B06C]'
          }`}
          strokeWidth="1.5"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </motion.svg>

        {/* Floating Sparks */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: p.scale }}
              animate={{ opacity: 0, x: p.x, y: p.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#D5B06C] pointer-events-none shadow-[0_0_8px_#D5B06C]"
            />
          ))}
        </AnimatePresence>
      </button>

      <span className="font-sans text-xs tracking-widest uppercase font-medium text-[#8A8177]">
        <span className={hasLiked ? 'text-[#D5B06C]' : ''}>{likes}</span> Resonances
      </span>
    </div>
  );
};

export default GildedHeart;