import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import Navigation from '../components/Shared/Navigation';
import AnonymousComments from '../components/Engagement/AnonymousComments';
import GildedHeart from '../components/Engagement/GildedHeart';
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

  // Floating Quote Selection State
  const [selectedText, setSelectedText] = useState('');
  const [quoteTooltipPos, setQuoteTooltipPos] = useState(null);
  const [quoteSavedNotice, setQuoteSavedNotice] = useState(false);

  // Paragraph Bookmark State
  const [paragraphBookmarks, setParagraphBookmarks] = useState({});

  // Auto-scroll anchor ref
  const bookmarkedRef = useRef(null);

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
      // Immediately register clicked work so Continue Reading card appears on Hub
      readerProgressService.saveLastRead({
        slug: work.slug,
        title: work.title,
        author: work.author,
        category: work.category,
        scrollPercentage: 0,
        paragraphIndex: 0,
      });

      // Load paragraph bookmarks
      const savedBookmarks = readerProgressService.getParagraphBookmarks();
      setParagraphBookmarks(savedBookmarks);

      // Trigger 3D Book Cover Opening sequence
      setIsCoverOpen(false);
      const timer = setTimeout(() => {
        setIsCoverOpen(true);
      }, 150);

      // Auto-scroll to bookmarked paragraph if available
      if (savedBookmarks[work.slug] !== undefined && bookmarkedRef.current) {
        setTimeout(() => {
          bookmarkedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }

      return () => clearTimeout(timer);
    }
  }, [work]);

  // Handle Browser / Phone Back Button Navigation
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

  // Track scroll percentage and save progress
  useEffect(() => {
    const handleScroll = () => {
      if (!work || !work.slug) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (totalHeight <= 0) {
        setScrollProgressPercent(100);
        return;
      }

      const currentScroll = Math.max(0, window.scrollY);
      const scrollPercentage = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));

      setScrollProgressPercent(scrollPercentage);

      readerProgressService.saveLastRead({
        slug: work.slug,
        title: work.title,
        author: work.author,
        category: work.category,
        scrollPercentage,
        paragraphIndex: paragraphBookmarks[work.slug] || 0,
      });

      if (scrollPercentage >= 90) {
        const statuses = readerProgressService.getLibraryStatuses();
        if (statuses[work.slug] !== 'Completed') {
          readerProgressService.setWorkLibraryStatus(work.slug, 'Completed');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [work, paragraphBookmarks]);

  // Handle Text Selection for Favorite Quote Saver
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text && text.length >= 10 && text.length <= 300) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setQuoteTooltipPos({
        top: rect.top + window.scrollY - 45,
        left: rect.left + rect.width / 2,
      });
    } else {
      setSelectedText('');
      setQuoteTooltipPos(null);
    }
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

  const handleParagraphBookmark = (pIndex) => {
    if (!work || !work.slug) return;
    const updated = readerProgressService.toggleParagraphBookmark(work.slug, pIndex);
    setParagraphBookmarks(updated);
  };

  const renderParagraphs = (bodyText) => {
    if (!bodyText) return null;
    const paragraphs = bodyText.split('\n\n').filter((p) => p.trim() !== '');

    return paragraphs.map((p, idx) => {
      const isBookmarked = paragraphBookmarks[work.slug] === idx;

      return (
        <div
          key={idx}
          ref={isBookmarked ? bookmarkedRef : null}
          className="relative group py-2 px-1 rounded transition-colors hover:bg-white/[0.02]"
        >
          {/* Paragraph Bookmark Indicator */}
          <button
            onClick={() => handleParagraphBookmark(idx)}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Paragraph'}
            className={`absolute -left-5 md:-left-7 top-2 text-xs md:text-sm transition-opacity cursor-pointer ${
              isBookmarked
                ? 'opacity-100 text-[#D5B06C] scale-110'
                : 'opacity-0 group-hover:opacity-60 text-[#8A8177]'
            }`}
          >
            •
          </button>
          <p className="whitespace-pre-wrap">{p}</p>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A06] flex items-center justify-center">
        <AtmosphericBackground />
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
        <AtmosphericBackground />
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

  return (
    <div
      onMouseUp={handleTextSelection}
      onTouchEnd={handleTextSelection}
      className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF]"
    >
      <AtmosphericBackground />
      <Navigation />

      {/* Clamped Golden Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#8A8177]/20 z-50 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-[#D5B06C] to-amber-400 transition-all duration-150 shadow-[0_0_10px_rgba(213,176,108,0.8)]"
          style={{ width: `${scrollProgressPercent}%` }}
        />
      </div>

      {/* Floating Save Quote Tooltip */}
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
            className="z-50"
          >
            <button
              onClick={handleSaveQuote}
              className="bg-[#0F1216] border border-[#D5B06C] text-[#D5B06C] px-3.5 py-1.5 rounded-full font-sans text-[10px] uppercase tracking-widest shadow-2xl hover:bg-[#D5B06C] hover:text-[#080A06] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              Save Quote
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Saved Notice */}
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

      <main className={`relative z-10 mx-auto px-4 md:px-6 pt-32 md:pt-36 pb-24 ${isBookshelfMode ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {/* Return Button */}
        <div className="mb-6 flex items-center">
          <button
            onClick={handleReturnNav}
            className="group flex items-center gap-2 font-sans text-[11px] md:text-xs uppercase tracking-[0.2em] text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer bg-[#0F1216]/80 border border-[#8A8177]/20 hover:border-[#D5B06C]/40 px-3.5 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-md shadow-sm"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Return to {categoryLabel}</span>
          </button>
        </div>

        {/* 3D Opened Book Layout in Bookshelf Mode */}
        {isBookshelfMode ? (
          <div className="relative shadow-[0_30px_90px_rgba(0,0,0,0.95)]" style={{ perspective: 1400 }}>
            {/* Outer Leather Hardcover Frame */}
            <div className="relative bg-[#0A0C10] border-2 border-[#D5B06C]/50 rounded-2xl p-4 md:p-8 overflow-hidden shadow-2xl">
              {/* Top Parchment Edge */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#D9D0C1] via-[#F2E8D9] to-[#C9C0B1] border-b border-black/80 shadow-inner z-30" />
              
              {/* Corner Gold Guards */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D5B06C] z-30" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D5B06C] z-30" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#D5B06C] z-30" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#D5B06C] z-30" />

              {/* Two-Page Book Spread (Desktop: Left Page + Spine + Right Page) */}
              <div className="flex flex-col md:flex-row items-stretch justify-between pt-4 relative">
                {/* Left Page (Title & Chapter Information) */}
                <div className="hidden md:flex md:w-5/12 bg-[#0F1216] border border-[#8A8177]/20 rounded-l-xl p-8 flex-col justify-between relative shadow-inner">
                  {/* Left Spine Fold Shadow */}
                  <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/60 to-transparent pointer-events-none z-10" />

                  {/* Left Page Header */}
                  <div className="space-y-4 text-center border-b border-[#D5B06C]/30 pb-6">
                    <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#D5B06C] font-semibold">
                      Sanctuary Archive • {work.category}
                    </span>
                    <h1 className="font-serif text-3xl md:text-4xl text-[#FEEFFF] font-normal leading-snug">
                      {work.title}
                    </h1>
                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#8A8177]">
                      By {work.author}
                    </p>
                  </div>

                  <div className="text-center font-serif italic text-xs text-[#8A8177] space-y-2 py-8">
                    <p className="font-serif text-3xl text-[#D5B06C]">❦</p>
                    <p>Estimated Reading: {work.read_time_minutes} minutes</p>
                    <p className="text-[10px] uppercase font-sans tracking-widest text-[#D5B06C]">
                      The Real Thing Inscriptions
                    </p>
                  </div>
                </div>

                {/* Center Book Spine Binding Crease */}
                <div className="hidden md:block w-5 bg-gradient-to-r from-black/70 via-[#181B22] to-black/70 border-x border-black/80 shadow-inner z-20 flex-shrink-0" />

                {/* Right Page (Text Body & Inscriptions) */}
                <div className="w-full md:w-7/12 bg-[#0F1216] border border-[#8A8177]/20 rounded-r-xl p-6 md:p-10 relative shadow-inner">
                  {/* Right Spine Fold Shadow */}
                  <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10" />

                  {/* Mobile Header */}
                  <header className="block md:hidden text-center mb-8 space-y-2 border-b border-[#D5B06C]/30 pb-4">
                    <span className="font-sans text-[8px] uppercase tracking-[0.25em] text-[#D5B06C]">
                      {work.category}
                    </span>
                    <h1 className="font-serif text-2xl text-[#FEEFFF] font-normal leading-tight">
                      {work.title}
                    </h1>
                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#8A8177]">
                      By {work.author}
                    </p>
                  </header>

                  {/* Text Body with Bookmarks */}
                  <div className="font-serif text-base md:text-lg text-[#FEEFFF]/90 leading-relaxed mb-10 font-light tracking-wide text-left relative z-20">
                    {renderParagraphs(work.body)}
                  </div>

                  {/* Gilded Heart Resonance Like Button */}
                  <div className="my-8 flex items-center justify-center sm:justify-start relative z-20">
                    <GildedHeart
                      workId={work.slug || work.id}
                      initialCount={work.gilded_likes_count || 0}
                      onToggleLike={handleToggleLike}
                    />
                  </div>

                  {/* Comments Section */}
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

            {/* Front Hardcover Swinging Open/Shut Animation (Right to Left Around Left Spine) */}
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
              {/* Hardcover Outer Spine Ribs */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black via-[#1E222A] to-transparent border-r border-white/10 z-30">
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-[#D5B06C]" />
                <div className="absolute bottom-6 left-0 right-0 h-0.5 bg-[#D5B06C]" />
              </div>

              {/* Cover Artwork */}
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
          /* Grid View Minimalist Container */
          <div className="bg-[#0F1216]/50 border border-[#8A8177]/10 p-6 md:p-12 rounded-2xl">
            <header className="text-center mb-14 space-y-3 pt-2">
              <h1 className="font-serif text-3xl md:text-5xl text-[#FEEFFF] font-normal leading-tight capitalize">
                {work.title}
              </h1>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C]">
                By {work.author}
              </p>
            </header>

            {/* Text Body with Bookmarks */}
            <div className="font-serif text-lg md:text-xl text-[#FEEFFF]/90 leading-relaxed mb-12 font-light tracking-wide text-left">
              {renderParagraphs(work.body)}
            </div>

            {/* Gilded Heart Resonance Like Button */}
            <div className="my-10 flex items-center justify-center sm:justify-start">
              <GildedHeart
                workId={work.slug || work.id}
                initialCount={work.gilded_likes_count || 0}
                onToggleLike={handleToggleLike}
              />
            </div>

            {/* Comments Section */}
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
    </div>
  );
};

export default ReaderView;