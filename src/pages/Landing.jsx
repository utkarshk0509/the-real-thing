import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import moonImg from '../assets/moon.png';
import mountainsImg from '../assets/mountains.png';
import CosmicNebulaBackground from '../components/Shared/CosmicNebulaBackground';

export default function Landing() {
  const navigate = useNavigate();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const moonX = useSpring(mouseX, { stiffness: 22, damping: 25 });
  const moonY = useSpring(mouseY, { stiffness: 22, damping: 25 });
  const fogX = useSpring(mouseX, { stiffness: 35, damping: 30 });
  const fogY = useSpring(mouseY, { stiffness: 35, damping: 30 });
  const heroX = useSpring(mouseX, { stiffness: 55, damping: 30 });
  const heroY = useSpring(mouseY, { stiffness: 55, damping: 30 });
  const mountainsX = useSpring(mouseX, { stiffness: 18, damping: 22 });

  const foregroundBokehX = useSpring(mouseX, { stiffness: 85, damping: 35 });
  const foregroundBokehY = useSpring(mouseY, { stiffness: 85, damping: 35 });

  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set(((e.clientX - cx) / cx) * 28);
      mouseY.set(((e.clientY - cy) / cy) * 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleEnterSanctuary = () => {
    if (isEntering) return;
    setIsEntering(true);
    setTimeout(() => {
      navigate('/hub');
    }, 550);
  };

  return (
    <motion.div
      className="relative h-screen w-full overflow-hidden bg-[#050608] text-[#FEEFFF] flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8 } }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <CosmicNebulaBackground variant="poems" />

      <motion.nav
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute top-8 md:top-10 w-full flex justify-center items-center gap-6 md:gap-10 text-[#8A8177] font-sans text-[11px] uppercase tracking-[0.35em] z-50 px-4"
      >
        <span
          onClick={() => navigate('/hub')}
          className="hover:text-[#D5B06C] transition-all cursor-pointer hover:drop-shadow-[0_0_8px_rgba(213,176,108,0.8)]"
        >
          Constellation
        </span>
        <span className="opacity-25">✦</span>
        <span
          onClick={() => navigate('/poems')}
          className="hover:text-[#D5B06C] transition-all cursor-pointer hover:drop-shadow-[0_0_8px_rgba(213,176,108,0.8)]"
        >
          Poems
        </span>
        <span className="opacity-25">✦</span>
        <span
          onClick={() => navigate('/stories')}
          className="hover:text-[#7CB9E8] transition-all cursor-pointer hover:drop-shadow-[0_0_8px_rgba(124,185,232,0.8)]"
        >
          Stories
        </span>
        <span className="opacity-25">✦</span>
        <span
          onClick={() => navigate('/about')}
          className="hover:text-[#C9A9FF] transition-all cursor-pointer hover:drop-shadow-[0_0_8px_rgba(201,169,255,0.8)]"
        >
          About
        </span>
      </motion.nav>

      <motion.div
        style={{ x: moonX, y: moonY }}
        className="absolute top-[4%] right-[4%] md:top-[6%] md:right-[9%] w-[220px] md:w-[360px] pointer-events-none z-10"
      >
        <motion.div
          animate={{ opacity: [0.75, 0.98, 0.75], scale: [0.97, 1.03, 0.97] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(213,176,108,0.35)_0%,rgba(124,185,232,0.1)_45%,transparent_75%)] blur-3xl pointer-events-none" />
          <img
            src={moonImg}
            alt="Sanctuary Moon"
            className="w-full object-contain mix-blend-screen drop-shadow-[0_0_55px_rgba(213,176,108,0.5)]"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x: fogX, y: fogY }}
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      >
        <motion.div
          animate={{ x: [-120, 120, -120], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-[-20%] w-[140%] h-[220px] bg-[radial-gradient(ellipse_at_center,rgba(213,176,108,0.08)_0%,rgba(15,18,22,0.4)_50%,transparent_80%)] blur-3xl [mask-image:radial-gradient(circle_at_center,transparent_35%,black_80%)]"
        />
        <motion.div
          animate={{ x: [100, -100, 100], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-[-15%] w-[130%] h-[200px] bg-[radial-gradient(ellipse_at_center,rgba(124,185,232,0.06)_0%,rgba(10,12,16,0.4)_55%,transparent_80%)] blur-3xl [mask-image:radial-gradient(circle_at_center,transparent_35%,black_80%)]"
        />
      </motion.div>

      <motion.div
        style={{ x: heroX, y: heroY }}
        className="relative z-50 flex flex-col items-center text-center space-y-6 max-w-2xl px-4"
        initial={{ y: 25, opacity: 0 }}
        animate={{
          y: isEntering ? -35 : 0,
          opacity: isEntering ? 0 : 1,
          scale: isEntering ? 0.95 : 1,
          filter: isEntering ? 'blur(8px)' : 'blur(0px)',
        }}
        transition={{
          duration: isEntering ? 0.45 : 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D5B06C]/35 bg-[#D5B06C]/10 backdrop-blur-md shadow-[0_0_20px_rgba(213,176,108,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D5B06C] animate-pulse" />
          <span className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-[#D5B06C] font-semibold">
            Poetic & Story Sanctuary
          </span>
        </motion.div>

        <motion.h1
          initial={{ filter: 'blur(12px)', opacity: 0 }}
          animate={{ filter: 'blur(0px)', opacity: 1 }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: 0.2 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-[#FEEFFF] tracking-widest leading-none drop-shadow-[0_0_60px_rgba(213,176,108,0.35)]"
        >
          The Real Thing
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-px w-40 md:w-60 bg-gradient-to-r from-transparent via-[#D5B06C] to-transparent opacity-85"
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.45 }}
          className="space-y-2 max-w-lg"
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#D5B06C] font-semibold opacity-90">
            You have stepped beyond the veil
          </p>
          <p className="font-serif text-base md:text-xl text-[#FEEFFF]/90 font-light leading-relaxed italic text-shadow-sm">
            “Into a realm where words become living stars.”
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-50 cursor-pointer group pt-4"
          onClick={handleEnterSanctuary}
        >
          <div className="absolute inset-0 rounded-full bg-[#D5B06C]/25 blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

          <div className="relative flex flex-col items-center gap-3">
            <div className="relative overflow-hidden flex items-center justify-center px-10 py-3.5 rounded-full bg-[#D5B06C] text-[#080A06] border border-[#FEEFFF]/80 shadow-[0_0_20px_rgba(213,176,108,0.35)] group-hover:shadow-[0_0_35px_rgba(213,176,108,0.65)] group-hover:bg-[#FEEFFF] transition-all duration-300">
              <span className="font-serif text-xs md:text-sm uppercase tracking-[0.4em] text-[#080A06] font-bold transition-colors">
                Enter Sanctuary
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5B06C] animate-pulse" />
              <span className="font-sans text-[9.5px] uppercase tracking-[0.25em] text-[#D5B06C] font-medium opacity-90">
                Click to open constellation map
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x: mountainsX }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 1.6, delay: 0.3, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 w-full h-[28vh] md:h-[32vh] z-10 pointer-events-none"
      >
        <img
          src={mountainsImg}
          alt="Sanctuary Mountains"
          className="w-full h-full object-cover object-bottom [mask-image:linear-gradient(to_bottom,transparent_0%,black_35%)] opacity-80 filter drop-shadow-[0_-10px_20px_rgba(0,0,0,0.8)]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent opacity-90" />
      </motion.div>

      <motion.div
        style={{ x: foregroundBokehX, y: foregroundBokehY }}
        className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
      >
        {Array.from({ length: 14 }).map((_, i) => {
          const top = (i * 7 + 12) % 90;
          const left = (i * 13 + 5) % 95;
          const size = 1.5 + (i % 3) * 1.2;
          const duration = 5 + (i % 4) * 2;
          const delay = (i % 5) * 0.8;

          return (
            <motion.div
              key={i}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              animate={{
                y: [-15, 15, -15],
                opacity: [0.15, 0.75, 0.15],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute rounded-full bg-[#D5B06C] shadow-[0_0_10px_#D5B06C]"
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}