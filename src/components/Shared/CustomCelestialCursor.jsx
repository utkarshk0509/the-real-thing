import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCelestialCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });

      const element = e.target && e.target.nodeType === 1 ? e.target : e.target?.parentElement;
      const isInput = element && (
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'INPUT' ||
        element.isContentEditable ||
        (typeof element.closest === 'function' && element.closest('textarea, input, [contenteditable="true"]'))
      );
      setIsTextInput(!!isInput);

      const isInteractive = element && (
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.onclick !== null ||
        element.getAttribute?.('role') === 'button' ||
        (typeof element.closest === 'function' && element.closest('button, a, [role="button"], .cursor-pointer'))
      );
      setIsHovered(!!isInteractive && !isInput);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (isMobile || isTextInput) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Smooth Trailing Starlight Halo Ring */}
      <motion.div
        animate={{
          x: pos.x - (isHovered ? 18 : 12),
          y: pos.y - (isHovered ? 18 : 12),
          scale: isClicking ? 0.75 : isHovered ? 1.4 : 1,
          borderColor: isHovered ? '#FFE8A3' : 'rgba(213, 176, 108, 0.45)',
          backgroundColor: isHovered 
            ? 'rgba(213, 176, 108, 0.16)' 
            : isClicking 
            ? 'rgba(213, 176, 108, 0.25)' 
            : 'rgba(213, 176, 108, 0.04)',
        }}
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 300,
          mass: 0.4,
        }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border shadow-[0_0_15px_rgba(213,176,108,0.35)] backdrop-blur-[0.5px] pointer-events-none"
      />
    </div>
  );
};

export default CustomCelestialCursor;
