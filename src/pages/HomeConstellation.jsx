import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Shared/Navigation';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import workService from '../services/workService';
import cacheService from '../services/cacheService';
import readerProgressService from '../services/readerProgressService';
import { CACHE_KEYS } from '../config/constants';

export const HomeConstellation = () => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [explodingNode, setExplodingNode] = useState(null);
  const [counts, setCounts] = useState({ poems: 0, stories: 0 });
  const [lastReadWork, setLastReadWork] = useState(null);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const cached = cacheService.get(CACHE_KEYS.HUB_WORKS) || [];
        if (cached.length > 0) {
          const poems = cached.filter((w) => w.category === 'poem').length;
          const stories = cached.filter((w) => w.category === 'story').length;
          setCounts({ poems, stories });
        }

        const works = await workService.getPublishedWorks();
        if (works && works.length > 0) {
          const poems = works.filter((w) => w.category === 'poem').length;
          const stories = works.filter((w) => w.category === 'story').length;
          setCounts({ poems, stories });
        }

        // Load recent progress for Resume Reading pill
        const recent = readerProgressService.getLastRead();
        if (recent && recent.title && recent.slug) {
          setLastReadWork(recent);
        }
      } catch (e) {
        console.warn('[HomeConstellation] Count load error:', e);
      }
    };
    loadCounts();
  }, []);

  const constellationNodes = [
    {
      id: 'poems',
      label: 'Poems',
      countLabel: `${counts.poems} Inscriptions`,
      description: 'Explore lyrical verses, rhythmic expressions, and soul-bound stanzas',
      route: '/poems',
      top: '42%',
      left: '26%',
    },
    {
      id: 'stories',
      label: 'Stories',
      countLabel: `${counts.stories} Chapters`,
      description: 'Immerse in narrative prose, deep tales, and expansive chronicles',
      route: '/stories',
      top: '58%',
      left: '74%',
    },
    {
      id: 'about',
      label: 'About Author',
      countLabel: 'Sanctuary Origin',
      description: 'Discover the heart, philosophy, and mind behind the constellation',
      route: '/about',
      top: '76%',
      left: '50%',
    },
  ];

  const handleNodeClick = (node) => {
    if (explodingNode) return;
    setExplodingNode(node.id);
    setTimeout(() => {
      navigate(node.route);
    }, 650);
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full bg-[#050608] text-[#FEEFFF] overflow-hidden select-none"
    >
      <AtmosphericBackground />
      <Navigation />

      {/* Deep Space Multi-Layered Cosmic Nebula Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(213,176,108,0.18),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(45,25,80,0.22),transparent_65%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(15,30,60,0.25),transparent_65%)] pointer-events-none z-0" />

      {/* Realistic Earth-View Meteor Shower (Top-Left -> Bottom-Right Trajectory) */}
      {[
        { top: '-5%', left: '5%', delay: '0.2s', duration: '4.2s' },
        { top: '15%', left: '30%', delay: '2.5s', duration: '5.0s' },
        { top: '35%', left: '0%', delay: '1.4s', duration: '4.5s' },
        { top: '55%', left: '25%', delay: '3.8s', duration: '5.4s' },
      ].map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
          className="real-meteor pointer-events-none z-0"
        >
          {/* Subtle Ethereal Meteor Streak (No Dot, Low Opacity) */}
          <div className="w-64 h-[1.5px] bg-gradient-to-r from-transparent via-[#FEEFFF]/50 to-[#D5B06C]/70 shadow-[0_0_10px_rgba(213,176,108,0.3)] rotate-[35deg] origin-left" />
        </div>
      ))}

      {/* Twinkling Ambient Stardust Field (30 Micro Pinprick Stars) */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 2 + (i % 4),
            repeat: Infinity,
            delay: (i * 0.3) % 3,
          }}
          style={{
            top: `${(i * 17) % 90 + 5}%`,
            left: `${(i * 23) % 95 + 2}%`,
          }}
          className="absolute w-[0.5px] h-[0.5px] bg-[#FEEFFF] rounded-full shadow-[0_0_1px_rgba(213,176,108,0.5)] pointer-events-none z-0"
        />
      ))}

      {/* Rotating 3D Celestial Astrolabe Grid Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] md:w-[760px] md:h-[760px] rounded-full border border-dashed border-[#D5B06C]/20 pointer-events-none z-0 flex items-center justify-center"
      >
        <div className="w-[400px] h-[400px] md:w-[560px] md:h-[560px] rounded-full border border-dotted border-[#D5B06C]/15" />
      </motion.div>

      {/* Fullscreen Starlight Flash on Supernova Explosion */}
      <AnimatePresence>
        {explodingNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65 }}
            className="fixed inset-0 bg-gradient-to-r from-[#D5B06C]/35 via-[#FEEFFF]/45 to-[#D5B06C]/35 z-50 pointer-events-none backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-32 md:pt-40 pb-16">
        {/* Eye-Catching Cosmic Header */}
        <div className="text-center space-y-3 z-20 mb-6 max-w-2xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-sans text-[10px] uppercase tracking-[0.35em] text-[#D5B06C] font-semibold block"
          >
            Celestial Navigation Hub
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-serif text-3xl md:text-5xl text-[#FEEFFF] tracking-widest font-normal drop-shadow-lg"
          >
            The Constellation Archive
          </motion.h1>

          <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-[#D5B06C] to-transparent mx-auto opacity-70" />

          <p className="font-sans text-xs md:text-sm text-[#8A8177] font-light max-w-md mx-auto pt-1">
            Click any cosmic coordinate to enter its sanctuary tab
          </p>
        </div>

        {/* Interactive 3D Constellation Map Frame */}
        <div className="relative w-full max-w-5xl h-[55vh] md:h-[60vh]">
          {/* SVG Constellation Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Line 1: Poems -> Stories */}
            <line
              x1="26%"
              y1="42%"
              x2="74%"
              y2="58%"
              stroke="rgba(213,176,108,0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
            {/* Line 2: Stories -> About */}
            <line
              x1="74%"
              y1="58%"
              x2="50%"
              y2="76%"
              stroke="rgba(213,176,108,0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
            {/* Line 3: About -> Poems */}
            <line
              x1="50%"
              y1="76%"
              x2="26%"
              y2="42%"
              stroke="rgba(213,176,108,0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
          </svg>

          {/* Interactive Star Nodes */}
          {constellationNodes.map((node, index) => {
            const isHovered = hoveredNode === node.id;
            const isExploding = explodingNode === node.id;

            return (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                style={{ top: node.top, left: node.left }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
              >
                {/* Astronomical Radar Crosshair Lines on Hover */}
                {isHovered && !isExploding && (
                  <>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[1px] bg-gradient-to-r from-transparent via-[#D5B06C]/40 to-transparent pointer-events-none z-0"
                    />
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[80vh] bg-gradient-to-b from-transparent via-[#D5B06C]/40 to-transparent pointer-events-none z-0"
                    />
                  </>
                )}

                {/* Rotating Golden Small Orbit Ring around Star (Rotates on Hover) */}
                {!isExploding && (
                  <motion.div
                    animate={{ rotate: isHovered ? 360 : 0 }}
                    transition={{ duration: 5, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-dashed border-[#D5B06C]/30 pointer-events-none transition-all duration-300 ${
                      isHovered
                        ? 'border-[#D5B06C] opacity-100 scale-180 shadow-[0_0_30px_rgba(213,176,108,0.9)]'
                        : 'border-[#D5B06C]/30 opacity-30 scale-100'
                    }`}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#D5B06C] rounded-full shadow-[0_0_12px_#D5B06C]" />
                  </motion.div>
                )}

                {/* Supernova Particle Burst Outward Particles */}
                {isExploding && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = (i * 360) / 12;
                      const rad = (angle * Math.PI) / 180;
                      const dist = 160;
                      const x = Math.cos(rad) * dist;
                      const y = Math.sin(rad) * dist;
                      return (
                        <motion.div
                          key={i}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
                          animate={{ x, y, opacity: 0, scale: 0.1 }}
                          transition={{ duration: 0.65, ease: 'easeOut' }}
                          className="absolute w-3 h-3 bg-[#D5B06C] rounded-full shadow-[0_0_20px_#D5B06C,0_0_10px_#FEEFFF]"
                        />
                      );
                    })}
                  </div>
                )}

                {/* Shining Micro Starlight Flare Beams */}
                {!isExploding && (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[0.5px] md:w-1 h-[0.0625px] bg-gradient-to-r from-transparent via-[#FEEFFF] to-transparent pointer-events-none group-hover:w-1 transition-all opacity-70" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[0.0625px] h-0.5 md:h-1 bg-gradient-to-b from-transparent via-[#FEEFFF] to-transparent pointer-events-none group-hover:h-1 transition-all opacity-70" />
                  </>
                )}

                {/* Micro Pinprick Twinkling Star Core */}
                <motion.div
                  animate={
                    isExploding
                      ? { scale: [1, 4, 30], opacity: [1, 1, 0] }
                      : isHovered
                      ? { scale: [1, 1.2, 1.05], opacity: [0.85, 1, 0.85] }
                      : { scale: [0.8, 1, 0.8], opacity: [0.25, 0.6, 0.25] }
                  }
                  transition={{
                    duration: isExploding ? 0.65 : isHovered ? 0.5 : 1.3 + index * 0.4,
                    repeat: isExploding ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`relative rounded-full flex items-center justify-center transition-all ${
                    isExploding
                      ? 'w-6 h-6 bg-[#FEEFFF] shadow-[0_0_80px_#D5B06C,0_0_150px_#FEEFFF]'
                      : isHovered
                      ? 'w-2.5 h-2.5 bg-[#D5B06C] shadow-[0_0_12px_#D5B06C]'
                      : 'w-2 h-2 bg-[#FEEFFF] shadow-[0_0_4px_#D5B06C]'
                  }`}
                >
                  <div className="absolute w-[0.2px] h-[0.2px] bg-[#FEEFFF] rounded-full" />
                  {isHovered && !isExploding && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-dashed border-[#D5B06C]/30"
                    />
                  )}
                </motion.div>

                {/* Glassmorphism Node Label Pill Under Star */}
                {!isExploding && (
                  <div className="mt-3 bg-[#0F1216]/85 border border-[#D5B06C]/40 px-3.5 py-1 rounded-full backdrop-blur-md text-center shadow-lg group-hover:border-[#D5B06C] group-hover:bg-[#D5B06C]/10 transition-all">
                    <span className="font-serif text-xs md:text-sm text-[#FEEFFF] group-hover:text-[#D5B06C] tracking-wider whitespace-nowrap font-medium">
                      {node.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};

export default HomeConstellation;