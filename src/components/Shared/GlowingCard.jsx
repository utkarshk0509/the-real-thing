import React, { useRef, useState, useCallback } from 'react';

export const GlowingCard = ({ 
  children, 
  className = "", 
  image, 
  cropScale = 1,
  cropPosX = 50,
  cropPosY = 50,
  onClick 
}) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(450px circle at ${x}px ${y}px, rgba(213, 176, 108, 0.18), transparent 50%)`;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const card = cardRef.current;
    if (card) {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  }, []);

  const posX = cropPosX ?? 50;
  const posY = cropPosY ?? 50;

  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
        className={`group relative overflow-hidden rounded-2xl border border-[#8A8177]/25 bg-[#0F1216] p-6 transition-colors duration-300 hover:border-[#D5B06C]/60 cursor-pointer shadow-xl ${className}`}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10 rounded-2xl"
          style={{
            opacity: isHovered ? 1 : 0,
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-2xl"
          style={{
            transform: 'translateZ(18px)',
            background: `linear-gradient(125deg, transparent 15%, rgba(213, 176, 108, 0.28) 46%, rgba(254, 239, 255, 0.5) 50%, rgba(124, 185, 232, 0.28) 54%, transparent 85%)`,
            transform: isHovered ? 'translateX(100%) translateZ(18px)' : 'translateX(-100%) translateZ(18px)',
            transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {image && (
          <div
            style={{ transform: 'translateZ(0px)' }}
            className="absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-500 rounded-r-2xl"
          >
            <img 
              src={image} 
              alt="" 
              className="w-full h-full object-cover grayscale contrast-115 group-hover:grayscale-0 transition-all duration-300 ease-out" 
              style={{
                transform: `scale(${cropScale}) translate(${posX - 50}%, ${posY - 50}%)`,
                transformOrigin: 'center center'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F1216] via-[#0F1216]/60 to-transparent mix-blend-normal group-hover:opacity-40 transition-opacity duration-500" />
          </div>
        )}

        <div
          style={{ transform: 'translateZ(32px)', transformStyle: 'preserve-3d' }}
          className="relative z-30 h-full flex flex-col justify-between"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlowingCard;