import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
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
    glyph: '✦',
    description: 'Lyrical verses & rhythmic expressions',
    route: '/poems',
    // position as % of the SVG viewBox (600 × 500)
    cx: 155, cy: 120,
    color: '#D5B06C',
    glowColor: 'rgba(213,176,108,0.6)',
    orbitColor: 'rgba(213,176,108,0.7)',
  },
  {
    id: 'stories',
    label: 'Stories',
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
      {/* Generous invisible hit area — triggers hover when cursor gets near orbit */}
      <circle cx={cx} cy={cy} r={65} fill="transparent" stroke="none" />

      {/* Outer glow pulse ring — always present, breathes */}
      {!isExploding && (
        <motion.circle
          cx={cx} cy={cy} r={isHovered ? 44 : 26}
          fill="none"
          stroke={color}
          strokeWidth={isHovered ? 1.5 : 0.6}
          strokeOpacity={isHovered ? 0.6 : 0.2}
          animate={{
            r: isHovered ? [42, 46, 42] : [24, 28, 24],
            strokeOpacity: isHovered ? [0.6, 0.85, 0.6] : [0.15, 0.3, 0.15],
          }}
          transition={{ duration: isHovered ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Orbit ring — rotates smoothly on hover */}
      {!isExploding && (
        <motion.g
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 4.5, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle
            cx={cx} cy={cy} r={36}
            fill="none"
            stroke={orbitColor}
            strokeWidth={isHovered ? 1.8 : 0.9}
            strokeDasharray="4 6"
            strokeOpacity={isHovered ? 1 : 0.4}
          />
          {/* Orbit satellite dot */}
          <motion.circle
            cx={cx} cy={cy - 36} r={isHovered ? 3.8 : 2.2}
            fill={color}
            opacity={isHovered ? 1 : 0.6}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
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
            x1={cx - 60} y1={cy} x2={cx + 60} y2={cy}
            stroke={color}
            strokeWidth="0.6"
            strokeOpacity="0.45"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            transition={{ duration: 0.25 }}
          />
          <motion.line
            x1={cx} y1={cy - 60} x2={cx} y2={cy + 60}
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
        r={isExploding ? 30 : isHovered ? 11 : 6}
        fill={color}
        style={{ filter: `drop-shadow(0 0 ${isHovered ? 22 : 10}px ${glowColor})` }}
        animate={
          isExploding
            ? { r: [10, 35, 90], opacity: [1, 0.9, 0] }
            : isHovered
            ? { r: [10, 12.5, 10], opacity: [0.95, 1, 0.95] }
            : { r: [5, 6.5, 5], opacity: [0.6, 0.9, 0.6] }
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
          fontSize="9"
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
        <motion.text
          x={cx} y={cy + 52}
          textAnchor="middle"
          fontSize={isHovered ? 15 : 13}
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
  const [tooltipNode, setTooltipNode] = useState(null);

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

  useEffect(() => {
    const load = async () => {
      try {
        const cached = cacheService.get(CACHE_KEYS.HUB_WORKS) || [];
        if (cached.length > 0) {
          setCounts({
            poems: cached.filter((w) => w.category === 'poem').length,
            stories: cached.filter((w) => w.category === 'story').length,
          });
        }
        const works = await workService.getPublishedWorks();
        if (works?.length > 0) {
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
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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

        {/* ── Continue Reading pill ─────────────────── */}
        <AnimatePresence>
          {lastReadWork && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate(`/read/${lastReadWork.slug}`)}
              className="mb-2 z-20 px-4 py-1.5 rounded-full border border-[#D5B06C]/40 bg-[#D5B06C]/10 text-[#D5B06C] font-sans text-[9px] uppercase tracking-[0.25em] hover:bg-[#D5B06C]/20 hover:border-[#D5B06C] transition-all backdrop-blur-sm flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5B06C] animate-pulse inline-block" />
              Resume · {lastReadWork.title}
              <span className="text-[#8A8177]">→</span>
            </motion.button>
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
            {/* ── Constellation edges ── */}
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
                onEnter={() => { setHoveredNode(node.id); setTooltipNode(node.id); }}
                onLeave={() => { setHoveredNode(null); setTooltipNode(null); }}
                onClick={() => handleNodeClick(node)}
              />
            ))}
          </svg>

          {/* ── Floating tooltip card ── */}
          <AnimatePresence>
            {tooltipNode && !explodingNode && (() => {
              const n = NODES.find((x) => x.id === tooltipNode);
              if (!n) return null;
              // Position card relative to node's % position in SVG
              const svgW = 600; const svgH = 480;
              const leftPct = (n.cx / svgW) * 100;
              const topPct = (n.cy / svgH) * 100;
              const alignRight = leftPct > 60;
              const alignBottom = topPct > 65;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.88, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: 6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute z-40 pointer-events-none"
                  style={{
                    left: alignRight ? 'auto' : `${leftPct}%`,
                    right: alignRight ? `${100 - leftPct}%` : 'auto',
                    top: alignBottom ? 'auto' : `${topPct + 12}%`,
                    bottom: alignBottom ? `${100 - topPct + 2}%` : 'auto',
                    minWidth: '180px',
                  }}
                >
                  <div
                    className="backdrop-blur-md rounded-xl p-4 border shadow-2xl"
                    style={{
                      background: 'rgba(8,10,6,0.88)',
                      borderColor: n.color + '55',
                      boxShadow: `0 0 30px ${n.glowColor}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl" style={{ color: n.color }}>{n.glyph}</span>
                      <span
                        className="font-serif text-base tracking-wider font-semibold"
                        style={{ color: n.color }}
                      >
                        {n.label}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#8A8177] leading-relaxed">
                      {n.description}
                    </p>
                    <div
                      className="mt-2 font-sans text-[10px] uppercase tracking-widest font-medium"
                      style={{ color: n.color }}
                    >
                      {getCount(n.id)}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: n.color }} />
                      Click star to enter
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
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