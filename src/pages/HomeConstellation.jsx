import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, Clock, Heart, Compass, ArrowRight, BookOpen } from 'lucide-react';
import Navigation from '../components/Shared/Navigation';
import CosmicNebulaBackground from '../components/Shared/CosmicNebulaBackground';
import CosmicSerendipityModal from '../components/Hub/CosmicSerendipityModal';
import workService from '../services/workService';
import cacheService from '../services/cacheService';
import readerProgressService from '../services/readerProgressService';
import { CACHE_KEYS } from '../config/constants';

const MOODS = [
  { id: 'all', label: '✦ All Constellations' },
  { id: 'cosmic', label: '⋆ Cosmic & Wonder' },
  { id: 'melancholy', label: '✧ Melancholic Rain' },
  { id: 'love', label: '◈ Heart & Longing' },
  { id: 'peace', label: '⊹ Quiet Solitude' },
];

function matchesMood(work, mood) {
  if (!work || mood === 'all') return true;
  const text = `${work.title || ''} ${work.excerpt || ''} ${work.body || ''}`.toLowerCase();
  if (mood === 'cosmic') return /star|cosmos|nebula|sky|galaxy|moon|space|light|sun|starlight/.test(text);
  if (mood === 'melancholy') return /grief|sad|ache|rain|cold|sorrow|tear|loss|shadow|alone|dark/.test(text);
  if (mood === 'love') return /love|heart|kiss|hold|touch|lips|breath|warm|arms|together/.test(text);
  if (mood === 'peace') return /peace|silence|quiet|still|whisper|wind|sleep|dream|breathe/.test(text);
  return true;
}


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

const EDGES = [
  ['poems', 'stories'],
  ['stories', 'about'],
  ['about', 'poems'],
];

function TravelingEdge({ x1, y1, x2, y2, color, active }) {
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.2"
      />
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

function StarNode({ node, isHovered, isExploding, onEnter, onLeave, onClick, count }) {
  const { cx, cy, color, glowColor, orbitColor, label, glyph, description } = node;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <circle cx={cx} cy={cy} r={48} fill="transparent" stroke="none" />

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
          <motion.circle
            cx={cx} cy={cy - (isHovered ? 26 : 22)} r={isHovered ? 3.2 : 2}
            fill={color}
            opacity={isHovered ? 1 : 0.7}
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />
        </motion.g>
      )}

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

function WorkStar({ work, cx, cy, isHovered, isDimmed, onEnter, onLeave, onClick }) {
  const isPoem = work.category === 'poem';
  const color = isPoem ? '#D5B06C' : '#7CB9E8';
  const likes = work.gilded_likes_count || 0;
  const baseR = Math.min(5.5, 3.2 + Math.log10(likes + 1) * 1.4);

  return (
    <g
      style={{ cursor: 'pointer', transition: 'opacity 0.35s ease' }}
      opacity={isDimmed ? 0.2 : 1}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Enlarged hit boundary */}
      <circle cx={cx} cy={cy} r={22} fill="transparent" />

      {/* Orbit ripple on hover */}
      {isHovered && (
        <>
          <motion.circle
            cx={cx}
            cy={cy}
            r={baseR + 8}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0.2, 0.7] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx={cx} cy={cy} r={baseR + 4} fill={color} opacity="0.25" />
        </>
      )}

      {/* Core Star Body */}
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? baseR * 1.4 : baseR}
        fill={isHovered ? '#FEEFFF' : color}
        style={{
          filter: `drop-shadow(0 0 ${isHovered ? 10 : 4}px ${color})`,
          transition: 'all 0.25s ease',
        }}
      />

      {/* Star glyph */}
      {isHovered && (
        <text
          x={cx}
          y={cy - baseR - 4}
          textAnchor="middle"
          fontSize="9"
          fill={color}
          style={{ userSelect: 'none' }}
        >
          ✦
        </text>
      )}
    </g>
  );
}

