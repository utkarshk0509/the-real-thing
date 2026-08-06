import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Navigation from '../components/Shared/Navigation';
import CosmicNebulaBackground from '../components/Shared/CosmicNebulaBackground';
import workService from '../services/workService';
import cacheService from '../services/cacheService';
import readerProgressService from '../services/readerProgressService';
import { CACHE_KEYS } from '../config/constants';

/* ── Node definitions ─────────────────────────────── */
const NODES = [
  {
    id: 'poems',
    label: 'Poems',
    starTitle: 'STELLA LYRICIS',
    glyph: '✦',
    description: 'Lyrical verses & rhythmic expressions',
    route: '/poems',
    cx: 155, cy: 120,
    color: '#D5B06C',
    glowColor: 'rgba(213,176,108,0.6)',
    orbitColor: 'rgba(213,176,108,0.7)',
  },
  {
    id: 'stories',
    label: 'Stories',
    starTitle: 'STELLA NARRATIVA',
    glyph: '◈',
    description: 'Narrative prose & deep chronicles',
    route: '/stories',
    cx: 445, cy: 140,
    color: '#7CB9E8',
    glowColor: 'rgba(124,185,232,0.6)',
    orbitColor: 'rgba(124,185,232,0.7)',
  },
  {
    id: 'about',
    label: 'About Author',
    starTitle: 'ALPHA ORIGIN',
    glyph: '⊹',
    description: 'The heart behind the constellation',
    route: '/about',
    cx: 300, cy: 270,
    color: '#C9A9FF',
    glowColor: 'rgba(201,169,255,0.6)',
    orbitColor: 'rgba(201,169,255,0.7)',
  },
];

/* Pairs for constellation lines */
const EDGES = [
  ['poems', 'stories'],
  ['stories', 'about'],
  ['about', 'poems'],
];

