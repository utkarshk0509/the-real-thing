import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] flex flex-col items-center justify-center px-6 overflow-hidden select-none"
    >
      <AtmosphericBackground />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="font-serif text-5xl md:text-7xl font-normal tracking-wide text-[#FEEFFF]">
            The Real Thing
          </h1>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#D5B06C]">
            A Sanctuary for Poetry & Prose
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(213,176,108,0.25)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/hub')}
          className="px-8 py-3.5 rounded border border-[#D5B06C]/40 text-[#D5B06C] font-sans text-xs uppercase tracking-[0.25em] bg-[#0F1216]/50 backdrop-blur-sm hover:bg-[#D5B06C] hover:text-[#080A06] transition-all duration-500 cursor-pointer"
        >
          Enter Content Hub
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Landing;