export const HomeConstellation = () => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [explodingNode, setExplodingNode] = useState(null);
  const [counts, setCounts] = useState({ poems: 0, stories: 0 });
  const [floatTime, setFloatTime] = useState(0);

  useEffect(() => {
    if (hoveredNode !== null) return;
    const id = setInterval(() => setFloatTime((t) => t + 0.025), 30);
    return () => clearInterval(id);
  }, [hoveredNode]);

  const liveNodes = NODES.map((node) => {
    const phase = node.id === 'poems' ? 0 : node.id === 'stories' ? 2.1 : 4.2;
    const rx = node.id === 'about' ? 11 : 13;
    const ry = node.id === 'stories' ? 10 : 12;
    return {
      ...node,
      cx: node.cx + Math.sin(floatTime * 0.8 + phase) * rx,
      cy: node.cy + Math.cos(floatTime * 0.65 + phase) * ry,
    };
  });
  const [lastReadWork, setLastReadWork] = useState(null);

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
  const [hoveredWorkStar, setHoveredWorkStar] = useState(null);
  const [selectedMood, setSelectedMood] = useState('all');
  const [warpWork, setWarpWork] = useState(null);
  const [isSerendipityOpen, setIsSerendipityOpen] = useState(false);

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
    const poems = allWorks.filter((w) => w.category === 'poem');

    if (poems.length === 0) return;

    const chosenPoem = poems[Math.floor(Math.random() * poems.length)];

    try {
      const fullPoem = await workService.getWorkBySlug(chosenPoem.slug);

      const rawBody = (fullPoem?.body || chosenPoem.excerpt || '').trim();

      const lines = rawBody
        .split(/\r?\n/)
        .map((l) => l.replace(/^[#*->\s]+/, '').trim())
        .filter((l) => l.length > 0 && !l.toLowerCase().startsWith('by '));

      let poemLine = '';
      if (lines.length > 0) {
        poemLine = lines[Math.floor(Math.random() * lines.length)];
      } else {
        poemLine = rawBody || chosenPoem.title;
      }

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

  const handleWorkClick = (work) => {
    if (warpWork || explodingNode) return;
    setWarpWork(work);
    setTimeout(() => {
      navigate(`/read/${work.slug}`);
    }, 650);
  };

  const poemNode = liveNodes.find((n) => n.id === 'poems') || { cx: 155, cy: 120 };
  const storyNode = liveNodes.find((n) => n.id === 'stories') || { cx: 445, cy: 140 };

  const publishedPoems = allWorks.filter((w) => w.category === 'poem');
  const publishedStories = allWorks.filter((w) => w.category === 'story');

  const poemStars = publishedPoems.slice(0, 14).map((w, idx) => {
    const total = Math.min(publishedPoems.length, 14);
    const angle = (idx / total) * Math.PI * 2 + (idx % 2 === 0 ? 0.35 : 0.75);
    const radius = 54 + (idx % 3) * 17;
    return {
      work: w,
      cx: poemNode.cx + Math.cos(angle) * radius,
      cy: poemNode.cy + Math.sin(angle) * radius,
      parentCx: poemNode.cx,
      parentCy: poemNode.cy,
    };
  });

  const storyStars = publishedStories.slice(0, 10).map((w, idx) => {
    const total = Math.min(publishedStories.length, 10);
    const angle = (idx / total) * Math.PI * 2 + (idx % 2 === 0 ? 0.45 : 0.9);
    const radius = 56 + (idx % 2) * 19;
    return {
      work: w,
      cx: storyNode.cx + Math.cos(angle) * radius,
      cy: storyNode.cy + Math.sin(angle) * radius,
      parentCx: storyNode.cx,
      parentCy: storyNode.cy,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(6px)', scale: 0.98 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-screen w-full bg-[#050608] text-[#FEEFFF] overflow-hidden select-none"
    >
      <CosmicNebulaBackground variant="poems" />
      <Navigation />

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

        {/* Constellation Mood Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2 z-20 max-w-xl">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m.id)}
              className={`px-3 py-1 rounded-full text-[10px] uppercase font-sans tracking-widest transition-all cursor-pointer ${
                selectedMood === m.id
                  ? 'bg-[#D5B06C]/25 border border-[#D5B06C] text-[#D5B06C] shadow-[0_0_12px_rgba(213,176,108,0.3)]'
                  : 'bg-[#0F1216]/60 border border-white/10 text-[#8A8177] hover:text-[#FEEFFF]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

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

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            onClick={() => setIsSerendipityOpen(true)}
            className="px-4 py-1.5 rounded-full border border-[#D5B06C]/50 bg-[#D5B06C]/15 text-[#D5B06C] font-sans text-[9px] uppercase tracking-[0.25em] hover:bg-[#D5B06C] hover:text-[#080A06] transition-all backdrop-blur-sm flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(213,176,108,0.25)] font-semibold"
          >
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Consult Constellation Oracle</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {isOracleOpen && oracleWork && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/90 backdrop-blur-2xl"
              onClick={() => setIsOracleOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 25 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 25 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-xl w-full p-[1px] rounded-3xl bg-gradient-to-b from-[#D5B06C]/70 via-[#8A8177]/25 to-[#D5B06C]/70 shadow-[0_0_40px_rgba(213,176,108,0.18)] overflow-hidden"
              >
                <div className="relative w-full bg-gradient-to-b from-[#141822] via-[#0F1216] to-[#080A06] rounded-[23px] p-8 md:p-11 text-center space-y-7 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
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

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(213,176,108,0.12)_0%,transparent_65%)] pointer-events-none" />

                  <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t border-l border-[#D5B06C]/70" />
                  <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t border-r border-[#D5B06C]/70" />
                  <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b border-l border-[#D5B06C]/70" />
                  <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b border-r border-[#D5B06C]/70" />

                  <button
                    onClick={() => setIsOracleOpen(false)}
                    className="absolute top-4 right-5 text-[#8A8177] hover:text-[#D5B06C] transition-colors p-2 font-sans text-xs uppercase cursor-pointer z-30"
                  >
                    ✕
                  </button>

                  <div className="relative z-20 space-y-3">
                    <div className="flex items-center justify-center gap-2.5">
                      <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#D5B06C]/60" />
                      <div className="p-1.5 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/40 text-[#D5B06C]">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#D5B06C] font-semibold">
                        CELESTIAL ORACLE INSCRIPTION
                      </span>
                      <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#D5B06C]/60" />
                    </div>

                    <h3 className="font-serif text-2xl md:text-4xl text-[#FEEFFF] font-normal tracking-wide drop-shadow-md">
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

                  <div className="relative z-20 h-px w-36 bg-gradient-to-r from-transparent via-[#D5B06C]/70 to-transparent mx-auto" />

                  <motion.div
                    key={oracleWork.snippet}
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="relative z-20 p-6 md:p-8 rounded-2xl bg-black/50 border border-[#D5B06C]/25 backdrop-blur-xl space-y-3"
                  >
                    <span className="font-serif text-3xl text-[#D5B06C]/40 block leading-none select-none font-bold">“</span>
                    <blockquote className="font-serif text-lg md:text-2xl text-[#FEEFFF] italic leading-relaxed font-light px-3 tracking-wide">
                      {oracleWork.snippet}
                    </blockquote>
                    <span className="font-serif text-3xl text-[#D5B06C]/40 block leading-none select-none text-right font-bold">”</span>
                  </motion.div>

                  <div className="relative z-20 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setIsOracleOpen(false);
                        if (oracleWork.slug && oracleWork.slug !== 'hub') {
                          navigate(`/read/${oracleWork.slug}`);
                        }
                      }}
                      className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-[0.25em] border border-[#F5E8D0]/30 hover:bg-[#C9A35F] transition-colors duration-300 cursor-pointer shadow-sm"
                    >
                      Read Full Inscription →
                    </button>

                    <button
                      onClick={handleOpenOracle}
                      className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D5B06C]/40 bg-[#0F1216]/90 text-[#D5B06C] hover:text-[#FEEFFF] hover:border-[#D5B06C] hover:bg-[#D5B06C]/10 font-sans text-xs uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Another Stanza</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative w-full max-w-3xl z-20"
          style={{ x: springX, y: springY }}
        >
          <svg
            viewBox="0 0 600 360"
            className="w-full max-h-[42vh]"
            style={{ overflow: 'visible' }}
          >
            <g className="opacity-30 pointer-events-none">
              <circle cx="300" cy="180" r="165" fill="none" stroke="#D5B06C" strokeWidth="0.5" strokeDasharray="3 5" opacity="0.4" />
              <circle cx="300" cy="180" r="110" fill="none" stroke="#D5B06C" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.3" />
              <circle cx="300" cy="180" r="55" fill="none" stroke="#D5B06C" strokeWidth="0.4" strokeDasharray="1 3" opacity="0.25" />

              <line x1="300" y1="15" x2="300" y2="345" stroke="#D5B06C" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.3" />
              <line x1="35" y1="180" x2="565" y2="180" stroke="#D5B06C" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.3" />

              <text x="300" y="10" textAnchor="middle" fontSize="6.5" fill="#8A8177" letterSpacing="1.5">N 000°</text>
              <text x="580" y="182" textAnchor="start" fontSize="6.5" fill="#8A8177" letterSpacing="1.5">E 090°</text>
              <text x="300" y="356" textAnchor="middle" fontSize="6.5" fill="#8A8177" letterSpacing="1.5">S 180°</text>
              <text x="20" y="182" textAnchor="end" fontSize="6.5" fill="#8A8177" letterSpacing="1.5">W 270°</text>
            </g>

            <g className="pointer-events-none opacity-40">
              <line x1="155" y1="120" x2="95" y2="65" stroke="#D5B06C" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="155" y1="120" x2="235" y2="45" stroke="#D5B06C" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="445" y1="140" x2="515" y2="75" stroke="#7CB9E8" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="445" y1="140" x2="375" y2="55" stroke="#7CB9E8" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="300" y1="270" x2="185" y2="315" stroke="#C9A9FF" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="300" y1="270" x2="415" y2="305" stroke="#C9A9FF" strokeWidth="0.5" strokeDasharray="2 3" />

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

            {EDGES.map(([aId, bId]) => {
              const a = liveNodes.find((n) => n.id === aId);
              const b = liveNodes.find((n) => n.id === bId);
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

            {/* Dynamic Poem Stars orbiting Stella Lyricis */}
            {poemStars.map(({ work, cx, cy, parentCx, parentCy }) => {
              const isHovered = hoveredWorkStar?.slug === work.slug;
              const isDimmed = !matchesMood(work, selectedMood);
              return (
                <g key={`poem-${work.slug}`}>
                  <line
                    x1={parentCx}
                    y1={parentCy}
                    x2={cx}
                    y2={cy}
                    stroke="#D5B06C"
                    strokeWidth="0.4"
                    strokeOpacity={isHovered ? 0.75 : isDimmed ? 0.05 : 0.2}
                    strokeDasharray="2 3"
                  />
                  <WorkStar
                    work={work}
                    cx={cx}
                    cy={cy}
                    isHovered={isHovered}
                    isDimmed={isDimmed}
                    onEnter={() => setHoveredWorkStar(work)}
                    onLeave={() => setHoveredWorkStar(null)}
                    onClick={() => handleWorkClick(work)}
                  />
                </g>
              );
            })}

            {/* Dynamic Story Stars orbiting Stella Narrativa */}
            {storyStars.map(({ work, cx, cy, parentCx, parentCy }) => {
              const isHovered = hoveredWorkStar?.slug === work.slug;
              const isDimmed = !matchesMood(work, selectedMood);
              return (
                <g key={`story-${work.slug}`}>
                  <line
                    x1={parentCx}
                    y1={parentCy}
                    x2={cx}
                    y2={cy}
                    stroke="#7CB9E8"
                    strokeWidth="0.4"
                    strokeOpacity={isHovered ? 0.75 : isDimmed ? 0.05 : 0.2}
                    strokeDasharray="2 3"
                  />
                  <WorkStar
                    work={work}
                    cx={cx}
                    cy={cy}
                    isHovered={isHovered}
                    isDimmed={isDimmed}
                    onEnter={() => setHoveredWorkStar(work)}
                    onLeave={() => setHoveredWorkStar(null)}
                    onClick={() => handleWorkClick(work)}
                  />
                </g>
              );
            })}

            {liveNodes.map((node) => (
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

        {/* Hovered Work Preview Tooltip */}
        <AnimatePresence>
          {hoveredWorkStar && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 sm:bottom-20 z-30 pointer-events-none px-4"
            >
              <div className="bg-[#0B0D11]/95 border border-[#D5B06C]/50 rounded-2xl p-4 shadow-[0_0_35px_rgba(0,0,0,0.9)] max-w-sm text-center backdrop-blur-xl space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-[9px] uppercase font-sans tracking-[0.25em] text-[#D5B06C]">
                  <span>{hoveredWorkStar.category === 'poem' ? '✦ Lyrical Star' : '◈ Narrative Star'}</span>
                  <span>•</span>
                  <span>{hoveredWorkStar.read_time_minutes || 2} min read</span>
                  {hoveredWorkStar.gilded_likes_count > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#D5B06C]">
                        <Heart className="w-2.5 h-2.5 fill-current" /> {hoveredWorkStar.gilded_likes_count}
                      </span>
                    </>
                  )}
                </div>
                <h4 className="font-serif text-lg text-[#FEEFFF] font-normal leading-snug">
                  {hoveredWorkStar.title}
                </h4>
                <p className="font-sans text-[11px] text-[#8A8177]">
                  By {hoveredWorkStar.author || 'Anonymous'}
                </p>
                {hoveredWorkStar.excerpt && (
                  <p className="font-serif italic text-xs text-[#FEEFFF]/75 line-clamp-2 pt-1 border-t border-white/5">
                    "{hoveredWorkStar.excerpt}"
                  </p>
                )}
                <span className="inline-block text-[9px] uppercase font-sans tracking-widest text-[#D5B06C] pt-1 font-semibold">
                  Touch star to enter inscription →
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Hyperdrive Warp Transition */}
      <AnimatePresence>
        {warpWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg pointer-events-none"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ scale: [1, 2.8, 5], opacity: [0.9, 1, 0] }}
                transition={{ duration: 0.65, ease: 'easeIn' }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D5B06C] via-[#FEEFFF] to-[#7CB9E8] mx-auto shadow-[0_0_60px_#D5B06C]"
              />
              <p className="font-serif text-2xl text-[#FEEFFF] tracking-widest">
                Warping to "{warpWork.title}"...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CosmicSerendipityModal
        isOpen={isSerendipityOpen}
        onClose={() => setIsSerendipityOpen(false)}
      />
    </motion.div>
  );
};

export default HomeConstellation;