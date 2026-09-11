import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, BookOpen, Clock, Heart, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import workService from '../../services/workService';

export const CosmicSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [works, setWorks] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'poem', 'story'
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const data = await workService.getPublishedWorks();
        setWorks(data || []);
      } catch (e) {
        console.warn('Error fetching search works:', e);
      }
    };
    fetchWorks();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global key listener for shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered from parent or external
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered Results
  const results = works.filter((w) => {
    if (!w) return false;
    if (filterCategory !== 'all' && w.category !== filterCategory) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    const titleMatch = (w.title || '').toLowerCase().includes(q);
    const authorMatch = (w.author || '').toLowerCase().includes(q);
    const excerptMatch = (w.excerpt || '').toLowerCase().includes(q);
    const bodyMatch = (w.body || '').toLowerCase().includes(q);

    return titleMatch || authorMatch || excerptMatch || bodyMatch;
  });

  // Keyboard navigation inside list
  const handleListKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectWork(results[selectedIndex].slug);
      }
    }
  };

  const handleSelectWork = (slug) => {
    onClose();
    navigate(`/read/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#0C0E12] border border-[#D5B06C]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-[#FEEFFF]"
        >
          {/* Subtle Starlight Gradient Flare */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-[#D5B06C]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Search Input Bar */}
          <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-white/10 gap-3">
            <Search className="w-5 h-5 text-[#D5B06C] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleListKeyDown}
              placeholder="Search poems, verses, prose, authors..."
              className="w-full bg-transparent text-[#FEEFFF] placeholder-[#8A8177] font-serif text-lg sm:text-xl focus:outline-none tracking-wide"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-[#8A8177] hover:text-[#FEEFFF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-sans tracking-widest text-[#8A8177] bg-[#141820] border border-white/10 px-2 py-1 rounded">
              <span>ESC</span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-white/5 bg-[#090B0E]/60 text-xs font-sans">
            <span className="text-[10px] uppercase tracking-widest text-[#8A8177] mr-1">Filter:</span>
            {[
              { id: 'all', label: 'All Inscriptions' },
              { id: 'poem', label: '✦ Poems' },
              { id: 'story', label: '◈ Stories' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  setFilterCategory(chip.id);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                  filterCategory === chip.id
                    ? 'bg-[#D5B06C]/20 border border-[#D5B06C]/60 text-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF] border border-transparent'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Search Results List */}
          <div className="max-h-[55vh] overflow-y-auto p-2 sm:p-3 space-y-1">
            {results.length === 0 ? (
              <div className="py-12 text-center text-[#8A8177] space-y-2">
                <Sparkles className="w-8 h-8 text-[#D5B06C]/40 mx-auto animate-pulse" />
                <p className="font-serif text-lg">No constellations match your query</p>
                <p className="font-sans text-xs text-[#8A8177]/70">
                  Try searching for keywords like "stars", "silence", or "love".
                </p>
              </div>
            ) : (
              results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isPoem = item.category === 'poem';

                return (
                  <div
                    key={item.id || item.slug}
                    onClick={() => handleSelectWork(item.slug)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#151921] border border-[#D5B06C]/50 shadow-[0_0_20px_rgba(213,176,108,0.15)]'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 pr-4">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                          isPoem
                            ? 'border-[#D5B06C]/30 bg-[#D5B06C]/10 text-[#D5B06C]'
                            : 'border-[#7CB9E8]/30 bg-[#7CB9E8]/10 text-[#7CB9E8]'
                        }`}
                      >
                        {isPoem ? '✦' : '◈'}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base sm:text-lg text-[#FEEFFF] group-hover:text-[#D5B06C] transition-colors truncate">
                            {item.title}
                          </h4>
                          <span
                            className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                              isPoem
                                ? 'border-[#D5B06C]/30 text-[#D5B06C]'
                                : 'border-[#7CB9E8]/30 text-[#7CB9E8]'
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>

                        {item.excerpt && (
                          <p className="font-sans text-xs text-[#8A8177] line-clamp-1 italic">
                            "{item.excerpt}"
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-[#8A8177] font-sans">
                          <span>By {item.author || 'Anonymous'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.read_time_minutes || 2}m
                          </span>
                          {item.gilded_likes_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-[#D5B06C]">
                                <Heart className="w-3 h-3 fill-current" /> {item.gilded_likes_count}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isSelected && (
                        <span className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-sans tracking-widest text-[#D5B06C]">
                          Read <CornerDownLeft className="w-3 h-3" />
                        </span>
                      )}
                      <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#D5B06C] translate-x-1' : 'text-[#8A8177]/40'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 sm:px-6 py-3 border-t border-white/10 bg-[#080A0D] flex items-center justify-between text-[11px] text-[#8A8177] font-sans">
            <div className="flex items-center gap-4">
              <span><strong className="text-[#FEEFFF]">↑↓</strong> Navigate</span>
              <span><strong className="text-[#FEEFFF]">↵</strong> Read</span>
              <span><strong className="text-[#FEEFFF]">ESC</strong> Close</span>
            </div>
            <span className="text-[#D5B06C]">{results.length} Inscriptions</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CosmicSearchModal;
