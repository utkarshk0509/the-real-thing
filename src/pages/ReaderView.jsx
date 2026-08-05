import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import GildedHeart from '../components/Engagement/GildedHeart';
import AnonymousComments from '../components/Engagement/AnonymousComments';

export const ReaderView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    // Mock Data loader - Will connect to Supabase in Step 3
    const timer = setTimeout(() => {
      setWork({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: slug ? slug.replace(/-/g, ' ').toUpperCase() : 'The Silent Architecture of Dusk',
        author: 'Elena Rostova',
        category: 'poem',
        published_at: '2026-08-01T00:00:00Z',
        read_time_minutes: 3,
        gilded_likes_count: 142,
        body: `Shadows lengthen along the marble hall,\nwhere light becomes a whispered prayer.\nWe counted hours by the falling leaves,\nand left our shadows resting there.\n\nTo move unheeded through the gilded dark,\nis to learn the language of the stone—\nevery silence holding fast its spark,\nevery echo coming home.`,
      });
      setComments([
        {
          id: 'c1',
          author_alias: 'Solitary Reader',
          avatar_seed: 'seed123',
          content: 'The second stanza captures that specific stillness right after sunset perfectly.',
          created_at: '2026-08-02T14:20:00Z',
        },
      ]);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A06] flex items-center justify-center">
        <div className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] animate-pulse">
          Retrieving Inscription...
        </div>
      </div>
    );
  }

  return (
    <article className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF]">
      <AtmosphericBackground />

      {/* Reading Progress Indicator Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#D5B06C] origin-left z-50 shadow-[0_0_10px_#D5B06C]" 
        style={{ scaleX }} 
      />

      {/* Reader Header Navigation */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 py-8 flex items-center justify-between border-b border-[#8A8177]/10">
        <button
          onClick={() => navigate('/hub')}
          className="font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors flex items-center gap-2 cursor-pointer"
        >
          ← Return to Hub
        </button>
        <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
          {work.category} • {work.read_time_minutes} min read
        </span>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-24">
        <header className="text-center mb-16 space-y-3">
          <h1 className="font-serif text-3xl md:text-5xl text-[#FEEFFF] font-normal leading-tight capitalize">
            {work.title}
          </h1>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C]">
            By {work.author}
          </p>
        </header>

        {/* Prose/Poetry Text */}
        <div className="font-serif text-lg md:text-xl text-[#FEEFFF]/90 leading-relaxed whitespace-pre-line mb-16 font-light tracking-wide text-center md:text-left">
          {work.body}
        </div>

        {/* Engagement Divider & Resonance Button */}
        <div className="flex items-center justify-between border-t border-b border-[#8A8177]/15 py-6 my-12">
          <GildedHeart initialCount={work.gilded_likes_count} />
          <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
            Published {new Date(work.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Reflections / Comments Section */}
        <AnonymousComments
          comments={comments}
          onAddComment={async (newC) => {
            setComments((prev) => [{ ...newC, id: Date.now().toString(), created_at: new Date().toISOString() }, ...prev]);
          }}
        />
      </main>
    </article>
  );
};

export default ReaderView;