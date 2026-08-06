import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Feather, BookOpen, Send, CheckCircle2, Star } from 'lucide-react';
import { GlowingCard } from '../Shared/GlowingCard';
import siteService from '../../services/siteService';
import { supabase } from '../../lib/supabase';

export const AboutAuthorSanctuary = ({ works = [], bio = '' }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    const fetchCustomAbout = async () => {
      const data = await siteService.getAboutData();
      if (data) setAboutData(data);
    };
    fetchCustomAbout();

    if (supabase) {
      const channel = supabase
        .channel('realtime_about_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, async () => {
          const updated = await siteService.getAboutData();
          if (updated) setAboutData(updated);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const poemsCount = works.filter((w) => w.category === 'poem').length;
  const storiesCount = works.filter((w) => w.category === 'story').length;
  const totalReadMinutes = works.reduce((sum, w) => sum + (w.read_time_minutes || 3), 0);

  const authorName = aboutData?.name || 'Utkarsh';
  const authorTagline = aboutData?.tagline || 'Sanctuary Curator & Author';
  const authorBio = aboutData?.bio || bio || 'Creating living constellations of rhythmic poetry, prose, and deep contemplation.';

  const spotlightWork = aboutData?.spotlightSlug
    ? (works.find((w) => w.slug === aboutData.spotlightSlug) || works[0])
    : (works.find((w) => w.category === 'poem') || works[0]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await siteService.sendWhisper({
        sender: senderName.trim() || 'A Quiet Reader',
        text: message.trim(),
      });

      setMessage('');
      setSenderName('');
      setIsSent(true);
      setTimeout(() => setIsSent(false), 4500);
    } catch (err) {
      console.warn('Message send error:', err);
    }
  };

  const MANIFESTO_ITEMS = [
    {
      id: 'why',
      title: aboutData?.whyTitle || 'Why I Write',
      icon: Feather,
      short: aboutData?.whyShort || 'To translate quiet emotions into eternal rhythmic inscriptions.',
      full: aboutData?.whyFull || 'Writing is the act of catching fleeting moments before they dissolve into silence. Each stanza is an attempt to capture authentic human emotion, preserving feelings of longing, wonder, and quiet truth.',
      color: '#D5B06C',
    },
    {
      id: 'philosophy',
      title: aboutData?.philosophyTitle || 'The Real Thing',
      icon: Sparkles,
      short: aboutData?.philosophyShort || 'A digital sanctuary built for contemplation and deep prose.',
      full: aboutData?.philosophyFull || 'In a world driven by rapid feeds and noise, "The Real Thing" offers a slower space. Here, words are given room to breathe in a dark cosmic galaxy, where poetry and stories exist as living constellations.',
      color: '#7CB9E8',
    },
    {
      id: 'influences',
      title: aboutData?.influencesTitle || 'Literary Influences',
      icon: BookOpen,
      short: aboutData?.influencesShort || 'Inspired by classical romanticism and modern contemplative prose.',
      full: aboutData?.influencesFull || 'Drawing inspiration from classical romantic poets, modern magical realism, and atmospheric space aesthetics — blending timeless themes of love, time, and starlight into contemporary verse.',
      color: '#C9A9FF',
    },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-6">
      {/* ── Author Profile Header Badge ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-b from-[#D5B06C]/60 via-[#8A8177]/25 to-[#D5B06C]/60 shadow-[0_0_50px_rgba(213,176,108,0.18)]"
      >
        <div className="relative w-full bg-gradient-to-b from-[#141822] via-[#0F1216] to-[#080A06] rounded-[23px] p-8 md:p-12 text-center space-y-7 overflow-hidden">
          {/* Ambient Starlight Background Pulse */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(213,176,108,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Corner Celestial Filigree Accents */}
          <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t border-l border-[#D5B06C]/70" />
          <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t border-r border-[#D5B06C]/70" />
          <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b border-l border-[#D5B06C]/70" />
          <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b border-r border-[#D5B06C]/70" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#D5B06C]/60" />
              <div className="p-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/40 text-[#D5B06C]">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#D5B06C] font-semibold">
                {authorTagline}
              </span>
              <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#D5B06C]/60" />
            </div>

            <h1 className="font-serif text-3xl md:text-5xl text-[#FEEFFF] tracking-wider font-normal drop-shadow-md">
              {authorName}
            </h1>

            <div className="h-px w-36 bg-gradient-to-r from-transparent via-[#D5B06C]/70 to-transparent mx-auto" />

            <p className="font-serif text-base md:text-xl text-[#FEEFFF]/90 leading-relaxed max-w-2xl mx-auto italic font-light px-2">
              “{authorBio}”
            </p>
          </div>

          {/* ── Sanctuary Metrics Counter Row ── */}
          <div className="relative z-10 pt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto border-t border-[#8A8177]/20">
            <div className="p-3.5 rounded-2xl bg-black/50 border border-[#D5B06C]/30 text-center backdrop-blur-md">
              <div className="font-serif text-xl md:text-2xl text-[#D5B06C] font-semibold">{poemsCount}</div>
              <div className="font-sans text-[9px] uppercase tracking-widest text-[#8A8177] mt-1">Poems</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/50 border border-[#7CB9E8]/30 text-center backdrop-blur-md">
              <div className="font-serif text-xl md:text-2xl text-[#7CB9E8] font-semibold">{storiesCount}</div>
              <div className="font-sans text-[9px] uppercase tracking-widest text-[#8A8177] mt-1">Stories</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/50 border border-[#C9A9FF]/30 text-center backdrop-blur-md">
              <div className="font-serif text-xl md:text-2xl text-[#C9A9FF] font-semibold">{totalReadMinutes}m</div>
              <div className="font-sans text-[9px] uppercase tracking-widest text-[#8A8177] mt-1">Read Time</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Interactive Manifesto & Philosophy Cards ── */}
      <div className="space-y-4">
        <h3 className="font-sans text-xs uppercase tracking-[0.3em] text-[#D5B06C] font-semibold text-center flex items-center justify-center gap-2">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#D5B06C]/50" />
          The Author's Living Manifesto
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#D5B06C]/50" />
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MANIFESTO_ITEMS.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedCard === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                className="cursor-pointer"
              >
                <GlowingCard className="h-full flex flex-col justify-between p-6 rounded-2xl border border-[#D5B06C]/20 bg-[#0F1216]/90 backdrop-blur-xl">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10" style={{ color: item.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-[#8A8177]">
                        {isExpanded ? 'Close' : 'Expand'}
                      </span>
                    </div>

                    <h4 className="font-serif text-xl text-[#FEEFFF] font-normal tracking-wide">{item.title}</h4>
                    <p className="font-sans text-xs text-[#8A8177] leading-relaxed">
                      {isExpanded ? item.full : item.short}
                    </p>
                  </div>
                </GlowingCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Author's Choice Spotlight Card ── */}
      {spotlightWork && (
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#141822] to-[#0A0D12] border border-[#D5B06C]/35 shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4">
          <div className="flex items-center gap-2 text-[#D5B06C]">
            <Star className="w-4 h-4 fill-[#D5B06C]" />
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-semibold">
              Author's Choice Spotlight
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl md:text-3xl text-[#FEEFFF] font-normal">{spotlightWork.title}</h3>
              <p className="font-sans text-xs text-[#8A8177]">
                A featured inscription embodying the core essence of the sanctuary.
              </p>
            </div>

            <a
              href={`/read/${spotlightWork.slug}`}
              className="px-6 py-2.5 rounded-full bg-[#D5B06C]/15 border border-[#D5B06C]/50 text-[#D5B06C] font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#D5B06C] hover:text-[#080A06] transition-all whitespace-nowrap self-start sm:self-auto text-center cursor-pointer shadow-sm"
            >
              Read Spotlight →
            </a>
          </div>
        </div>
      )}

      {/* ── Interactive "Whisper to the Author" Message Box ── */}
      <div className="p-7 md:p-10 rounded-3xl bg-gradient-to-b from-[#12161F]/90 via-[#0F1216]/95 to-[#080A06] border border-[#8A8177]/25 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-6">
        <div className="text-center space-y-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.35em] text-[#D5B06C] font-semibold block">
            Reader Impressions
          </span>
          <h3 className="font-serif text-2xl md:text-3xl text-[#FEEFFF] font-normal">Whisper to the Author</h3>
          <p className="font-sans text-xs text-[#8A8177] max-w-md mx-auto">
            Leave a quiet note, poem reflection, or impression directly for the author.
          </p>
        </div>

        <form onSubmit={handleSendMessage} className="space-y-4 max-w-lg mx-auto">
          <div>
            <input
              type="text"
              placeholder="Your Name or Pseudonym (Optional)"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-black/50 border border-[#8A8177]/30 rounded-xl px-4 py-3 text-xs text-[#FEEFFF] placeholder-[#8A8177] focus:outline-none focus:border-[#D5B06C] transition-colors"
            />
          </div>

          <div>
            <textarea
              rows={3}
              placeholder="Write your note or impression..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full bg-black/50 border border-[#8A8177]/30 rounded-xl px-4 py-3 text-xs text-[#FEEFFF] placeholder-[#8A8177] focus:outline-none focus:border-[#D5B06C] transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-[0.25em] border border-[#F5E8D0]/30 hover:bg-[#C9A35F] transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Whisper</span>
          </button>

          <AnimatePresence>
            {isSent && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl bg-[#D5B06C]/10 border border-[#D5B06C]/40 text-[#D5B06C] font-sans text-xs text-center flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Your whisper has been delivered to the Author's Sanctuary!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export default AboutAuthorSanctuary;
