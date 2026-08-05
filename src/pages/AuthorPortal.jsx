import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import { supabase } from '../lib/supabase';

export const AuthorPortal = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('poem');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const metrics = useMemo(() => {
    const words = body.trim() ? body.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 180));
    return { words, readTime };
  }, [body]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide both a title and main body text.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const newWork = {
      id: Date.now().toString(),
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      author: author.trim() || 'Anonymous',
      category,
      status: isDraft ? 'draft' : 'published',
      excerpt: excerpt.trim() || body.slice(0, 120) + '...',
      body,
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      read_time_minutes: metrics.readTime,
      published_at: isDraft ? null : new Date().toISOString(),
    };

    try {
      // Save locally
      const existingLocal = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
      localStorage.setItem('real_thing_custom_works', JSON.stringify([newWork, ...existingLocal]));

      // Save to Supabase if connected
      if (supabase) {
        await supabase.from('works').insert([newWork]);
      }

      setStatusMessage({ type: 'success', text: 'Inscription successfully published!' });
      
      setTimeout(() => {
        navigate('/hub');
      }, 1000);

    } catch (err) {
      console.warn('Saved to local storage:', err.message);
      setStatusMessage({ type: 'success', text: 'Inscription saved!' });
      
      setTimeout(() => {
        navigate('/hub');
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF] p-6 md:p-12">
      <AtmosphericBackground />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#8A8177]/20 pb-6 gap-4">
          <div>
            <button
              onClick={() => navigate('/hub')}
              className="font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors mb-2 block cursor-pointer"
            >
              ← Return to Hub
            </button>
            <h1 className="font-serif text-3xl text-[#FEEFFF]">Curator Portal</h1>
            <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177] mt-1">
              Inscribe New Literary Piece
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-sans text-xs text-[#8A8177]">
              {metrics.words} words • ~{metrics.readTime} min read
            </span>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest px-6 py-2.5 rounded hover:bg-[#FEEFFF] transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Inscribing...' : isDraft ? 'Save Draft' : 'Publish Work'}
            </button>
          </div>
        </header>

        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg font-sans text-xs uppercase tracking-wider text-center border ${
              statusMessage.type === 'success'
                ? 'bg-[#D5B06C]/10 border-[#D5B06C] text-[#D5B06C]'
                : 'bg-red-900/20 border-red-500/40 text-red-300'
            }`}
          >
            {statusMessage.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-[#0F1216] border border-[#8A8177]/20 p-6 rounded-xl h-fit space-y-6">
            <h2 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C]">
              Work Metadata
            </h2>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                Author Name / Alias
              </label>
              <input
                type="text"
                placeholder="e.g. Aureligious"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2 rounded focus:outline-none focus:border-[#D5B06C]"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2 rounded focus:outline-none focus:border-[#D5B06C] cursor-pointer"
              >
                <option value="poem">Poem</option>
                <option value="story">Story</option>
                <option value="essay">Essay</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                Visibility
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDraft(false)}
                  className={`flex-1 py-2 text-[10px] font-sans uppercase tracking-widest border rounded transition-all cursor-pointer ${
                    !isDraft ? 'border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10' : 'border-[#8A8177]/20 text-[#8A8177]'
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsDraft(true)}
                  className={`flex-1 py-2 text-[10px] font-sans uppercase tracking-widest border rounded transition-all cursor-pointer ${
                    isDraft ? 'border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10' : 'border-[#8A8177]/20 text-[#8A8177]'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                Thumbnail Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2 rounded focus:outline-none focus:border-[#D5B06C]"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                Short Excerpt
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A succinct atmospheric preview..."
                className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-xs p-3 rounded focus:outline-none focus:border-[#D5B06C] resize-none"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <input
              type="text"
              placeholder="Title of Work..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-[#8A8177]/30 py-3 text-3xl md:text-4xl font-serif text-[#FEEFFF] placeholder-[#8A8177]/40 focus:outline-none focus:border-[#D5B06C]"
            />

            <div className="flex border-b border-[#8A8177]/20">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                  activeTab === 'edit'
                    ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Preview
              </button>
            </div>

            {activeTab === 'edit' ? (
              <textarea
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Compose your literary piece here..."
                className="w-full bg-[#0F1216]/60 border border-[#8A8177]/20 p-6 rounded-xl font-serif text-lg text-[#FEEFFF] leading-relaxed focus:outline-none focus:border-[#D5B06C]/50 resize-y"
              />
            ) : (
              <div className="bg-[#0F1216]/40 border border-[#8A8177]/10 p-8 rounded-xl min-h-[400px]">
                <h1 className="font-serif text-3xl text-[#FEEFFF] mb-2">{title || 'Untitled Work'}</h1>
                <p className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] mb-8">
                  By {author || 'Anonymous'}
                </p>
                <div className="font-serif text-lg text-[#FEEFFF]/90 leading-relaxed whitespace-pre-line font-light">
                  {body || <span className="text-[#8A8177] italic">Your composed text will preview here...</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorPortal;