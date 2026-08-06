import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import readerProgressService from '../../services/readerProgressService';

const PRESET_EMOJIS = [
  '❤️', '😭', '🤯', '😱', '👏', '💀', 
  '✨', '🔥', '🕯️', '🌙', '📜', '🥀', 
  '💫', '🖤', '🍷', '🕊️', '⏳', '👁️'
];

export const EmojiReactions = ({ workKey, initialReactions = {} }) => {
  const [reactions, setReactions] = useState(() => {
    const saved = readerProgressService.getEmojiReactions(workKey);
    return Object.keys(saved).length > 0 ? saved : initialReactions;
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [burstParticles, setBurstParticles] = useState([]);

  const handleEmojiClick = (emoji, e) => {
    if (!workKey || !emoji) return;

    const { reactions: updatedReactions } = readerProgressService.toggleEmojiReaction(workKey, emoji);
    setReactions(updatedReactions);

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      const newParticles = Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const velocity = 30 + Math.random() * 35;
        return {
          id: Date.now() + i,
          x: originX,
          y: originY,
          targetX: originX + Math.cos(angle) * velocity,
          targetY: originY + Math.sin(angle) * velocity,
          size: Math.random() * 4 + 2,
        };
      });

      setBurstParticles(newParticles);
      setTimeout(() => setBurstParticles([]), 650);
    }
  };

  const handleAddCustomEmoji = (e) => {
    e.preventDefault();
    const trimmed = customEmojiInput.trim();
    if (trimmed) {
      handleEmojiClick(trimmed, e);
      setCustomEmojiInput('');
      setIsPickerOpen(false);
    }
  };

  const activeEmojiList = Object.keys(reactions);

  return (
    <div className="relative bg-[#0F1216]/60 border border-[#8A8177]/20 p-4 md:p-5 rounded-2xl my-10 backdrop-blur-md">
      <AnimatePresence>
        {burstParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
            animate={{ x: p.targetX, y: p.targetY, opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed z-50 rounded-full bg-[#D5B06C] pointer-events-none shadow-[0_0_10px_#D5B06C]"
            style={{ width: p.size, height: p.size }}
          />
        ))}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D5B06C] font-medium">
          Inscription Resonances
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {activeEmojiList.map((emoji) => {
            const count = reactions[emoji] || 0;
            const hasReacted = readerProgressService.hasUserReacted(workKey, emoji);
            if (count <= 0) return null;

            return (
              <motion.button
                key={emoji}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={(e) => handleEmojiClick(emoji, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer text-sm shadow-sm ${
                  hasReacted
                    ? 'bg-[#D5B06C]/20 border-[#D5B06C] text-[#D5B06C] shadow-[0_0_12px_rgba(213,176,108,0.25)]'
                    : 'bg-[#080A06]/60 border-[#8A8177]/20 text-[#8A8177] hover:border-[#D5B06C]/40 hover:text-[#FEEFFF]'
                }`}
              >
                <span>{emoji}</span>
                <span className="font-sans text-[10px] font-mono">{count}</span>
              </motion.button>
            );
          })}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#080A06]/80 border border-[#D5B06C]/40 text-[#D5B06C] hover:bg-[#D5B06C] hover:text-[#080A06] font-sans text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
            >
              <span>+</span>
              <span>React</span>
            </button>

            <AnimatePresence>
              {isPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute right-0 bottom-14 z-50 w-72 sm:w-80 p-4 rounded-2xl bg-[#0F1216] border border-[#D5B06C]/50 shadow-[0_15px_35px_rgba(0,0,0,0.95)] backdrop-blur-2xl space-y-3.5 box-border"
                >
                  <div className="flex items-center justify-between border-b border-[#8A8177]/20 pb-2.5">
                    <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C] font-semibold">
                      Choose Resonance
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(false)}
                      className="text-[#8A8177] hover:text-[#FEEFFF] text-sm font-sans cursor-pointer p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1 bg-[#080A06]/50 rounded-xl border border-[#8A8177]/10">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => {
                          handleEmojiClick(emoji, e);
                          setIsPickerOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-[#D5B06C]/25 hover:scale-110 transition-all text-xl text-center cursor-pointer select-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleAddCustomEmoji} className="flex items-center gap-2 pt-2 border-t border-[#8A8177]/20 w-full">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Custom emoji..."
                      value={customEmojiInput}
                      onChange={(e) => setCustomEmojiInput(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-[#080A06] border border-[#8A8177]/30 text-sm text-[#FEEFFF] focus:border-[#D5B06C] focus:outline-hidden placeholder:text-[#8A8177]/60"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#D5B06C] text-[#080A06] font-sans text-xs uppercase tracking-widest font-bold hover:bg-[#FEEFFF] transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                    >
                      Add
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmojiReactions;
