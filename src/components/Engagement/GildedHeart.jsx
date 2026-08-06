import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GildedHeart — Resonance (like) button.
 *
 * Props:
 *  workId        – stable unique key for this work (use work.id from DB, not slug)
 *  initialCount  – gilded_likes_count from the server (source of truth for display)
 *  onToggleLike  – async (isLiking: bool, increment: number) => void
 *                  called AFTER local state updates so UI is instant
 */
export const GildedHeart = ({ workId, initialCount = 0, onToggleLike }) => {
  const effectiveId = workId || 'default';
  // Only store whether this user has liked — NOT the count (count lives on the server)
  const likedKey = `real_thing_liked_${effectiveId}`;

  const [hasLiked, setHasLiked] = useState(() => {
    try { return localStorage.getItem(likedKey) === 'true'; } catch { return false; }
  });

  // Optimistic count: start from server value, adjust by +1/-1 for instant feedback
  const [displayCount, setDisplayCount] = useState(initialCount);

  // When the server gives us a fresh initialCount, sync it (but keep the ±1 offset
  // if the user has liked locally so the number doesn't jump).
  const prevInitialCount = useRef(initialCount);
  useEffect(() => {
    if (prevInitialCount.current !== initialCount) {
      prevInitialCount.current = initialCount;
      // Re-apply the local ±1 optimistic offset on top of the fresh server value
      const localLiked = (() => { try { return localStorage.getItem(likedKey) === 'true'; } catch { return false; } })();
      setDisplayCount(localLiked ? Math.max(0, initialCount) : Math.max(0, initialCount));
      setHasLiked(localLiked);
    }
  }, [initialCount, likedKey]);

  const [particles, setParticles] = useState([]);
  const [isPending, setIsPending] = useState(false);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === likedKey) {
        setHasLiked(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [likedKey]);

  const handleToggle = async () => {
    if (isPending || !workId) return; // Debounce: wait for in-flight request
    setIsPending(true);

    const nextLiked = !hasLiked;
    const increment = nextLiked ? 1 : -1;
    const nextCount = Math.max(0, displayCount + increment);

    // --- Optimistic UI update (instant) ---
    setHasLiked(nextLiked);
    setDisplayCount(nextCount);
    try { localStorage.setItem(likedKey, nextLiked ? 'true' : 'false'); } catch {}

    // Spawn particles on like
    if (nextLiked) {
      setParticles(
        Array.from({ length: 6 }, (_, i) => ({
          id: Date.now() + i,
          x: (Math.random() - 0.5) * 60,
          y: -Math.random() * 50 - 20,
          scale: Math.random() * 0.6 + 0.4,
        }))
      );
    }

    // --- Persist to server ---
    try {
      if (onToggleLike) {
        await onToggleLike(nextLiked, increment);
      }
    } catch (err) {
      // Server failed — roll back optimistic update
      console.warn('[GildedHeart] Like sync failed, rolling back:', err);
      setHasLiked(!nextLiked);
      setDisplayCount(displayCount);
      try { localStorage.setItem(likedKey, (!nextLiked) ? 'true' : 'false'); } catch {}
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-3 select-none">
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label="Gilded Resonance"
        className={`group relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 cursor-pointer disabled:cursor-wait ${
          hasLiked
            ? 'border-[#D5B06C] bg-[#D5B06C]/15 shadow-[0_0_20px_rgba(213,176,108,0.35)]'
            : 'border-[#8A8177]/30 bg-[#0F1216] hover:border-[#D5B06C] hover:bg-[#D5B06C]/5'
        }`}
      >
        <motion.svg
          whileTap={{ scale: 0.85 }}
          animate={hasLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`w-5 h-5 transition-colors duration-300 ${
            hasLiked
              ? 'fill-[#D5B06C] stroke-[#D5B06C]'
              : 'fill-transparent stroke-[#8A8177] group-hover:stroke-[#D5B06C]'
          }`}
          strokeWidth="1.5"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </motion.svg>

        {/* Floating Sparks */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: p.scale }}
              animate={{ opacity: 0, x: p.x, y: p.y }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() =>
                setParticles((prev) => prev.filter((sp) => sp.id !== p.id))
              }
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#D5B06C] pointer-events-none shadow-[0_0_8px_#D5B06C]"
            />
          ))}
        </AnimatePresence>
      </button>

      <span className="font-sans text-xs tracking-widest uppercase font-medium text-[#8A8177]">
        <span className={hasLiked ? 'text-[#D5B06C]' : ''}>{displayCount}</span> Resonances
      </span>
    </div>
  );
};

export default GildedHeart;