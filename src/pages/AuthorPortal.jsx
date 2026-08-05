import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import { GlowingCard } from '../components/Shared/GlowingCard';
import { supabase } from '../lib/supabase';

export const AuthorPortal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('real_thing_author_auth');
    if (isAuth !== 'true') {
      navigate('/hub');
    }
  }, [navigate]);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('poem');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [activeTab, setActiveTab] = useState('manage'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [aboutBio, setAboutBio] = useState('');
  const [workToDelete, setWorkToDelete] = useState(null);

  const [tempImage, setTempImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropPosX, setCropPosX] = useState(50);
  const [cropPosY, setCropPosY] = useState(50);

  const [allWorks, setAllWorks] = useState([]);
  const [totalCommentsCount, setTotalCommentsCount] = useState(0);

  // Drag and drop sorting state
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  useEffect(() => {
    loadWorksAndAbout();
  }, []);

  // Helper to instantly seed the public hub cache for 0ms page loads
  const updateHubCache = (worksArray) => {
    try {
      const publishedOnly = worksArray.filter(w => w.status === 'published');
      localStorage.setItem('real_thing_cached_hub_works', JSON.stringify(publishedOnly));
    } catch (e) {
      console.warn('Cache seed warning:', e);
    }
  };

  const loadWorksAndAbout = async () => {
    const savedBio = localStorage.getItem('real_thing_author_bio') || '"The Real Thing" is an open-access literary sanctuary designed for poetry, prose, and quiet contemplation.';
    setAboutBio(savedBio);

    let combinedWorks = [];

    if (supabase) {
      try {
        const { data: dbWorks } = await supabase
          .from('works')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (dbWorks) combinedWorks = dbWorks;
      } catch (err) {
        console.warn('Analytics fetch error:', err);
      }
    }

    // Apply any lightweight local sort order rules saved safely
    const savedOrderMap = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
    const orderMap = new Map(savedOrderMap.map(item => [item.slug, item.sort_order]));

    combinedWorks = combinedWorks.map(work => {
      if (orderMap.has(work.slug)) {
        return { ...work, sort_order: orderMap.get(work.slug) };
      }
      return work;
    });

    // Sort cleanly by sort_order
    combinedWorks.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    setAllWorks(combinedWorks);
    updateHubCache(combinedWorks); // Seed cache instantly
  };

  const handleSaveAboutBio = async (e) => {
    e.preventDefault();
    localStorage.setItem('real_thing_author_bio', aboutBio);

    try {
      if (supabase) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: 'author_bio', value: aboutBio, updated_at: new Date().toISOString() });

        if (error) throw error;
      }
      setStatusMessage({ type: 'success', text: 'About the Author bio successfully published to the cloud!' });
    } catch (err) {
      console.warn('Remote bio sync failed:', err);
      setStatusMessage({ type: 'success', text: 'Bio saved locally (Cloud sync warning).' });
    }
  };

  // Drag and Drop Handlers for Reordering
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const updatedWorks = [...allWorks];
    const [movedItem] = updatedWorks.splice(draggedItemIndex, 1);
    updatedWorks.splice(targetIndex, 0, movedItem);

    setAllWorks(updatedWorks);
    setDraggedItemIndex(null);
  };

  // Explicit Save Order Handler (Optimized with lightweight tracking to prevent quota errors)
  const handleSaveOrder = async () => {
    try {
      // 1. Reassign sequential sort_order indexes (0, 1, 2...)
      const finalWorks = allWorks.map((work, idx) => ({
        ...work,
        sort_order: idx
      }));

      setAllWorks(finalWorks);
      updateHubCache(finalWorks); // Update cache immediately

      // 2. Save only lightweight references to localStorage to prevent quota breaches
      const lightweightMap = finalWorks.map(w => ({
        slug: w.slug,
        sort_order: w.sort_order
      }));
      localStorage.setItem('real_thing_custom_works', JSON.stringify(lightweightMap));

      // 3. Safely sync to Supabase
      if (supabase) {
        for (let work of finalWorks) {
          if (work.id && !String(work.id).startsWith('17')) {
            await supabase
              .from('works')
              .update({ sort_order: work.sort_order })
              .eq('id', work.id);
          } else if (work.slug) {
            await supabase
              .from('works')
              .update({ sort_order: work.sort_order })
              .eq('slug', work.slug);
          }
        }
      }

      setStatusMessage({ type: 'success', text: '✨ Constellation order successfully saved!' });
    } catch (err) {
      console.warn('Order save notice:', err.message);
      setStatusMessage({ type: 'success', text: '✨ Constellation order saved locally!' });
    }
  };

  const analytics = useMemo(() => {
    const totalWorks = allWorks.length;
    const totalResonances = allWorks.reduce((acc, w) => acc + (w.gilded_likes_count || 0), 0);
    const totalWords = allWorks.reduce((acc, w) => acc + (w.body ? w.body.trim().split(/\s+/).length : 0), 0);
    const avgWords = totalWorks > 0 ? Math.round(totalWords / totalWorks) : 0;
    return { totalWorks, totalResonances, avgWords };
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
    setStatusMessage({ type: 'success', text: 'Image successfully cropped and applied.' });
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

  const promptDeleteWork = (work) => {
    setWorkToDelete(work);
  };

  const confirmDeleteWork = async () => {
    if (!workToDelete) return;
    const { id, slug } = workToDelete;

    const filteredWorks = allWorks.filter((w) => w.id !== id && w.slug !== slug);
    setAllWorks(filteredWorks);
    updateHubCache(filteredWorks);

    const localWorks = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
    const updatedLocal = localWorks.filter((w) => w.slug !== slug);
    localStorage.setItem('real_thing_custom_works', JSON.stringify(updatedLocal));

    try {
      if (supabase) {
        if (slug) await supabase.from('works').delete().eq('slug', slug);
        if (id) await supabase.from('works').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Remote delete failed:', err);
    }

    if (editingId === id) clearForm();
    setStatusMessage({ type: 'success', text: 'Inscription permanently deleted.' });
    setWorkToDelete(null);
    loadWorksAndAbout();
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
      id: editingId || Date.now().toString(),
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
      crop_pos_y: cropPosY,
      sort_order: allWorks.length
    };

    if (supabase) {
      try {
        if (editingId) {
          await supabase.from('works').update(newWork).eq('id', editingId);
        } else {
          await supabase.from('works').insert([newWork]);
        }
      } catch (err) {
        console.warn('Supabase upsert warning:', err);
      }
    }

    loadWorksAndAbout();
    setStatusMessage({ type: 'success', text: 'Inscription successfully saved and published!' });

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
                className="text-xs uppercase tracking-widest text-[#8A8177] hover:text-red-400 transition-colors cursor-pointer"
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
                  className="w-full text-[10px] font-sans uppercase tracking-widest text-[#D5B06C] hover:underline cursor-pointer pt-1"
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
                  activeTab === 'edit' ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]' : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'preview' ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]' : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Live Card Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'manage' ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]' : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Saved Inscriptions ({allWorks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('arrange')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'arrange' ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]' : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Arrange Constellation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('about-editor')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'about-editor' ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]' : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                About Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'analytics' ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]' : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Analytics
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
                        key={work.id || work.slug}
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
                            onClick={() => promptDeleteWork(work)}
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

            {/* Drag and Drop Arrange Tab */}
            {activeTab === 'arrange' && (
              <div className="space-y-4 bg-[#0F1216]/40 border border-[#8A8177]/10 p-6 rounded-xl min-h-[350px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8A8177]/20 pb-3 gap-3">
                  <div>
                    <h3 className="font-serif text-xl text-[#FEEFFF]">Arrange Constellation Cards</h3>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                      Drag cards to reorder your works, then click save.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveOrder}
                    className="px-5 py-2 rounded bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-md"
                  >
                    Save Order
                  </button>
                </div>

                {allWorks.length === 0 ? (
                  <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177] py-8 text-center">
                    No published works to arrange.
                  </p>
                ) : (
                  <div className="space-y-2 pt-2">
                    {allWorks.map((work, index) => (
                      <div
                        key={work.id || work.slug}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center justify-between p-3.5 rounded-lg border border-[#8A8177]/20 bg-[#080A06] hover:border-[#D5B06C]/50 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[#8A8177] text-xs font-mono select-none">⠿</span>
                          <span className="font-serif text-sm text-[#FEEFFF] truncate max-w-[320px]">
                            {index + 1}. {work.title || 'Untitled Work'}
                          </span>
                          <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded bg-[#D5B06C]/10 text-[#D5B06C]">
                            {work.category}
                          </span>
                        </div>
                        <span className="text-xs font-sans text-[#8A8177]/50 uppercase tracking-widest select-none pr-2">
                          Drag to Reorder
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                      About Page Content
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Crop & Alignment Modal */}
      <AnimatePresence>
        {isCropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1216] border border-[#D5B06C]/40 p-6 md:p-8 rounded-2xl max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#8A8177]/20 pb-4">
                <h3 className="font-serif text-xl text-[#FEEFFF]">Adjust Banner Image Crop</h3>
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="text-[#8A8177] hover:text-[#FEEFFF] font-sans text-xs uppercase cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="w-full h-40 rounded-xl overflow-hidden border border-[#8A8177]/30 bg-[#080A06] relative flex items-center justify-center">
                {tempImage && (
                  <img
                    src={tempImage}
                    alt="Crop preview"
                    className="w-full h-full object-cover transition-all duration-75"
                    style={{
                      transform: `scale(${cropScale})`,
                      objectPosition: `${cropPosX}% ${cropPosY}%`
                    }}
                  />
                )}
              </div>

              {/* Adjustment Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1">
                    <span>Zoom Scale</span>
                    <span>{cropScale.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={cropScale}
                    onChange={(e) => setCropScale(parseFloat(e.target.value))}
                    className="w-full accent-[#D5B06C] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1">
                    <span>Horizontal Alignment (X)</span>
                    <span>{cropPosX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropPosX}
                    onChange={(e) => setCropPosX(parseInt(e.target.value))}
                    className="w-full accent-[#D5B06C] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1">
                    <span>Vertical Alignment (Y)</span>
                    <span>{cropPosY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropPosY}
                    onChange={(e) => setCropPosY(parseInt(e.target.value))}
                    className="w-full accent-[#D5B06C] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-4 py-2 rounded border border-[#8A8177]/30 text-[#8A8177] font-sans text-xs uppercase tracking-widest hover:text-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="px-6 py-2 rounded bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Apply & Attach
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {workToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1216] border border-red-500/30 p-6 md:p-8 rounded-2xl max-w-md w-full space-y-6 text-center shadow-2xl relative"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center text-xl font-serif">
                  †
                </div>
                <h3 className="font-serif text-2xl text-[#FEEFFF]">Delete Inscription?</h3>
                <p className="font-sans text-xs text-[#8A8177]">
                  Are you sure you want to permanently delete{' '}
                  <span className="text-[#D5B06C] italic font-serif">
                    "{workToDelete.title || 'this work'}"
                  </span>
                  ?
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setWorkToDelete(null)}
                  className="flex-1 py-2.5 rounded border border-[#8A8177]/30 text-[#8A8177] font-sans text-xs uppercase tracking-widest hover:text-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteWork}
                  className="flex-1 py-2.5 rounded bg-red-500/20 border border-red-500/50 text-red-300 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-red-500 hover:text-[#080A06] transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthorPortal;