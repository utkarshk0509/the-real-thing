import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Palette, Type, Check, Eye, Sparkles, Share2 } from 'lucide-react';
import CosmicNebulaBackground from '../components/Shared/CosmicNebulaBackground';
import Navigation from '../components/Shared/Navigation';
import AnonymousComments from '../components/Engagement/AnonymousComments';
import GildedHeart from '../components/Engagement/GildedHeart';
import QuoteCardExporterModal from '../components/Engagement/QuoteCardExporterModal';
import StanzaStardustReaction from '../components/Engagement/StanzaStardustReaction';
import useReader from '../hooks/useReader';
import useComments from '../hooks/useComments';
import useAuth from '../hooks/useAuth';
import readerProgressService from '../services/readerProgressService';

export const ReaderView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { work, loading, handleToggleLike } = useReader(slug);
  const { comments, addComment, deleteComment } = useComments(work?.id);
  const { isCurator } = useAuth();

  const viewMode = readerProgressService.getViewPreference();
  const isBookshelfMode = viewMode === 'bookshelf';
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isClosingBook, setIsClosingBook] = useState(false);

  const [scrollProgressPercent, setScrollProgressPercent] = useState(0);
  const [maxProgressPercent, setMaxProgressPercent] = useState(0);

  const [readerSettings, setReaderSettings] = useState(() => {
    const saved = readerProgressService.getReaderSettings();
    return {
      focusSpotlight: true,
      ...saved,
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  const [selectedText, setSelectedText] = useState('');
  const [quoteTooltipPos, setQuoteTooltipPos] = useState(null);
  const [quoteSavedNotice, setQuoteSavedNotice] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteToExport, setQuoteToExport] = useState('');
  const [stardustEvent, setStardustEvent] = useState({ key: 0, pIndex: null, x: 50, y: 50 });

  const [paragraphBookmarks, setParagraphBookmarks] = useState({});

  const bookmarkedRef = useRef(null);
  const paragraphRefs = useRef([]);

  const categoryRoute = work?.category === 'story' ? '/stories' : '/poems';
  const categoryLabel = work?.category === 'story' ? 'Stories' : 'Poems';

  const handleReturnNav = () => {
    if (isBookshelfMode) {
      setIsClosingBook(true);
      setTimeout(() => {
        navigate(categoryRoute, { replace: true });
      }, 1800);
    } else {
      navigate(categoryRoute, { replace: true });
    }
  };

  useEffect(() => {
    if (work && work.slug) {
      const existingLastRead = readerProgressService.getLastRead(work.category);
      const savedMaxPercentage = (existingLastRead && existingLastRead.slug === work.slug)
        ? (existingLastRead.scrollPercentage || 0)
        : 0;

      setMaxProgressPercent(savedMaxPercentage);

      readerProgressService.saveLastRead({
        slug: work.slug,
        title: work.title,
        author: work.author,
        category: work.category,
        scrollPercentage: savedMaxPercentage,
        paragraphIndex: 0,
      });

      const savedBookmarks = readerProgressService.getParagraphBookmarks();
      setParagraphBookmarks(savedBookmarks);

      setIsCoverOpen(false);
      const timer = setTimeout(() => {
        setIsCoverOpen(true);
      }, 150);

      if (savedBookmarks[work.slug] !== undefined && bookmarkedRef.current) {
        setTimeout(() => {
          bookmarkedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }

      return () => clearTimeout(timer);
    }
  }, [work]);

  useEffect(() => {
    const handlePopState = () => {
      if (!work) return;
      const targetCategoryRoute = work.category === 'story' ? '/stories' : '/poems';
      if (isBookshelfMode) {
        setIsClosingBook(true);
        setTimeout(() => {
          navigate(targetCategoryRoute, { replace: true });
        }, 1800);
      } else {
        navigate(targetCategoryRoute, { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [work, isBookshelfMode, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (!work || !work.slug) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (totalHeight <= 0) {
        setScrollProgressPercent(100);
        setMaxProgressPercent(100);
        return;
      }

      const currentScroll = Math.max(0, window.scrollY);
      const currentScrollPercentage = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));

      setScrollProgressPercent(currentScrollPercentage);

      setMaxProgressPercent((prevMax) => {
        const newMaxPercentage = Math.max(prevMax, currentScrollPercentage);

        readerProgressService.saveLastRead({
          slug: work.slug,
          title: work.title,
          author: work.author,
          category: work.category,
          scrollPercentage: newMaxPercentage,
          paragraphIndex: paragraphBookmarks[work.slug] || 0,
        });

        if (newMaxPercentage >= 90) {
          const statuses = readerProgressService.getLibraryStatuses();
          if (statuses[work.slug] !== 'Completed') {
            readerProgressService.setWorkLibraryStatus(work.slug, 'Completed');
          }
        }

        return newMaxPercentage;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [work, paragraphBookmarks]);

  useEffect(() => {
    if (!readerSettings.focusSpotlight || paragraphRefs.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-pindex'));
            if (!isNaN(index)) {
              setActiveParagraphIndex(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0.2,
      }
    );

    paragraphRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [work, readerSettings.focusSpotlight]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText('');
      setQuoteTooltipPos(null);
      return;
    }

    const text = selection.toString().trim();

    // Support selections from short lines (3 chars) up to full multi-stanza passages (2000 chars)
    if (text && text.length >= 3 && text.length <= 2000) {
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSelectedText(text);
          setQuoteTooltipPos({
            top: Math.max(10, rect.top + window.scrollY - 48),
            left: Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2)),
          });
          return;
        }
      }
    }

    setSelectedText('');
    setQuoteTooltipPos(null);
  };

  const handleSaveQuote = () => {
    if (!selectedText || !work) return;
    readerProgressService.saveFavoriteQuote({
      quote: selectedText,
      author: work.author,
      workTitle: work.title,
      workSlug: work.slug,
    });
    setSelectedText('');
    setQuoteTooltipPos(null);
    setQuoteSavedNotice(true);
    setTimeout(() => setQuoteSavedNotice(false), 3000);
  };

  const handleOpenQuoteCard = (customText) => {
    const text = customText || selectedText || work?.excerpt || (work?.body ? work.body.split('\n\n')[0] : '');
    setQuoteToExport(text);
    setIsQuoteModalOpen(true);
    setQuoteTooltipPos(null);
  };

  const handleTriggerStardust = (pIndex, e) => {
    e?.stopPropagation();
    let x = 50;
    let y = 50;
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (e.clientX && e.clientY) {
        x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
        y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
      }
    }
    setStardustEvent({
      key: Date.now(),
      pIndex,
      x,
      y,
    });
  };

  const handleParagraphBookmark = (pIndex) => {
    if (!work || !work.slug) return;
    const updated = readerProgressService.toggleParagraphBookmark(work.slug, pIndex);
    setParagraphBookmarks(updated);
  };

  const handleUpdateSetting = (key, value) => {
    const updated = { ...readerSettings, [key]: value };
    setReaderSettings(updated);
    readerProgressService.saveReaderSettings(updated);
  };

  const renderParagraphs = (bodyText) => {
    if (!bodyText) return null;
    const paragraphs = bodyText.split('\n\n').filter((p) => p.trim() !== '');

    return paragraphs.map((p, idx) => {
      const isBookmarked = paragraphBookmarks[work.slug] === idx;
      const isActiveSpotlight = readerSettings.focusSpotlight && activeParagraphIndex === idx;
      const isDimmedSpotlight = readerSettings.focusSpotlight && activeParagraphIndex !== idx;

      return (
        <div
          key={idx}
          data-pindex={idx}
          ref={(el) => {
            paragraphRefs.current[idx] = el;
            if (isBookmarked) bookmarkedRef.current = el;
          }}
          onDoubleClick={(e) => handleTriggerStardust(idx, e)}
          className={`relative group py-3 px-2 rounded-lg transition-all duration-500 ease-out ${
            isActiveSpotlight
              ? 'opacity-100 text-[#FEEFFF] border-l-2 border-[#D5B06C] pl-4 -ml-4 bg-[#D5B06C]/[0.03] shadow-[0_0_20px_rgba(213,176,108,0.15)]'
              : isDimmedSpotlight
              ? 'opacity-40 grayscale-[0.3] hover:opacity-85 hover:grayscale-0'
              : 'hover:bg-white/[0.02]'
          }`}
        >
          {stardustEvent.pIndex === idx && (
            <StanzaStardustReaction
              triggerKey={stardustEvent.key}
              originX={stardustEvent.x}
              originY={stardustEvent.y}
            />
          )}

          <button
            onClick={() => handleParagraphBookmark(idx)}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Paragraph'}
            className={`absolute -left-5 md:-left-7 top-3 text-xs md:text-sm transition-opacity cursor-pointer ${
              isBookmarked
                ? 'opacity-100 text-[#D5B06C] scale-110'
                : 'opacity-0 group-hover:opacity-60 text-[#8A8177]'
            }`}
          >
            •
          </button>

          <button
            onClick={(e) => handleTriggerStardust(idx, e)}
            title="Drop Stardust Embers (Double click stanza)"
            className="absolute right-2 top-3 opacity-0 group-hover:opacity-60 hover:opacity-100 text-[#D5B06C] text-xs transition-all cursor-pointer p-1"
          >
            ✦
          </button>

          <p className="whitespace-pre-wrap leading-relaxed">{p}</p>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A06] flex items-center justify-center">
        <CosmicNebulaBackground variant="reader" />
        <div className="text-center space-y-3 z-10">
          <div className="w-8 h-8 border-2 border-[#D5B06C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm text-[#8A8177]">Opening Sanctuary Book...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-[#080A06] text-[#FEEFFF] flex flex-col items-center justify-center p-6 text-center">
        <CosmicNebulaBackground variant="reader" />
        <Navigation />
        <div className="z-10 space-y-4">
          <h2 className="font-serif text-3xl">Inscription Missing</h2>
          <p className="font-sans text-xs text-[#8A8177]">
            This work has faded back into the constellation archives.
          </p>
          <button
            onClick={() => navigate('/hub')}
            className="px-6 py-2 bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-[#FEEFFF] transition-colors"
          >
            Return to Sanctuary
          </button>
        </div>
      </div>
    );
  }

  const THEMES = {
    midnight: {
      bg: 'bg-[#080A06]',
      cardBg: 'bg-[#0F1216]',
      text: 'text-[#FEEFFF]/90',
      accent: 'text-[#D5B06C]',
      accentBg: 'bg-[#D5B06C]',
      border: 'border-[#D5B06C]/40',
      nebulaVariant: 'reader',
    },
    sepia: {
      bg: 'bg-[#181410]',
      cardBg: 'bg-[#221B14]',
      text: 'text-[#F2E5D0]',
      accent: 'text-[#E2B36E]',
      accentBg: 'bg-[#E2B36E]',
      border: 'border-[#E2B36E]/40',
      nebulaVariant: 'about',
    },
    nebula: {
      bg: 'bg-[#090714]',
      cardBg: 'bg-[#120E26]',
      text: 'text-[#EBE6FF]',
      accent: 'text-[#A78BFA]',
      accentBg: 'bg-[#A78BFA]',
      border: 'border-[#A78BFA]/40',
      nebulaVariant: 'reader',
    },
  };

  const activeTheme = THEMES[readerSettings.theme] || THEMES.midnight;

  const FONT_SIZES = {
    sm: 'text-sm md:text-base leading-relaxed',
    md: 'text-base md:text-lg leading-relaxed',
    lg: 'text-lg md:text-xl leading-relaxed',
    xl: 'text-xl md:text-2xl leading-relaxed',
  };

  const FONT_FAMILIES = {
    serif: 'font-serif leading-relaxed',
    playfair: 'font-playfair leading-relaxed',
    sans: 'font-sans font-light tracking-wide leading-relaxed',
  };

  return (
    <div
      onMouseUp={handleTextSelection}
      onTouchEnd={handleTextSelection}
      className={`relative min-h-screen ${activeTheme.bg} text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF] transition-colors duration-500`}
    >
      <CosmicNebulaBackground variant={activeTheme.nebulaVariant} />
      <Navigation
        readingPercent={maxProgressPercent}
        scrollLinePercent={scrollProgressPercent}
        readingWork={work}
      />

      <AnimatePresence>
        {quoteTooltipPos && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: `${quoteTooltipPos.top}px`,
              left: `${quoteTooltipPos.left}px`,
              transform: 'translateX(-50%)',
            }}
            className="z-50 flex items-center gap-1.5"
          >
            <button
              onClick={handleSaveQuote}
              className="bg-[#0F1216] border border-[#D5B06C] text-[#D5B06C] px-3.5 py-1.5 rounded-full font-sans text-[10px] uppercase tracking-widest shadow-2xl hover:bg-[#D5B06C] hover:text-[#080A06] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              Save Quote
            </button>
            <button
              onClick={() => handleOpenQuoteCard(selectedText)}
              className="bg-[#D5B06C] text-[#080A06] px-3.5 py-1.5 rounded-full font-sans text-[10px] uppercase tracking-widest shadow-2xl hover:bg-[#FEEFFF] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-semibold"
              title="Share selection as celestial Quote Card"
            >
              <Sparkles className="w-3 h-3" />
              <span>Share Card</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quoteSavedNotice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0F1216] border border-[#D5B06C] text-[#D5B06C] px-5 py-2.5 rounded-xl font-sans text-xs uppercase tracking-widest shadow-xl"
          >
            Favorite Quote Saved to Profile!
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`relative z-10 mx-auto px-4 md:px-6 pt-28 sm:pt-36 pb-24 ${isBookshelfMode ? 'max-w-5xl' : 'max-w-3xl'}`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleReturnNav}
            className="group flex items-center gap-2 font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer bg-[#0F1216]/80 border border-[#8A8177]/20 hover:border-[#D5B06C]/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg backdrop-blur-md shadow-sm"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Return to {categoryLabel}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenQuoteCard()}
              className="flex items-center gap-1.5 font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-[#D5B06C]/40 bg-[#0F1216]/80 text-[#D5B06C] hover:bg-[#D5B06C]/15 transition-all cursor-pointer backdrop-blur-md shadow-sm"
              title="Generate shareable Instagram/Twitter quote card"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quote Card</span>
            </button>

            <button
              onClick={() => handleUpdateSetting('focusSpotlight', !readerSettings.focusSpotlight)}
              className={`flex items-center gap-1.5 font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border transition-all cursor-pointer backdrop-blur-md shadow-sm ${
                readerSettings.focusSpotlight
                  ? 'border-[#D5B06C]/60 bg-[#D5B06C]/10 text-[#D5B06C] shadow-[0_0_15px_rgba(213,176,108,0.2)]'
                  : 'border-[#8A8177]/20 bg-[#0F1216]/80 text-[#8A8177] hover:text-[#FEEFFF]'
              }`}
              title="Focus Spotlight dims background stanzas to focus on the active paragraph"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Focus Spotlight: {readerSettings.focusSpotlight ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-1.5 font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border transition-all cursor-pointer backdrop-blur-md shadow-sm ${
                isSettingsOpen
                  ? `${activeTheme.border} ${activeTheme.cardBg} ${activeTheme.accent}`
                  : 'border-[#8A8177]/20 bg-[#0F1216]/80 text-[#8A8177] hover:text-[#D5B06C]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Theme & Font</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className={`p-4 md:p-6 rounded-2xl border ${activeTheme.border} ${activeTheme.cardBg} backdrop-blur-xl space-y-4 shadow-2xl`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#D5B06C] font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Reading Sanctuary Customizer
                  </span>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-xs text-[#8A8177] hover:text-[#FEEFFF]"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] block">
                      Theme
                    </span>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'midnight', label: 'Midnight', bg: 'bg-[#080A06] text-[#FEEFFF] border-[#D5B06C]/40' },
                        { id: 'sepia', label: 'Sepia', bg: 'bg-[#181410] text-[#F2E5D0] border-[#E2B36E]/40' },
                        { id: 'nebula', label: 'Nebula', bg: 'bg-[#090714] text-[#EBE6FF] border-[#A78BFA]/40' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleUpdateSetting('theme', t.id)}
                          className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${t.bg} ${
                            readerSettings.theme === t.id ? 'ring-2 ring-white/50 scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] block">
                      Font Size
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'sm', label: 'A-' },
                        { id: 'md', label: 'A' },
                        { id: 'lg', label: 'A+' },
                        { id: 'xl', label: 'A++' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleUpdateSetting('fontSize', s.id)}
                          className={`flex-1 py-1.5 rounded-lg border border-white/10 text-xs font-sans font-semibold transition-all ${
                            readerSettings.fontSize === s.id
                              ? 'bg-[#D5B06C] text-[#080A06] border-[#D5B06C]'
                              : 'bg-black/30 text-[#8A8177] hover:text-[#FEEFFF]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] block">
                      Typography
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'serif', label: 'Serif' },
                        { id: 'playfair', label: 'Elegant' },
                        { id: 'sans', label: 'Modern' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => handleUpdateSetting('fontFamily', f.id)}
                          className={`flex-1 py-1.5 rounded-lg border border-white/10 text-[11px] font-sans uppercase tracking-wider transition-all ${
                            readerSettings.fontFamily === f.id
                              ? 'bg-[#D5B06C] text-[#080A06] border-[#D5B06C]'
                              : 'bg-black/30 text-[#8A8177] hover:text-[#FEEFFF]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isBookshelfMode ? (
          <div className="relative shadow-[0_30px_90px_rgba(0,0,0,0.95)]" style={{ perspective: 1400 }}>
            <div className="relative bg-[#0A0C10] border-2 border-[#D5B06C]/50 rounded-2xl p-4 md:p-8 overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#D9D0C1] via-[#F2E8D9] to-[#C9C0B1] border-b border-black/80 shadow-inner z-30" />
              
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D5B06C] z-30" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D5B06C] z-30" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#D5B06C] z-30" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#D5B06C] z-30" />

              <div className="flex flex-col md:flex-row items-stretch justify-between pt-4 relative">
                <div className="hidden md:flex md:w-5/12 bg-[#0F1216] border border-[#8A8177]/20 rounded-l-xl p-8 flex-col justify-between relative shadow-inner">
                  <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/60 to-transparent pointer-events-none z-10" />

                  <div className="space-y-4 text-center border-b border-[#D5B06C]/30 pb-6 flex flex-col items-center">
                    <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#D5B06C] font-semibold">
                      Sanctuary Archive • {work.category}
                    </span>

                    <h1 className="font-serif text-3xl md:text-4xl text-[#FEEFFF] font-normal leading-snug text-center">
                      {work.title}
                    </h1>

                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#8A8177]">
                      By {work.author}
                    </p>

                    <div className="pt-2 flex justify-center">
                      <GildedHeart
                        workId={work.slug || work.id}
                        initialCount={work.gilded_likes_count || 0}
                        onToggleLike={handleToggleLike}
                      />
                    </div>
                  </div>

                  <div className="text-center font-serif italic text-xs text-[#8A8177] space-y-2 py-8">
                    <div className="h-px w-12 bg-[#D5B06C]/40 mx-auto my-3" />
                    <p>Estimated Reading: {work.read_time_minutes} minutes</p>
                    <p className="text-[10px] uppercase font-sans tracking-widest text-[#D5B06C]">
                      The Real Thing Inscriptions
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-5 bg-gradient-to-r from-black/70 via-[#181B22] to-black/70 border-x border-black/80 shadow-inner z-20 flex-shrink-0" />

                <div className="w-full md:w-7/12 bg-[#0F1216] border border-[#8A8177]/20 rounded-r-xl p-6 md:p-10 relative shadow-inner">
                  <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10" />

                  <header className="block md:hidden text-center mb-8 space-y-3 border-b border-[#D5B06C]/30 pb-4 flex flex-col items-center">
                    <span className="font-sans text-[8px] uppercase tracking-[0.25em] text-[#D5B06C]">
                      {work.category}
                    </span>

                    <h1 className="font-serif text-2xl text-[#FEEFFF] font-normal leading-tight text-center">
                      {work.title}
                    </h1>

                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#8A8177]">
                      By {work.author}
                    </p>

                    <div className="pt-2 flex justify-center">
                      <GildedHeart
                        workId={work.slug || work.id}
                        initialCount={work.gilded_likes_count || 0}
                        onToggleLike={handleToggleLike}
                      />
                    </div>
                  </header>

                  <div className={`${FONT_FAMILIES[readerSettings.fontFamily] || 'font-serif'} ${FONT_SIZES[readerSettings.fontSize] || 'text-base md:text-lg'} ${activeTheme.text} mb-10 text-left relative z-20`}>
                    {renderParagraphs(work.body)}
                  </div>

                  <div className="relative z-20">
                    <AnonymousComments
                      comments={comments}
                      onAddComment={(text) => {
                        addComment(text);
                        readerProgressService.incrementCommentCount();
                      }}
                      onDeleteComment={isCurator ? deleteComment : null}
                    />
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ rotateY: 0 }}
              animate={
                isClosingBook
                  ? { rotateY: 0 }
                  : isCoverOpen
                  ? { rotateY: -160 }
                  : { rotateY: 0 }
              }
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-[#07090C] border-2 border-[#D5B06C] rounded-2xl shadow-2xl overflow-hidden origin-left pointer-events-none z-40"
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black via-[#1E222A] to-transparent border-r border-white/10 z-30">
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-[#D5B06C]" />
                <div className="absolute bottom-6 left-0 right-0 h-0.5 bg-[#D5B06C]" />
              </div>

              {work.image_url && (
                <img
                  src={work.image_url}
                  alt={work.title}
                  className="w-full h-full object-cover opacity-85"
                  style={{
                    transform: `scale(${work.bookshelf_crop_scale || work.crop_scale || 1})`,
                    objectPosition: `${work.bookshelf_crop_pos_x ?? work.crop_pos_x ?? 50}% ${work.bookshelf_crop_pos_y ?? work.crop_pos_y ?? 50}%`,
                  }}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#080A06] via-[#0F1216]/70 to-transparent p-8 flex flex-col justify-end pl-10">
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#D5B06C] mb-1">
                  {work.category}
                </span>
                <h3 className="font-serif text-3xl text-[#FEEFFF]">{work.title}</h3>
                <p className="font-sans text-sm text-[#8A8177]">By {work.author}</p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className={`${activeTheme.cardBg} border ${activeTheme.border} p-6 md:p-12 rounded-2xl shadow-xl transition-colors duration-500`}>
            <header className="text-center mb-14 space-y-4 pt-2 flex flex-col items-center">
              <h1 className="font-serif text-3xl md:text-5xl text-[#FEEFFF] font-normal leading-tight capitalize text-center">
                {work.title}
              </h1>

              <p className={`font-sans text-xs uppercase tracking-[0.2em] ${activeTheme.accent}`}>
                By {work.author}
              </p>

              <div className="pt-2 flex justify-center">
                <GildedHeart
                  workId={work.slug || work.id}
                  initialCount={work.gilded_likes_count || 0}
                  onToggleLike={handleToggleLike}
                />
              </div>
            </header>

            <div className={`${FONT_FAMILIES[readerSettings.fontFamily] || 'font-serif'} ${FONT_SIZES[readerSettings.fontSize] || 'text-lg md:text-xl'} ${activeTheme.text} mb-12 text-left`}>
              {renderParagraphs(work.body)}
            </div>

            <AnonymousComments
              comments={comments}
              onAddComment={(text) => {
                addComment(text);
                readerProgressService.incrementCommentCount();
              }}
              onDeleteComment={isCurator ? deleteComment : null}
            />
          </div>
        )}
      </main>

      <QuoteCardExporterModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quoteText={quoteToExport}
        workTitle={work?.title}
        author={work?.author}
        workSlug={work?.slug}
      />
    </div>
  );
};

export default ReaderView;