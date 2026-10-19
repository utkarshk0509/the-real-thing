import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const PoemConstellationView = ({ works, onSelectWork }) => {
  const [hoveredPoem, setHoveredPoem] = useState(null);

  if (!works || works.length === 0) return null;

  // Fixed celestial positions mapped gracefully across an SVG canvas
  const STAR_COORDS = [
    { x: 380, y: 110 }, // The Seasons We Were
    { x: 620, y: 150 }, // HER
    { x: 230, y: 180 }, // Me Within The Rain
    { x: 440, y: 220 }, // Monster I've Become (Central Moon / Star)
    { x: 710, y: 260 }, // BALLOON
    { x: 280, y: 310 }, // The Things I Never Knew
    { x: 550, y: 350 }, // GLANCE
    { x: 180, y: 380 }, // Solitude
    { x: 680, y: 390 }, // Dreams
  ];

  const EDGES = [
    [0, 1], // Seasons -> HER
    [0, 3], // Seasons -> Monster
    [2, 3], // Rain -> Monster
    [3, 4], // Monster -> Balloon
    [3, 5], // Monster -> The Things
    [3, 6], // Monster -> Glance
    [5, 6], // The Things -> Glance
    [6, 4], // Glance -> Balloon
  ];

  return (
    <div className="relative w-full min-h-[500px] md:min-h-[580px] rounded-2xl md:rounded-3xl overflow-hidden border border-[#D5B06C]/25 bg-[#050608] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-6 md:p-8 flex flex-col justify-between select-none">
      {/* Starry Night Sky with Mountain Silhouette (Panel 1) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,20,60,0.35)_0%,rgba(5,6,8,0.95)_100%)]" />
        <div className="absolute -bottom-10 left-0 right-0 h-48 bg-gradient-to-t from-[#050608] to-transparent z-10" />
      </div>

      {/* SVG Interactive Constellation Map */}
      <div className="relative z-10 w-full h-full flex items-center justify-center my-auto">
        <svg
          viewBox="0 0 900 480"
          className="w-full h-auto max-h-[460px] overflow-visible"
        >
          {/* Constellation Lines */}
          <g className="stroke-[#D5B06C]/30 stroke-[0.8] stroke-dasharray-[2,4]">
            {EDGES.map(([startIdx, endIdx], i) => {
              if (!STAR_COORDS[startIdx] || !STAR_COORDS[endIdx]) return null;
              const p1 = STAR_COORDS[startIdx];
              const p2 = STAR_COORDS[endIdx];
              return (
                <line
                  key={`edge-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className="transition-all duration-500"
                />
              );
            })}
          </g>

          {/* Interactive Poem Star Nodes */}
          {works.slice(0, STAR_COORDS.length).map((poem, idx) => {
            const coord = STAR_COORDS[idx];
            const isHovered = hoveredPoem === poem.slug;
            const isCenterMoon = idx === 3; // Monster I've Become central moon

            return (
              <g
                key={poem.slug || idx}
                transform={`translate(${coord.x}, ${coord.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoem(poem.slug)}
                onMouseLeave={() => setHoveredPoem(null)}
                onClick={() => onSelectWork(poem)}
              >
                {/* Outer Celestial Glow */}
                <circle
                  r={isCenterMoon ? (isHovered ? 26 : 20) : (isHovered ? 16 : 10)}
                  className={`transition-all duration-300 ${
                    isHovered
                      ? 'fill-[#D5B06C]/30 stroke-[#D5B06C] stroke-1'
                      : 'fill-[#D5B06C]/10 stroke-[#D5B06C]/30 stroke-[0.5]'
                  }`}
                />

                {/* Core Star / Moon Node */}
                <circle
                  r={isCenterMoon ? 9 : (isHovered ? 4.5 : 3)}
                  className={`transition-all duration-300 ${
                    isCenterMoon
                      ? 'fill-white stroke-[#D5B06C] stroke-2 shadow-[0_0_15px_#FFF]'
                      : isHovered
                      ? 'fill-[#FEEFFF] stroke-[#D5B06C] stroke-1.5'
                      : 'fill-[#D5B06C]'
                  }`}
                />

                {/* Star Label / Title */}
                <text
                  y={isCenterMoon ? 30 : -16}
                  textAnchor="middle"
                  className={`font-serif text-[13px] md:text-[14px] transition-all duration-300 ${
                    isHovered
                      ? 'fill-[#FFF8E7] font-semibold tracking-wide drop-shadow-[0_0_8px_rgba(213,176,108,0.8)]'
                      : 'fill-[#E8E1D5]/80 font-normal'
                  }`}
                >
                  {poem.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Quote & Hint (Panel 1) */}
      <div className="relative z-20 flex items-center justify-between text-[#8A8177] pt-4 border-t border-white/10">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D5B06C]/80">
          ✦ Click any celestial star to enter the poem
        </span>
        <span className="font-serif italic text-sm text-[#FEEFFF]/70">
          Same sky, different stories.
        </span>
      </div>
    </div>
  );
};

export default PoemConstellationView;
