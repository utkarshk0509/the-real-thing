import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const GildedHeart = ({ initialCount = 142, onLike }) => {
  const [likes, setLikes] = useState(initialCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [particles, setParticles] = useState([]);

  const handleLike = async () => {
    if (hasLiked) return;
    
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    // Spawn floating golden particle sparks
    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -Math.random() * 50 - 20,
      scale: Math.random() * 0.6 + 0.4,
    }));
    setParticles(newParticles);

    if (onLike) await onLike();
  };

  return (
    <div className="relative inline-flex items-center gap-3 select-none">
      <button
        onClick={handleLike}
        disabled={hasLiked}
        aria-label="Gilded Resonance"
        className={`group relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 ${
          hasLiked
            ? 'border-[#D5B06C] bg-[#D5B06C]/10 shadow-[0_0_20px_rgba(213,176,108,0.3)] cursor-default'
            : 'border-[#8A8177]/30 bg-[#0F1216] hover:border-[#D5B06C] hover:bg-[#D5B06C]/5 cursor-pointer'
        }`}
      >
        <motion.svg
          whileTap={!hasLiked ? { scale: 0.85 } : {}}
          animate={hasLiked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
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

        {/* Floating Golden Sparks Animation */}
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