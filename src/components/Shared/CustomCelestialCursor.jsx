import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCelestialCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile screen (< 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });

      // Check if mouse is hovering over interactive elements
      const element = e.target && e.target.nodeType === 1 ? e.target : e.target?.parentElement;
      const isInteractive = element && (
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.onclick !== null ||
        element.getAttribute?.('role') === 'button' ||
        (typeof element.closest === 'function' && element.closest('button, a, [role="button"], .cursor-pointer'))
      );
      setIsHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (isMobile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer Smooth Celestial Ring Follower */}
      <motion.div
        animate={{
          x: pos.x - (isHovered ? 20 : 14),
          y: pos.y - (isHovered ? 20 : 14),
          scale: isHovered ? 1.4 : 1,
          borderColor: isHovered ? '#D5B06C' : 'rgba(213, 176, 108, 0.45)',
          backgroundColor: isHovered ? 'rgba(213, 176, 108, 0.12)' : 'rgba(15, 18, 22, 0.1)',
        }}
        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 350,
          mass: 0.5,
        }}
        className="fixed top-0 left-0 w-7 h-7 rounded-full border shadow-[0_0_12px_rgba(213,176,108,0.3)] backdrop-blur-[1px] pointer-events-none"
      />

      {/* Inner Golden Stardust Pointer Dot */}
      <motion.div
        animate={{
          x: pos.x - 3,
          y: pos.y - 3,
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 40,
          stiffness: 800,
        }}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#D5B06C] shadow-[0_0_8px_#D5B06C] pointer-events-none"
      />
    </div>
  );
};

export default CustomCelestialCursor;
