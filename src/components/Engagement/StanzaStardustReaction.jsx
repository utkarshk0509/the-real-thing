import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const StanzaStardustReaction = ({ triggerKey, originX = 50, originY = 50 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!triggerKey) return;

    // Generate 12-16 celestial spark particles
    const newParticles = Array.from({ length: 14 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() * 0.4 - 0.2);
      const speed = Math.random() * 55 + 25;
      const vx = Math.cos(angle) * speed;
      const vy = -Math.abs(Math.sin(angle) * speed) - Math.random() * 30; // Float upwards
      const size = Math.random() * 4 + 2;
      const colors = ['#D5B06C', '#FEEFFF', '#E2B36E', '#C9A9FF', '#F7D070'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const glyphs = ['✦', '✧', '⋆', '•', '·'];
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];

      return {
        id: `${triggerKey}-${i}-${Date.now()}`,
        vx,
        vy,
        size,
        color,
        glyph,
        rot: Math.random() * 360,
      };
    });

    setParticles((prev) => [...prev.slice(-30), ...newParticles]);

    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1200);

    return () => clearTimeout(timer);
  }, [triggerKey]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{
              opacity: 1,
              scale: 0.2,
              x: `${originX}%`,
              y: `${originY}%`,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 0.9, 0],
              scale: [0.2, 1.2, 0.4],
              x: `calc(${originX}% + ${p.vx}px)`,
              y: `calc(${originY}% + ${p.vy}px)`,
              rotate: p.rot,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }}
            style={{
              position: 'absolute',
              color: p.color,
              fontSize: `${p.size * 3}px`,
              textShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {p.glyph}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default StanzaStardustReaction;
