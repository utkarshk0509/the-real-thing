import React, { useState } from 'react';

export const GlowingCard = ({ 
  children, 
  className = "", 
  image, 
  onClick 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-xl border border-[#8A8177]/20 bg-[#0F1216] p-6 transition-all duration-300 hover:border-[#D5B06C]/50 cursor-pointer ${className}`}
    >
      {/* Background Radial Glow Following Cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(213, 176, 108, 0.12), transparent 40%)`,
        }}
      />

      {/* Atmospheric Image Banner Overlay */}
      {image && (
        <div className="absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-500">
          <img 
            src={image} 
            alt="" 
            className="w-full h-full object-cover object-center filter grayscale contrast-125 mix-blend-luminosity transform group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1216] via-[#0F1216]/70 to-transparent" />
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export default GlowingCard;