import React, { useState } from 'react';

export const GlowingCard = ({ 
  children, 
  className = "", 
  image, 
  cropScale = 1,
  cropPosX = 50,
  cropPosY = 50,
  onClick 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -9;
    const rotateY = ((x - centerX) / centerX) * 9;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const posX = cropPosX ?? 50;
  const posY = cropPosY ?? 50;

  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <div
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.025, 1.025, 1.025)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.5s ease-out',
        }}
        className={`group relative overflow-hidden rounded-2xl border border-[#8A8177]/25 bg-[#0F1216] p-6 transition-all duration-300 hover:border-[#D5B06C]/60 cursor-pointer shadow-xl ${className}`}
      >
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10 rounded-2xl"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(213, 176, 108, 0.18), transparent 45%)`,
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