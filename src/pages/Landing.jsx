import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MoveDown, Sparkles, Compass } from 'lucide-react';

import moonImg from '../assets/moon.png';
import mountainsImg from '../assets/mountains.png';
import CosmicNebulaBackground from '../components/Shared/CosmicNebulaBackground';

export default function Landing() {
  const navigate = useNavigate();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const moonX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const moonY = useSpring(mouseY, { stiffness: 40, damping: 25 });
  const heroX = useSpring(mouseX, { stiffness: 65, damping: 30 });
  const heroY = useSpring(mouseY, { stiffness: 65, damping: 30 });
  const mountainsX = useSpring(mouseX, { stiffness: 20, damping: 20 });

  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set(((e.clientX - cx) / cx) * 20);
      mouseY.set(((e.clientY - cy) / cy) * 15);
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
        className="absolute top-8 md:top-10 w-full flex justify-center items-center gap-6 md:gap-10 text-[#8A8177] font-sans text-[11px] uppercase tracking-[0.35em] z-30 px-4"
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
        className="absolute top-[5%] right-[5%] md:top-[7%] md:right-[10%] w-[200px] md:w-[320px] pointer-events-none z-10"
      >
        <motion.div
          animate={{ opacity: [0.75, 0.95, 0.75], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(213,176,108,0.25)_0%,transparent_70%)] blur-2xl pointer-events-none" />
          <img
            src={moonImg}
            alt="Sanctuary Moon"
            className="w-full object-contain mix-blend-screen drop-shadow-[0_0_45px_rgba(213,176,108,0.4)]"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x: heroX, y: heroY }}
        className="relative z-20 flex flex-col items-center text-center space-y-6 max-w-2xl px-4"
        initial={{ y: 25, opacity: 0 }}
        animate={{
          y: isEntering ? -30 : 0,
          opacity: isEntering ? 0 : 1,
          scale: isEntering ? 0.96 : 1,
          filter: isEntering ? 'blur(6px)' : 'blur(0px)',
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
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-[#FEEFFF] tracking-widest leading-none drop-shadow-[0_0_55px_rgba(213,176,108,0.3)]"
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
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          className="relative cursor-pointer group pt-4"
          onClick={handleEnterSanctuary}
        >
          <div className="absolute inset-0 rounded-full bg-[#D5B06C]/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 px-8 py-3.5 rounded-full border border-[#D5B06C]/60 bg-[#0F1216]/85 backdrop-blur-md group-hover:border-[#D5B06C] group-hover:bg-[#D5B06C]/20 shadow-[0_0_30px_rgba(213,176,108,0.25)] group-hover:shadow-[0_0_50px_rgba(213,176,108,0.55)] transition-all duration-300">
              <Compass className="w-4 h-4 text-[#D5B06C] group-hover:rotate-90 transition-transform duration-700" />
              <span className="font-sans text-xs uppercase tracking-[0.35em] text-[#FEEFFF] group-hover:text-[#D5B06C] font-semibold transition-colors">
                Enter Sanctuary
              </span>
              <MoveDown className="w-4 h-4 text-[#D5B06C] animate-bounce" />
            </div>

            <span className="font-sans text-[9.5px] uppercase tracking-[0.25em] text-[#8A8177] group-hover:text-[#D5B06C] transition-colors font-medium">
              Click to open constellation map
            </span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x: mountainsX }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 1.6, delay: 0.3, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 w-full h-[36vh] md:h-[42vh] z-10 pointer-events-none"
      >
        <img
          src={mountainsImg}
          alt="Sanctuary Mountains"
          className="w-full h-full object-cover object-bottom [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%)] opacity-90 filter drop-shadow-[0_-10px_20px_rgba(0,0,0,0.8)]"
        />
      </motion.div>
    </motion.div>
  );
}