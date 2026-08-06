import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import Navigation from '../components/Shared/Navigation';
import GildedHeart from '../components/Engagement/GildedHeart';
import AnonymousComments from '../components/Engagement/AnonymousComments';
import useReader from '../hooks/useReader';
import useComments from '../hooks/useComments';
import useAuth from '../hooks/useAuth';

export const ReaderView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { work, loading, handleToggleLike } = useReader(slug);
  const { comments, addComment, deleteComment } = useComments(work?.id);
  const { isCurator } = useAuth();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A06] flex items-center justify-center">
        <div className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] animate-pulse">
          Retrieving Inscription...
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-[#080A06] text-[#FEEFFF] flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <AtmosphericBackground />
        <h2 className="font-serif text-3xl text-[#D5B06C]">Inscription Unfound</h2>
        <button
          onClick={() => navigate('/hub')}
          className="mt-4 font-sans text-xs uppercase tracking-widest px-6 py-2.5 rounded border border-[#D5B06C]/40 text-[#D5B06C] hover:bg-[#D5B06C] hover:text-[#080A06] transition-all cursor-pointer"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <article className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF]">
      <AtmosphericBackground />
      <Navigation />

      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#D5B06C] origin-left z-50 shadow-[0_0_10px_#D5B06C]"
        style={{ scaleX }}
      />

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-48 md:pt-56 pb-24">
        <header className="text-center mb-16 space-y-3">
          <h1 className="font-serif text-3xl md:text-5xl text-[#FEEFFF] font-normal leading-tight capitalize">
            {work.title}
          </h1>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C]">
            By {work.author}
          </p>
        </header>

        <div className="font-serif text-lg md:text-xl text-[#FEEFFF]/90 leading-relaxed whitespace-pre-line mb-16 font-light tracking-wide text-left">
          {work.body}
        </div>

        <div className="flex items-center justify-between border-t border-b border-[#8A8177]/15 py-6 my-12">
          <GildedHeart
            workId={work.id || work.slug}
            initialCount={work.gilded_likes_count || 0}
            onToggleLike={handleToggleLike}
          />
          <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
            Published {new Date(work.published_at || Date.now()).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <AnonymousComments
          comments={comments}
          onAddComment={addComment}
          onDeleteComment={isCurator ? deleteComment : null}
        />
      </main>
    </article>
  );
};

export default ReaderView;