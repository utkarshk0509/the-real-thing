import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import { GlowingCard } from '../components/Shared/GlowingCard';
import { supabase } from '../lib/supabase';

export const AuthorPortal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Authentication Check
  useEffect(() => {
    const isAuth = sessionStorage.getItem('real_thing_author_auth');
    if (isAuth !== 'true') {
      navigate('/hub');
    }
  }, [navigate]);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('poem');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview' | 'manage' | 'about-editor' | 'analytics'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // About Section State
  const [aboutBio, setAboutBio] = useState('');

  // Custom Delete Confirmation Modal State
  const [workToDelete, setWorkToDelete] = useState(null);

  // Image Crop Modal State
  const [tempImage, setTempImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropPosX, setCropPosX] = useState(50);
  const [cropPosY, setCropPosY] = useState(50);

  // Works & Analytics State
  const [allWorks, setAllWorks] = useState([]);
  const [totalCommentsCount, setTotalCommentsCount] = useState(0);

  useEffect(() => {
    loadWorksAndAbout();
  }, []);

  const loadWorksAndAbout = async () => {
    // Load saved About bio
    const savedBio = localStorage.getItem('real_thing_author_bio') || '"The Real Thing" is an open-access literary sanctuary designed for poetry, prose, and quiet contemplation.';
    setAboutBio(savedBio);

    const localWorks = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
    let combinedWorks = localWorks;

    if (supabase) {
      try {
        const { data: dbWorks } = await supabase.from('works').select('*').order('created_at', { ascending: false });
        if (dbWorks && dbWorks.length > 0) {
          combinedWorks = Array.from(new Map([...localWorks, ...dbWorks].map((item) => [item.slug, item])).values());
        }

        const { count } = await supabase.from('comments').select('*', { count: 'exact', head: true });
        if (count !== null) setTotalCommentsCount(count);
      } catch (err) {
        console.warn('Analytics fetch error:', err);
      }
    }

    setAllWorks(combinedWorks);
  };

  const handleSaveAboutBio = (e) => {
    e.preventDefault();
    localStorage.setItem('real_thing_author_bio', aboutBio);
    setStatusMessage({ type: 'success', text: 'About the Author section successfully updated!' });
  };

  const analytics = useMemo(() => {
    const totalWorks = allWorks.length;
    const publishedWorks = allWorks.filter((w) => w.status === 'published').length;
    const draftWorks = allWorks.filter((w) => w.status === 'draft').length;
    const totalResonances = allWorks.reduce((acc, w) => acc + (w.gilded_likes_count || 0), 0);
    const totalWords = allWorks.reduce((acc, w) => acc + (w.body ? w.body.trim().split(/\s+/).length : 0), 0);
    const avgWords = totalWorks > 0 ? Math.round(totalWords / totalWorks) : 0;

    return { totalWorks, publishedWorks, draftWorks, totalResonances, avgWords };
  }, [allWorks]);

  const metrics = useMemo(() => {
    const words = body.trim() ? body.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 180));
    return { words, readTime };
  }, [body]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'Image file size exceeds 5MB limit.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setCropScale(1);
        setCropPosX(50);
        setCropPosY(50);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = () => {
    setImageUrl(tempImage);
    setIsCropModalOpen(false);
    setStatusMessage({ type: 'success', text: 'Image cropped and attached.' });
  };

  const handleLoadWork = (work) => {
    setEditingId(work.id);
    setTitle(work.title || '');
    setAuthor(work.author || '');
    setCategory(work.category || 'poem');
    setExcerpt(work.excerpt || '');
    setBody(work.body || '');
    setImageUrl(work.image_url || '');
    setIsDraft(work.status === 'draft');
    if (work.crop_scale) setCropScale(work.crop_scale);
    if (work.crop_pos_x) setCropPosX(work.crop_pos_x);
    if (work.crop_pos_y) setCropPosY(work.crop_pos_y);
    setActiveTab('edit');
    setStatusMessage({ type: 'success', text: `Loaded: "${work.title || 'Untitled'}"` });
  };

  const promptDeleteWork = (workId, workTitle) => {
    setWorkToDelete({ id: workId, title: workTitle });
  };

  const confirmDeleteWork = async () => {
    if (!workToDelete) return;
    const workId = workToDelete.id;

    const localWorks = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
    const updated = localWorks.filter((w) => w.id !== workId);
    localStorage.setItem('real_thing_custom_works', JSON.stringify(updated));

    try {
      if (supabase) {
        await supabase.from('works').delete().eq('id', workId);
      }
    } catch (err) {
      console.warn('Remote delete failed:', err);
    }

    loadWorksAndAbout();
    if (editingId === workId) clearForm();
    setStatusMessage({ type: 'success', text: 'Work permanently deleted.' });
    setWorkToDelete(null);
  };

  const clearForm = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('');
    setCategory('poem');
    setExcerpt('');
    setBody('');
    setImageUrl('');
    setIsDraft(false);
    setCropScale(1);
    setCropPosX(50);
    setCropPosY(50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide both a title and main body text.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const slugBase = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const newWork = {
      title,
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
      author: author.trim() || 'Anonymous',
      category,
      status: isDraft ? 'draft' : 'published',
      excerpt: excerpt.trim() || body.slice(0, 120) + '...',
      body,
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      read_time_minutes: metrics.readTime,
      published_at: isDraft ? null : new Date().toISOString(),
      crop_scale: cropScale,
      crop_pos_x: cropPosX,
      crop_pos_y: cropPosY
    };

    if (supabase) {
      const { error } = await supabase.from('works').insert([newWork]);
      if (error) {
        console.error('SUPABASE PUBLISH ERROR:', error);
        setStatusMessage({ type: 'error', text: `Supabase Error: ${error.message}` });
        setIsSubmitting(false);
        return;
      }
    }

    const localWorks = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
    localStorage.setItem('real_thing_custom_works', JSON.stringify([{ ...newWork, id: Date.now().toString() }, ...localWorks]));

    loadWorksAndAbout();
    setStatusMessage({ type: 'success', text: 'Inscription successfully published to Supabase Cloud!' });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/hub');
    }, 1200);
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
              Inscribe & Manage Literary Works
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-sans text-xs text-[#8A8177]">
              {metrics.words} words • ~{metrics.readTime} min read
            </span>
            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                className="text-xs uppercase tracking-widest text-[#8A8177] hover:text-red-400 transition-colors"
              >
                Clear Form
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest px-6 py-2.5 rounded hover:bg-[#FEEFFF] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(213,176,108,0.2)]"
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
              statusMessage.type === 'error'
                ? 'bg-red-900/40 border-red-500 text-red-200'
                : 'bg-[#D5B06C]/10 border-[#D5B06C] text-[#D5B06C]'
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
                State
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

            <div className="space-y-3 pt-2 border-t border-[#8A8177]/10">
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                Card Image Banner
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs rounded hover:border-[#D5B06C] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                📷 Upload & Crop Image
              </button>

              <input
                type="url"
                placeholder="Or paste image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2 rounded focus:outline-none focus:border-[#D5B06C]"
              />

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setTempImage(imageUrl);
                    setIsCropModalOpen(true);
                  }}
                  className="w-full text-[10px] font-sans uppercase tracking-widest text-[#D5B06C] hover:underline"
                >
                  Adjust Image Crop & Alignment
                </button>
              )}
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

            <div className="flex border-b border-[#8A8177]/20 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
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
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'preview'
                    ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Live Card Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'manage'
                    ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Saved Inscriptions ({allWorks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('about-editor')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'about-editor'
                    ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                ✍️ About Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                📊 Analytics
              </button>
            </div>

            {activeTab === 'edit' && (
              <textarea
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Compose your literary piece here..."
                className="w-full bg-[#0F1216]/60 border border-[#8A8177]/20 p-6 rounded-xl font-serif text-lg text-[#FEEFFF] leading-relaxed focus:outline-none focus:border-[#D5B06C]/50 resize-y"
              />
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="p-4 bg-[#0F1216]/30 border border-[#8A8177]/10 rounded-xl space-y-2">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#D5B06C]">
                    Content Hub Card Preview
                  </span>
                  <div className="max-w-md">
                    <GlowingCard
                      image={imageUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop'}
                      className="h-[110px]"
                    >
                      <div>
                        <h3 className="font-serif text-lg md:text-xl text-[#FEEFFF]">
                          {title || 'Untitled Work'}
                        </h3>
                        <p className="font-sans text-xs text-[#D5B06C]/80 mt-1">
                          By {author || 'Anonymous'}
                        </p>
                      </div>
                      <div className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                        {metrics.readTime} min <span className="mx-1 text-[#D5B06C]">•</span> Aug 2026
                      </div>
                    </GlowingCard>
                  </div>
                </div>

                <div className="bg-[#0F1216]/40 border border-[#8A8177]/10 p-8 rounded-xl min-h-[300px]">
                  <h1 className="font-serif text-3xl text-[#FEEFFF] mb-2">{title || 'Untitled Work'}</h1>
                  <p className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] mb-8">
                    By {author || 'Anonymous'}
                  </p>
                  <div className="font-serif text-lg text-[#FEEFFF]/90 leading-relaxed whitespace-pre-line font-light">
                    {body || <span className="text-[#8A8177] italic">Your composed text will preview here...</span>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="space-y-4 bg-[#0F1216]/40 border border-[#8A8177]/10 p-6 rounded-xl min-h-[350px]">
                <h3 className="font-serif text-xl text-[#FEEFFF] mb-4">Inscriptions & Drafts</h3>
                {allWorks.length === 0 ? (
                  <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177] py-8 text-center">
                    No inscriptions stored yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {allWorks.map((work) => (
                      <div
                        key={work.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-[#8A8177]/20 bg-[#080A06]/60 hover:border-[#D5B06C]/40 transition-colors gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-lg text-[#FEEFFF]">
                              {work.title || 'Untitled Work'}
                            </h4>
                            <span
                              className={`text-[9px] font-sans uppercase tracking-wider px-2 py-0.5 rounded ${
                                work.status === 'published'
                                  ? 'bg-[#D5B06C]/20 text-[#D5B06C] border border-[#D5B06C]/40'
                                  : 'bg-[#8A8177]/20 text-[#8A8177]'
                              }`}
                            >
                              {work.status}
                            </span>
                          </div>
                          <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                            {work.category} • By {work.author || 'Anonymous'} • {work.read_time_minutes} min read
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadWork(work)}
                            className="px-4 py-1.5 rounded border border-[#D5B06C]/40 text-[#D5B06C] font-sans text-xs uppercase tracking-widest hover:bg-[#D5B06C] hover:text-[#080A06] transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDeleteWork(work.id, work.title)}
                            className="px-3 py-1.5 rounded border border-red-500/30 text-red-400 font-sans text-xs uppercase tracking-widest hover:bg-red-500/20 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ABOUT THE AUTHOR EDITOR TAB */}
            {activeTab === 'about-editor' && (
              <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/10 p-6 rounded-xl min-h-[350px]">
                <div className="border-b border-[#8A8177]/20 pb-3">
                  <h3 className="font-serif text-xl text-[#FEEFFF]">Edit "About the Author" Section</h3>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                    Modify the bio text displayed on the About page
                  </p>
                </div>

                <form onSubmit={handleSaveAboutBio} className="space-y-4">
                  <div>
                    <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                      About Page Content (Markdown / Text supported)
                    </label>
                    <textarea
                      rows={8}
                      value={aboutBio}
                      onChange={(e) => setAboutBio(e.target.value)}
                      className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-base p-4 rounded-lg focus:outline-none focus:border-[#D5B06C] leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-colors cursor-pointer"
                  >
                    Save About Bio
                  </button>
                </form>
              </div>
            )}

            {/* CURATOR PRIVATE ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/10 p-6 rounded-xl min-h-[350px]">
                <div className="border-b border-[#8A8177]/20 pb-3">
                  <h3 className="font-serif text-xl text-[#FEEFFF]">Curator Insights & Analytics</h3>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                    Private Performance Overview for Inscriptions
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Inscriptions</span>
                    <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalWorks}</p>
                  </div>

                  <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Resonances</span>
                    <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalResonances}</p>
                  </div>

                  <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Reflections</span>
                    <p className="font-serif text-3xl text-[#D5B06C]">{totalCommentsCount}</p>
                  </div>

                  <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Avg Words / Work</span>
                    <p className="font-serif text-3xl text-[#D5B06C]">{analytics.avgWords}</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <h4 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C]">Inscriptions Engagement Summary</h4>
                  <div className="overflow-x-auto border border-[#8A8177]/20 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#8A8177]/20 bg-[#080A06]/80 font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                          <th className="p-3">Work Title</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Resonances (Likes)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8A8177]/10 font-serif text-xs">
                        {allWorks.map((work) => (
                          <tr key={work.id} className="hover:bg-[#080A06]/40 transition-colors">
                            <td className="p-3 text-[#FEEFFF]">{work.title || 'Untitled'}</td>
                            <td className="p-3 uppercase font-sans text-[10px] text-[#8A8177]">{work.category}</td>
                            <td className="p-3">
                              <span className={`text-[9px] font-sans uppercase px-2 py-0.5 rounded ${
                                work.status === 'published' ? 'text-[#D5B06C] bg-[#D5B06C]/10 border border-[#D5B06C]/30' : 'text-[#8A8177] bg-[#8A8177]/20'
                              }`}>
                                {work.status}
                              </span>
                            </td>
                            <td className="p-3 font-sans text-xs text-[#D5B06C]">{work.gilded_likes_count || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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