/* ── Animated dash offset for "light traveling" effect ── */
function TravelingEdge({ x1, y1, x2, y2, color, active }) {
  return (
    <g>
      {/* base faint line always visible */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.2"
      />
      {/* animated light pulse along path */}
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={active ? 2 : 1.2}
        strokeOpacity={active ? 0.9 : 0.35}
        strokeLinecap="round"
        strokeDasharray="6 100"
        animate={{ strokeDashoffset: [200, -200] }}
        transition={{ duration: active ? 1.8 : 3.5, repeat: Infinity, ease: 'linear' }}
      />
    </g>
  );
}

/* ── Individual star node ─────────────────────────── */
function StarNode({ node, isHovered, isExploding, onEnter, onLeave, onClick, count }) {
  const { cx, cy, color, glowColor, orbitColor, label, glyph, description } = node;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Snug responsive hit area */}
      <circle cx={cx} cy={cy} r={48} fill="transparent" stroke="none" />

      {/* Outer glow pulse ring — hugs the orbit closely */}
      {!isExploding && (
        <motion.circle
          cx={cx} cy={cy} r={isHovered ? 32 : 24}
          fill="none"
          stroke={color}
          strokeWidth={isHovered ? 1.2 : 0.6}
          strokeOpacity={isHovered ? 0.6 : 0.25}
          animate={{
            r: isHovered ? [30, 34, 30] : [23, 25, 23],
            strokeOpacity: isHovered ? [0.6, 0.85, 0.6] : [0.2, 0.35, 0.2],
          }}
          transition={{ duration: isHovered ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Snug Orbit ring — rotates smoothly around star core */}
      {!isExploding && (
        <motion.g
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 3.5, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle
            cx={cx} cy={cy} r={isHovered ? 26 : 22}
            fill="none"
            stroke={orbitColor}
            strokeWidth={isHovered ? 1.6 : 1}
            strokeDasharray="3 4"
            strokeOpacity={isHovered ? 1 : 0.5}
          />
          {/* Orbit satellite dot */}
          <motion.circle
            cx={cx} cy={cy - (isHovered ? 26 : 22)} r={isHovered ? 3.2 : 2}
            fill={color}
            opacity={isHovered ? 1 : 0.7}
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />
        </motion.g>
      )}

      {/* Supernova burst particles on click */}
      {isExploding &&
        Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const dist = 140;
          return (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r={4}
              fill={color}
              initial={{ cx, cy, opacity: 1, r: 4 }}
              animate={{
                cx: cx + Math.cos(angle) * dist,
                cy: cy + Math.sin(angle) * dist,
                opacity: 0,
                r: 0.5,
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          );
        })}

      {/* Cross diffraction spikes on hover */}
      {isHovered && !isExploding && (
        <>
          <motion.line
            x1={cx - 45} y1={cy} x2={cx + 45} y2={cy}
            stroke={color}
            strokeWidth="0.6"
            strokeOpacity="0.45"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            transition={{ duration: 0.25 }}
          />
          <motion.line
            x1={cx} y1={cy - 45} x2={cx} y2={cy + 45}
            stroke={color}
            strokeWidth="0.6"
            strokeOpacity="0.45"
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            transition={{ duration: 0.25 }}
          />
        </>
      )}

      {/* Star core */}
      <motion.circle
        cx={cx} cy={cy}
        r={isExploding ? 30 : isHovered ? 9 : 5.5}
        fill={color}
        style={{ filter: `drop-shadow(0 0 ${isHovered ? 20 : 9}px ${glowColor})` }}
        animate={
          isExploding
            ? { r: [10, 35, 90], opacity: [1, 0.9, 0] }
            : isHovered
            ? { r: [8.5, 10, 8.5], opacity: [0.95, 1, 0.95] }
            : { r: [5, 6, 5], opacity: [0.6, 0.9, 0.6] }
        }
        transition={{
          duration: isExploding ? 0.7 : isHovered ? 0.8 : 2 + Math.random(),
          repeat: isExploding ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Glyph inside the star on hover */}
      {isHovered && !isExploding && (
        <motion.text
          x={cx} y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fill="#080A06"
          fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {glyph}
        </motion.text>
      )}

      {/* Label below star — clear readable size */}
      {!isExploding && (
        <g>
          <motion.text
            x={cx} y={cy + 42}
            textAnchor="middle"
            fontSize={isHovered ? 14 : 12.5}
            fill={isHovered ? color : '#FEEFFF'}
            fontFamily="Georgia, serif"
            fontWeight={isHovered ? '600' : '500'}
            letterSpacing="2.5"
            style={{ filter: isHovered ? `drop-shadow(0 0 12px ${glowColor})` : 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))' }}
            animate={{ opacity: isHovered ? 1 : 0.85 }}
            transition={{ duration: 0.25 }}
          >
            {label.toUpperCase()}
          </motion.text>

          {/* Astronomical Star Code Name */}
          <text
            x={cx} y={cy + 54}
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="500"
            fill={isHovered ? color : '#8A8177'}
            fontFamily="sans-serif"
            letterSpacing="2"
            opacity={isHovered ? 0.9 : 0.5}
          >
            {node.starTitle}
          </text>
        </g>
      )}

      {/* Count badge below label */}
      {count !== undefined && !isExploding && (
        <text
          x={cx} y={cy + 68}
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="500"
          fill={isHovered ? color : 'rgba(213,176,108,0.7)'}
          fontFamily="sans-serif"
          letterSpacing="1.2"
        >
          {count}
        </text>
      )}
    </g>
  );
}

/* ── Main page ────────────────────────────────────── */
export const HomeConstellation = () => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [explodingNode, setExplodingNode] = useState(null);
  const [counts, setCounts] = useState({ poems: 0, stories: 0 });
  const [lastReadWork, setLastReadWork] = useState(null);

  // Smooth cursor-driven parallax for the SVG frame
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const move = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set((e.clientX - cx) / cx * 14);
      mouseY.set((e.clientY - cy) / cy * 10);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  const [allWorks, setAllWorks] = useState([]);
  const [oracleWork, setOracleWork] = useState(null);
  const [isOracleOpen, setIsOracleOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = cacheService.get(CACHE_KEYS.HUB_WORKS) || [];
        if (cached.length > 0) {
          setAllWorks(cached);
          setCounts({
            poems: cached.filter((w) => w.category === 'poem').length,
            stories: cached.filter((w) => w.category === 'story').length,
          });
        }
        const works = await workService.getPublishedWorks();
        if (works?.length > 0) {
          setAllWorks(works);
          setCounts({
            poems: works.filter((w) => w.category === 'poem').length,
            stories: works.filter((w) => w.category === 'story').length,
          });
        }
        const recent = readerProgressService.getLastRead();
        if (recent?.title && recent?.slug) setLastReadWork(recent);
      } catch (e) {
        console.warn('[HomeConstellation] load error:', e);
      }
    };
    load();
  }, []);

  const handleOpenOracle = async () => {
    // Filter strictly for POEMS ONLY (exclude stories)
    const poems = allWorks.filter((w) => w.category === 'poem');

    if (poems.length === 0) return;

    // Pick a random poem
    const chosenPoem = poems[Math.floor(Math.random() * poems.length)];

    try {
      // Fetch full poem object including 'body' column
      const fullPoem = await workService.getWorkBySlug(chosenPoem.slug);

      const rawBody = (fullPoem?.body || chosenPoem.excerpt || '').trim();

      // Split poem body into individual poetic lines
      const lines = rawBody
        .split(/\r?\n/)
        .map((l) => l.replace(/^[#*->\s]+/, '').trim())
        .filter((l) => l.length > 0 && !l.toLowerCase().startsWith('by '));

      let poemLine = '';
      if (lines.length > 0) {
        // Pick a random line directly from THIS poem's actual body
        poemLine = lines[Math.floor(Math.random() * lines.length)];
      } else {
        poemLine = rawBody || chosenPoem.title;
      }

      // Limit length cleanly if line is overly long
      if (poemLine.length > 180) {
        poemLine = poemLine.slice(0, 175).replace(/\s+\S*$/, '') + '...';
      }

      setOracleWork({
        ...chosenPoem,
        snippet: poemLine,
      });
      setIsOracleOpen(true);
    } catch (e) {
      console.warn('[HomeConstellation] Oracle body fetch error:', e);
    }
  };

  const getCount = (id) => {
    if (id === 'poems') return `${counts.poems} inscriptions`;
    if (id === 'stories') return `${counts.stories} chapters`;
    return 'sanctuary origin';
  };

  const handleNodeClick = (node) => {
    if (explodingNode) return;
    setExplodingNode(node.id);
    setTimeout(() => navigate(node.route), 650);
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(6px)', scale: 0.98 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-screen w-full bg-[#050608] text-[#FEEFFF] overflow-hidden select-none"
    >
      {/* Cosmic nebula — gold/violet palette for the hub */}
      <CosmicNebulaBackground variant="poems" />
      <Navigation />

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

      <main className="relative z-10 h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-16 pb-3 gap-2">

        {/* ── Header ───────────────────────────────── */}
        <div className="text-center space-y-1.5 mb-2 max-w-2xl mx-auto z-20">
          <motion.span
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#D5B06C] font-semibold block"
          >
            Celestial Navigation Hub
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-3xl md:text-4xl text-[#FEEFFF] tracking-widest font-normal"
            style={{ textShadow: '0 0 60px rgba(213,176,108,0.2)' }}
          >
            The Real Thing
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-px w-48 bg-gradient-to-r from-transparent via-[#D5B06C] to-transparent mx-auto"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-sans text-xs text-[#8A8177] font-light max-w-sm mx-auto"
          >
            Navigate the living constellation — each star a gateway
          </motion.p>
        </div>

        {/* ── Action Bar: Resume Reading & Discover Stanza Oracle ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2 z-20">
          <AnimatePresence>
            {lastReadWork && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.6 }}
                onClick={() => navigate(`/read/${lastReadWork.slug}`)}
                className="px-4 py-1.5 rounded-full border border-[#D5B06C]/40 bg-[#D5B06C]/10 text-[#D5B06C] font-sans text-[9px] uppercase tracking-[0.25em] hover:bg-[#D5B06C]/20 hover:border-[#D5B06C] transition-all backdrop-blur-sm flex items-center gap-2 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D5B06C] animate-pulse inline-block" />
                Resume · {lastReadWork.title}
                <span className="text-[#8A8177]">→</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Random Stanza Oracle Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            onClick={handleOpenOracle}
            className="px-4 py-1.5 rounded-full border border-[#7CB9E8]/40 bg-[#7CB9E8]/10 text-[#7CB9E8] font-sans text-[9px] uppercase tracking-[0.25em] hover:bg-[#7CB9E8]/20 hover:border-[#7CB9E8] transition-all backdrop-blur-sm flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(124,185,232,0.15)]"
          >
            <Sparkles className="w-3 h-3" />
            <span>Discover a Stanza</span>
          </motion.button>
        </div>

        {/* ── Random Inscription Oracle Modal (Ultra-Premium Astrolabe Edition) ── */}
        <AnimatePresence>
          {isOracleOpen && oracleWork && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/90 backdrop-blur-2xl"
              onClick={() => setIsOracleOpen(false)}
            >
              {/* Outer Glowing Starlight Container Border */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-xl w-full p-[1.5px] rounded-3xl bg-gradient-to-b from-[#D5B06C] via-[#8A8177]/40 to-[#D5B06C] shadow-[0_0_90px_rgba(213,176,108,0.35)] overflow-hidden"
              >
                {/* Inner Obsidian Luxury Body */}
                <div className="relative w-full bg-gradient-to-b from-[#141822] via-[#0F1216] to-[#080A06] rounded-[23px] p-8 md:p-11 text-center space-y-7 overflow-hidden">
                  
                  {/* Slow Rotating Astronomical Astrolabe Compass SVG in Background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                      viewBox="0 0 300 300"
                      className="w-[340px] h-[340px] text-[#D5B06C]"
                    >
                      <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 6" />
                      <circle cx="150" cy="150" r="115" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                      <circle cx="150" cy="150" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                      <circle cx="150" cy="150" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <line x1="150" y1="5" x2="150" y2="295" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                      <line x1="5" y1="150" x2="295" y2="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                      <polygon points="150,15 153,30 147,30" fill="currentColor" />
                      <polygon points="150,285 153,270 147,270" fill="currentColor" />
                      <polygon points="15,150 30,153 30,147" fill="currentColor" />
                      <polygon points="285,150 270,153 270,147" fill="currentColor" />
                    </motion.svg>
                  </div>

                  {/* Ambient Starlight Glow Center Pulse */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(213,176,108,0.18)_0%,transparent_65%)] pointer-events-none" />

                  {/* Corner Celestial Filigree Accents */}
                  <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t-2 border-l-2 border-[#D5B06C] shadow-[0_0_8px_#D5B06C]" />
                  <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t-2 border-r-2 border-[#D5B06C] shadow-[0_0_8px_#D5B06C]" />
                  <div className="absolute bottom-3.5 left-3.5 w-4 h-4 border-b-2 border-l-2 border-[#D5B06C] shadow-[0_0_8px_#D5B06C]" />
                  <div className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b-2 border-r-2 border-[#D5B06C] shadow-[0_0_8px_#D5B06C]" />

                  {/* Top Close Button */}
                  <button
                    onClick={() => setIsOracleOpen(false)}
                    className="absolute top-4 right-5 text-[#8A8177] hover:text-[#D5B06C] transition-colors p-2 font-sans text-xs uppercase cursor-pointer z-30"
                  >
                    ✕
                  </button>

                  {/* Header Tagline & Gold Emblem */}
                  <div className="relative z-20 space-y-3">
                    <div className="flex items-center justify-center gap-2.5">
                      <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#D5B06C]" />
                      <div className="p-1.5 rounded-full bg-[#D5B06C]/15 border border-[#D5B06C]/60 text-[#D5B06C] shadow-[0_0_12px_rgba(213,176,108,0.4)]">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#D5B06C] font-semibold">
                        ◈ CELESTIAL ORACLE INCRIPTION ◈
                      </span>
                      <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#D5B06C]" />
                    </div>

                    <h3 className="font-serif text-2xl md:text-4xl text-[#FEEFFF] font-normal tracking-wide drop-shadow-lg">
                      {oracleWork.title}
                    </h3>

                    <div className="flex items-center justify-center gap-2 font-sans text-[10px] uppercase tracking-[0.25em] text-[#8A8177]">
                      <span>By {oracleWork.author}</span>
                      <span className="text-[#D5B06C]">•</span>
                      <span className="text-[#D5B06C] font-medium">{oracleWork.category}</span>
                      {oracleWork.read_time_minutes && (
                        <>
                          <span className="text-[#D5B06C]">•</span>
                          <span>{oracleWork.read_time_minutes} min read</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Animated Gold Shimmer Divider */}
                  <div className="relative z-20 h-px w-40 bg-gradient-to-r from-transparent via-[#D5B06C] to-transparent mx-auto shadow-[0_0_10px_#D5B06C]" />

                  {/* Poetic Stanza Quote Card */}
                  <motion.div
                    key={oracleWork.snippet}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="relative z-20 p-6 md:p-8 rounded-2xl bg-black/60 border border-[#D5B06C]/35 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] space-y-3"
                  >
                    <span className="font-serif text-4xl text-[#D5B06C]/50 block leading-none select-none font-bold">“</span>
                    <blockquote className="font-serif text-lg md:text-2xl text-[#FEEFFF] italic leading-relaxed font-light px-3 tracking-wide">
                      {oracleWork.snippet}
                    </blockquote>
                    <span className="font-serif text-4xl text-[#D5B06C]/50 block leading-none select-none text-right font-bold">”</span>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="relative z-20 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setIsOracleOpen(false);
                        if (oracleWork.slug && oracleWork.slug !== 'hub') {
                          navigate(`/read/${oracleWork.slug}`);
                        }
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D5B06C] via-[#FEEFFF] to-[#D5B06C] text-[#080A06] font-sans text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(213,176,108,0.5)] cursor-pointer"
                    >
                      Read Full Inscription →
                    </button>

                    <button
                      onClick={handleOpenOracle}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#D5B06C]/60 bg-[#0F1216]/90 text-[#D5B06C] hover:text-[#FEEFFF] hover:border-[#D5B06C] font-sans text-xs uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md hover:bg-[#D5B06C]/15 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Another Stanza ✨</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SVG Constellation Map ─────────────────── */}
        <motion.div
          className="relative w-full max-w-3xl z-20"
          style={{ x: springX, y: springY }}
        >
          <svg
            viewBox="0 0 600 360"
            className="w-full max-h-[42vh]"
            style={{ overflow: 'visible' }}
          >
            {/* ── Astronomical Astrolabe Coordinates Grid ── */}
            <g className="opacity-30 pointer-events-none">
              {/* Concentric Coordinate Rings */}
              <circle cx="300" cy="180" r="165" fill="none" stroke="#D5B06C" strokeWidth="0.5" strokeDasharray="3 5" opacity="0.4" />
              <circle cx="300" cy="180" r="110" fill="none" stroke="#D5B06C" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.3" />
              <circle cx="300" cy="180" r="55" fill="none" stroke="#D5B06C" strokeWidth="0.4" strokeDasharray="1 3" opacity="0.25" />

              {/* Declination / Right Ascension Axes */}
              <line x1="300" y1="15" x2="300" y2="345" stroke="#D5B06C" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.3" />
              <line x1="35" y1="180" x2="565" y2="180" stroke="#D5B06C" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.3" />

              {/* Cardinal Celestial Ticks */}
              <text x="300" y="10" textAnchor="middle" fontSize="6.5" fill="#8A8177" letterSpacing="1.5">N 000°</text>
              <text x="580" y="182" textAnchor="start" fontSize="6.5" fill="#8A8177" letterSpacing="1.5">E 090°</text>
              <text x="300" y="356" textAnchor="middle" fontSize="6.5" fill="#8A8177" letterSpacing="1.5">S 180°</text>
              <text x="20" y="182" textAnchor="end" fontSize="6.5" fill="#8A8177" letterSpacing="1.5">W 270°</text>
            </g>

            {/* ── Minor Constellation Framework Lines & Stars ── */}
            <g className="pointer-events-none opacity-40">
              {/* Secondary Constellation Connecting Lines */}
              <line x1="155" y1="120" x2="95" y2="65" stroke="#D5B06C" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="155" y1="120" x2="235" y2="45" stroke="#D5B06C" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="445" y1="140" x2="515" y2="75" stroke="#7CB9E8" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="445" y1="140" x2="375" y2="55" stroke="#7CB9E8" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="300" y1="270" x2="185" y2="315" stroke="#C9A9FF" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="300" y1="270" x2="415" y2="305" stroke="#C9A9FF" strokeWidth="0.5" strokeDasharray="2 3" />

              {/* Minor Stars */}
              {[
                { x: 95, y: 65, color: '#D5B06C' },
                { x: 235, y: 45, color: '#D5B06C' },
                { x: 515, y: 75, color: '#7CB9E8' },
                { x: 375, y: 55, color: '#7CB9E8' },
                { x: 185, y: 315, color: '#C9A9FF' },
                { x: 415, y: 305, color: '#C9A9FF' },
              ].map((star, idx) => (
                <g key={idx}>
                  <circle cx={star.x} cy={star.y} r="2.2" fill={star.color} opacity="0.8" />
                  <circle cx={star.x} cy={star.y} r="4.5" fill="none" stroke={star.color} strokeWidth="0.4" opacity="0.5" />
                </g>
              ))}
            </g>

            {/* ── Major Constellation edges ── */}
            {EDGES.map(([aId, bId]) => {
              const a = NODES.find((n) => n.id === aId);
              const b = NODES.find((n) => n.id === bId);
              const active = hoveredNode === aId || hoveredNode === bId;
              return (
                <TravelingEdge
                  key={`${aId}-${bId}`}
                  x1={a.cx} y1={a.cy}
                  x2={b.cx} y2={b.cy}
                  color={active ? a.color : 'rgba(213,176,108,0.5)'}
                  active={active}
                />
              );
            })}

            {/* ── Star nodes ── */}
            {NODES.map((node) => (
              <StarNode
                key={node.id}
                node={node}
                isHovered={hoveredNode === node.id}
                isExploding={explodingNode === node.id}
                count={getCount(node.id)}
                onEnter={() => setHoveredNode(node.id)}
                onLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
              />
            ))}
          </svg>
        </motion.div>

        {/* ── Bottom legend ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="z-20 flex items-center gap-6 mt-1"
        >
          {NODES.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNodeClick(n)}
              className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8A8177] hover:text-[#FEEFFF] transition-colors group py-1 px-2 rounded-full hover:bg-white/5"
            >
              <span
                className="w-2 h-2 rounded-full transition-all group-hover:scale-150"
                style={{ background: n.color, boxShadow: `0 0 8px ${n.color}` }}
              />
              {n.label}
            </button>
          ))}
        </motion.div>
      </main>
    </motion.div>
  );
};

export default HomeConstellation;