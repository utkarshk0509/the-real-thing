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
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview' | 'manage'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Custom Delete Confirmation Modal State
  const [workToDelete, setWorkToDelete] = useState(null); // { id, title }

  // Image Crop & Modal State
  const [tempImage, setTempImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropPosX, setCropPosX] = useState(50); // % horizontal focal point
  const [cropPosY, setCropPosY] = useState(50); // % vertical focal point

  // Inscriptions / Works List State
  const [allWorks, setAllWorks] = useState([]);

  // Load saved works on mount
  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = () => {
    const localWorks = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
    setAllWorks(localWorks);
  };

  // Words & Reading Time Calculator
  const metrics = useMemo(() => {
    const words = body.trim() ? body.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 180));
    return { words, readTime };
  }, [body]);

  // Handle File Select & Open Crop Modal
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

  // Confirm Crop Settings from Modal
  const handleApplyCrop = () => {
    setImageUrl(tempImage);
    setIsCropModalOpen(false);
    setStatusMessage({ type: 'success', text: 'Image cropped and attached to work.' });
  };

  // Load an existing work into the Editor
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

  // Trigger Delete Confirmation Modal
  const promptDeleteWork = (workId, workTitle) => {
    setWorkToDelete({ id: workId, title: workTitle });
  };

  // Execute Deletion
  const confirmDeleteWork = async () => {
    if (!workToDelete) return;

    const workId = workToDelete.id;

    // 1. Delete from local storage
    const localWorks = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
    const updated = localWorks.filter((w) => w.id !== workId);
    localStorage.setItem('real_thing_custom_works', JSON.stringify(updated));

    // 2. Delete from Supabase if connected
    try {
      if (supabase) {
        await supabase.from('works').delete().eq('id', workId);
      }
    } catch (err) {
      console.warn('Remote delete skipped:', err);
    }

    loadWorks();

    if (editingId === workId) {
      clearForm();
    }

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

  // Handle Form Submission (Save Draft or Publish)
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
      crop_pos_y: cropPosY
    };

    try {
      // 1. Save locally
      const localWorks = JSON.parse(localStorage.getItem('real_thing_custom_works') || '[]');
      const filtered = localWorks.filter((w) => w.id !== newWork.id);
      localStorage.setItem('real_thing_custom_works', JSON.stringify([newWork, ...filtered]));

      // 2. Save to Supabase if connected
      if (supabase && !isDraft) {
        await supabase.from('works').upsert([newWork]);
      }

      loadWorks();

      if (isDraft) {
        setStatusMessage({ type: 'success', text: 'Draft saved successfully!' });
      } else {
        setStatusMessage({ type: 'success', text: 'Inscription successfully published!' });
        setTimeout(() => navigate('/hub'), 1000);
      }

    } catch (err) {
      console.warn('Saved locally:', err.message);
      setStatusMessage({ type: 'success', text: isDraft ? 'Draft saved locally!' : 'Inscription published locally!' });
      if (!isDraft) {
        setTimeout(() => navigate('/hub'), 1000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF] p-6 md:p-12">
      <AtmosphericBackground />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Header Bar */}
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

        {/* Status Notification */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg font-sans text-xs uppercase tracking-wider text-center border ${
              statusMessage.type === 'error'
                ? 'bg-red-900/20 border-red-500/40 text-red-300'
                : 'bg-[#D5B06C]/10 border-[#D5B06C] text-[#D5B06C]'
            }`}
          >
            {statusMessage.text}
          </motion.div>
        )}

        {/* Main Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metadata Sidebar */}
          <div className="bg-[#0F1216] border border-[#8A8177]/20 p-6 rounded-xl h-fit space-y-6">
            <h2 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C]">
              Work Metadata
            </h2>

            {/* Author Name */}
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

            {/* Category Select */}
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

            {/* Visibility Toggle */}
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

            {/* Image Upload & Crop Trigger */}
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

            {/* Excerpt */}
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

          {/* Right Editor, Preview, and Management Pane */}
          <div className="lg:col-span-2 space-y-6">
            <input
              type="text"
              placeholder="Title of Work..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-[#8A8177]/30 py-3 text-3xl md:text-4xl font-serif text-[#FEEFFF] placeholder-[#8A8177]/40 focus:outline-none focus:border-[#D5B06C]"
            />

            {/* Tab Controls */}
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
                Live Card Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                  activeTab === 'manage'
                    ? 'text-[#D5B06C] border-b-2 border-[#D5B06C]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF]'
                }`}
              >
                Saved Inscriptions ({allWorks.length})
              </button>
            </div>

            {/* EDITOR TAB */}
            {activeTab === 'edit' && (
              <textarea
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Compose your literary piece here..."
                className="w-full bg-[#0F1216]/60 border border-[#8A8177]/20 p-6 rounded-xl font-serif text-lg text-[#FEEFFF] leading-relaxed focus:outline-none focus:border-[#D5B06C]/50 resize-y"
              />
            )}

            {/* PREVIEW TAB */}
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

            {/* SAVED WORKS & DELETE MANAGER TAB */}
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
          </div>
        </div>
      </div>

      {/* POPUP IMAGE CROPPER MODAL */}
      <AnimatePresence>
        {isCropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1216] border border-[#8A8177]/30 p-6 md:p-8 rounded-2xl max-w-xl w-full space-y-6 shadow-2xl"
            >
              <div className="space-y-1">
                <h3 className="font-serif text-2xl text-[#FEEFFF]">Crop & Align Thumbnail</h3>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                  Previewing Exact Card Ratio for Content Hub
                </p>
              </div>

              <div className="border border-[#D5B06C]/40 p-2 rounded-xl bg-[#080A06]/50">
                <div className="relative overflow-hidden rounded-xl border border-[#8A8177]/20 bg-[#0F1216] p-6 h-[120px]">
                  <div className="absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden pointer-events-none opacity-60">
                    <img
                      src={tempImage}
                      alt="Crop Preview"
                      style={{
                        objectFit: 'cover',
                        objectPosition: `${cropPosX}% ${cropPosY}%`,
                        transform: `scale(${cropScale})`,
                      }}
                      className="w-full h-full filter grayscale contrast-125 mix-blend-luminosity transition-all duration-150"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F1216] via-[#0F1216]/60 to-transparent" />
                  </div>

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-lg text-[#FEEFFF]">
                        {title || 'Sample Work Title'}
                      </h4>
                      <p className="font-sans text-xs text-[#D5B06C] mt-0.5">
                        By {author || 'Author'}
                      </p>
                    </div>
                    <div className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                      {metrics.readTime} min read
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-[#080A06] p-4 rounded-xl border border-[#8A8177]/20">
                <div>
                  <div className="flex justify-between font-sans text-xs text-[#8A8177] mb-1">
                    <span>Zoom Scale</span>
                    <span>{cropScale.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={cropScale}
                    onChange={(e) => setCropScale(parseFloat(e.target.value))}
                    className="w-full accent-[#D5B06C] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-sans text-xs text-[#8A8177] mb-1">
                    <span>Vertical Alignment</span>
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

                <div>
                  <div className="flex justify-between font-sans text-xs text-[#8A8177] mb-1">
                    <span>Horizontal Focal Point</span>
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
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-5 py-2.5 rounded border border-[#8A8177]/30 text-[#8A8177] font-sans text-xs uppercase tracking-widest hover:text-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="px-6 py-2.5 rounded bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Apply Crop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP DELETE CONFIRMATION MODAL */}
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
                  ? This action cannot be undone.
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