import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, X, ArrowRight, RotateCw, BookOpen, Clock, Heart } from 'lucide-react';
import workService from '../../services/workService';

export const CosmicSerendipityModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await workService.getPublishedWorks();
        setWorks(data || []);
      } catch (e) {}
    };
    load();
  }, []);

  const handleDrawStar = () => {
    if (works.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setHasDrawn(false);

    // Pick random work different from current if possible
    const available = works.filter((w) => !selectedWork || w.slug !== selectedWork.slug);
    const pool = available.length > 0 ? available : works;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      setSelectedWork(picked);
      setIsSpinning(false);
      setHasDrawn(true);
    }, 700);
  };

  useEffect(() => {
    if (isOpen) {
      handleDrawStar();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#0B0D11] border border-[#D5B06C]/40 rounded-3xl p-6 sm:p-8 text-center text-[#FEEFFF] shadow-[0_0_60px_rgba(213,176,108,0.2)] overflow-hidden"
        >
          {/* Cosmic Nebula Backlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#D5B06C]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-[#8A8177] hover:text-[#FEEFFF] rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Inscription */}
          <div className="space-y-1 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D5B06C]/30 bg-[#D5B06C]/10 text-[#D5B06C] text-[10px] font-sans uppercase tracking-[0.25em]">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Cosmic Serendipity</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal tracking-wide">
              The Constellation Oracle
            </h3>
            <p className="font-sans text-xs text-[#8A8177]">
              Let the universe choose the verse your soul needs tonight.
            </p>
          </div>

          {/* Celestial Tarot Card Container */}
          <div className="perspective-1000 my-6 flex justify-center">
            <motion.div
              animate={{
                rotateY: isSpinning ? 720 : 0,
                scale: isSpinning ? 0.92 : 1,
              }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="relative w-full max-w-sm rounded-2xl border-2 border-[#D5B06C]/50 bg-gradient-to-b from-[#12151C] to-[#08090C] p-6 sm:p-8 shadow-2xl overflow-hidden text-center group"
            >
              {/* Corner Ornaments */}
              <span className="absolute top-3 left-3 text-xs text-[#D5B06C]/60">✦</span>
              <span className="absolute top-3 right-3 text-xs text-[#D5B06C]/60">✦</span>
              <span className="absolute bottom-3 left-3 text-xs text-[#D5B06C]/60">✦</span>
              <span className="absolute bottom-3 right-3 text-xs text-[#D5B06C]/60">✦</span>

              {isSpinning ? (
                <div className="py-16 space-y-3">
                  <Sparkles className="w-10 h-10 text-[#D5B06C] mx-auto animate-spin" />
                  <p className="font-serif text-sm text-[#D5B06C] tracking-widest uppercase">
                    Aligning Stars...
                  </p>
                </div>
              ) : selectedWork ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#D5B06C] block">
                    {selectedWork.category === 'poem' ? '✦ Lyrical Inscription' : '◈ Narrative Chronicle'}
                  </span>

                  <h4 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal leading-tight">
                    {selectedWork.title}
                  </h4>

                  <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]">
                    By {selectedWork.author || 'Anonymous'}
                  </p>

                  {selectedWork.excerpt && (
                    <blockquote className="font-serif italic text-sm text-[#FEEFFF]/80 border-t border-b border-white/10 py-3 line-clamp-3">
                      "{selectedWork.excerpt}"
                    </blockquote>
                  )}

                  <div className="flex items-center justify-center gap-4 text-[11px] font-sans text-[#8A8177] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D5B06C]" /> {selectedWork.read_time_minutes || 2} min read
                    </span>
                    {selectedWork.gilded_likes_count > 0 && (
                      <span className="flex items-center gap-1 text-[#D5B06C]">
                        <Heart className="w-3 h-3 fill-current" /> {selectedWork.gilded_likes_count} Hearts
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="py-12 text-[#8A8177]">
                  <p className="font-serif text-base">Gathering sanctuary stars...</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDrawStar}
              disabled={isSpinning}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#8A8177]/30 bg-[#0F1216] text-xs font-sans uppercase tracking-widest text-[#8A8177] hover:text-[#FEEFFF] hover:border-[#D5B06C]/50 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>Draw Another Star</span>
            </button>

            {selectedWork && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/read/${selectedWork.slug}`);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#D5B06C] hover:bg-[#FEEFFF] text-[#080A06] text-xs font-sans uppercase tracking-widest font-semibold shadow-[0_0_20px_rgba(213,176,108,0.4)] transition-all cursor-pointer"
              >
                <span>Read Inscription</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CosmicSerendipityModal;
