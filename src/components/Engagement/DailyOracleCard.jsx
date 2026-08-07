import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X, ArrowRight, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ORACLE_THEMES = [
  {
    title: "Constellation of Quiet Desires",
    quote: "In the silence between stanzas, truth finds its loudest voice.",
    category: "poem"
  },
  {
    title: "The Midnight Threshold",
    quote: "Step beyond the noise of time into the quiet sanctuary of prose.",
    category: "story"
  },
  {
    title: "Celestial Resonance",
    quote: "Words do not fade in the dark; they bloom like quiet starlight.",
    category: "poem"
  },
  {
    title: "The Immutable Real Thing",
    quote: "Amid fleeting digital noise, authentic human emotion endures.",
    category: "poem"
  },
  {
    title: "Chronicles of Starlight",
    quote: "Every heart holds an unwritten verse waiting to be remembered.",
    category: "story"
  }
];

export const DailyOracleCard = ({ works = [], isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeOracle, setActiveOracle] = useState(null);
  const [sparkParticles, setSparkParticles] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);

  const drawCard = () => {
    setIsFlipped(false);
    const randomTheme = ORACLE_THEMES[Math.floor(Math.random() * ORACLE_THEMES.length)];
    const matchingWorks = works.filter((w) => w.category === randomTheme.category && w.status === 'published');
    const pickedWork = matchingWorks.length > 0
      ? matchingWorks[Math.floor(Math.random() * matchingWorks.length)]
      : (works[0] || null);

    setActiveOracle(randomTheme);
    setSelectedWork(pickedWork);
  };

  useEffect(() => {
    if (isOpen) {
      drawCard();
    }
  }, [isOpen]);

  const handleFlipCard = () => {
    if (isFlipped) return;

    setIsFlipped(true);

    const particles = Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const dist = 60 + Math.random() * 80;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: Math.random() * 4 + 2,
      };
    });
    setSparkParticles(particles);
    setTimeout(() => setSparkParticles([]), 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/90 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-md w-full my-auto"
      >
        <div className="flex items-center justify-between border-b border-[#8A8177]/20 pb-3 mb-6">
          <div className="flex items-center gap-2 text-[#D5B06C]">
            <Compass className="w-4 h-4" />
            <span className="font-sans text-xs uppercase tracking-[0.3em] font-semibold">
              Daily Sanctuary Oracle
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8A8177] hover:text-[#FEEFFF] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative w-full h-[460px] perspective-1000">
          <AnimatePresence>
            {sparkParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 z-40 rounded-full bg-[#D5B06C] shadow-[0_0_12px_#D5B06C] pointer-events-none"
                style={{ width: p.size, height: p.size }}
              />
            ))}
          </AnimatePresence>

          <motion.div
            onClick={handleFlipCard}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-full h-full relative rounded-3xl cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
          >
            <div
              style={{ backfaceVisibility: 'hidden' }}
              className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-b from-[#D5B06C]/70 via-[#8A8177]/30 to-[#D5B06C]/70 overflow-hidden"
            >
              <div className="w-full h-full bg-[#0F1216] rounded-[23px] p-8 flex flex-col items-center justify-between text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(213,176,108,0.15)_0%,transparent_75%)]" />

                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D5B06C]/70" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D5B06C]/70" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#D5B06C]/70" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#D5B06C]/70" />

                <div className="relative z-10 space-y-2 pt-4">
                  <div className="w-12 h-12 rounded-full border border-[#D5B06C]/40 bg-[#D5B06C]/10 flex items-center justify-center text-[#D5B06C] mx-auto shadow-[0_0_20px_rgba(213,176,108,0.3)]">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#D5B06C] font-semibold block">
                    Oracle Archetype
                  </span>
                </div>

                <div className="relative z-10 space-y-4 my-auto">
                  <div className="w-24 h-24 rounded-full border border-[#D5B06C]/30 mx-auto flex items-center justify-center relative">
                    <div className="w-20 h-20 rounded-full border border-[#8A8177]/20 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D5B06C]" />
                    </div>
                    <span className="font-serif text-2xl text-[#D5B06C] absolute">✦</span>
                  </div>
                  <p className="font-serif text-base text-[#FEEFFF]/80 italic">
                    "Tap to reveal your daily sanctuary card..."
                  </p>
                </div>

                <div className="relative z-10 pb-2">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-[#8A8177] px-4 py-2 rounded-full border border-[#8A8177]/20 bg-black/40">
                    Tap Card to Draw
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-b from-[#7CB9E8]/70 via-[#D5B06C]/50 to-[#C9A9FF]/70 overflow-hidden"
            >
              <div className="w-full h-full bg-[#080A06] rounded-[23px] p-7 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,185,232,0.12)_0%,transparent_70%)] pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#7CB9E8] font-semibold">
                      Daily Sanctuary Card
                    </span>
                    <span className="font-sans text-[9px] uppercase tracking-widest text-[#D5B06C] px-2 py-0.5 rounded bg-[#D5B06C]/10 border border-[#D5B06C]/30">
                      {activeOracle?.category}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl text-[#FEEFFF] tracking-wide font-normal">
                    {activeOracle?.title}
                  </h3>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D5B06C]/40 to-transparent" />

                  <p className="font-serif text-sm text-[#FEEFFF]/90 italic leading-relaxed pt-1">
                    "{activeOracle?.quote}"
                  </p>
                </div>

                {selectedWork && (
                  <div className="relative z-10 p-4 rounded-xl bg-[#0F1216] border border-[#8A8177]/20 space-y-2">
                    <span className="font-sans text-[8px] uppercase tracking-widest text-[#8A8177]">
                      Recommended Inscription
                    </span>
                    <h4 className="font-serif text-base text-[#FEEFFF]">
                      {selectedWork.title}
                    </h4>
                    <p className="font-sans text-[10px] text-[#8A8177] line-clamp-2">
                      {selectedWork.excerpt || selectedWork.body?.slice(0, 80) + '...'}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        navigate(`/read/${selectedWork.slug}`);
                      }}
                      className="w-full py-2 rounded-lg bg-[#D5B06C] text-[#080A06] font-sans text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-md mt-1"
                    >
                      <span>Read Daily Inscription</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="relative z-10 flex justify-between items-center pt-2 border-t border-[#8A8177]/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      drawCard();
                    }}
                    className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Redraw Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] hover:text-[#FEEFFF] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyOracleCard;
