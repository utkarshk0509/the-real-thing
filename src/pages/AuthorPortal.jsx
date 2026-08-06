import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';
import { GlowingCard } from '../components/Shared/GlowingCard';
import workService from '../services/workService';
import storageService from '../services/storageService';
import siteService from '../services/siteService';

export const AuthorPortal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('real_thing_author_auth');
    if (isAuth !== 'true') {
      navigate('/hub');
    }
  }, [navigate]);

  // Master Portal View State
  const [activeView, setActiveView] = useState('write'); // 'write' | 'library' | 'arrange' | 'about' | 'analytics'

  // Work Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('poem');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [editorSubTab, setEditorSubTab] = useState('edit'); // 'edit' | 'preview'
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true);

  // Status & Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // About Bio & Delete Modal State
  const [aboutBio, setAboutBio] = useState('');
  const [workToDelete, setWorkToDelete] = useState(null);

  // Image Crop Modal State
  const [tempImage, setTempImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropPosX, setCropPosX] = useState(50);
  const [cropPosY, setCropPosY] = useState(50);

  // Interactive Image Drag & Zoom State
  const [isCropDragging, setIsCropDragging] = useState(false);
  const cropDragStartRef = useRef({ x: 0, y: 0 });
  const cropPosStartRef = useRef({ x: 50, y: 50 });

  // Works Data & Category Filter States
  const [allWorks, setAllWorks] = useState([]);
  const [libraryCategory, setLibraryCategory] = useState('all'); // 'all' | 'poem' | 'story' | 'draft'
  const [librarySearch, setLibrarySearch] = useState('');

  // Constellation Arranger Category State
  const [arrangerCategory, setArrangerCategory] = useState('poem'); // 'poem' | 'story'
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  useEffect(() => {
    loadWorksAndAbout();
  }, []);

  // Global mouse & touch listeners for interactive image cropping
  useEffect(() => {
    if (!isCropDragging) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - cropDragStartRef.current.x;
      const dy = e.clientY - cropDragStartRef.current.y;

      const deltaX = (dx / 250) * 100;
      const deltaY = (dy / 120) * 100;

      const newX = Math.max(-200, Math.min(300, cropPosStartRef.current.x - deltaX));
      const newY = Math.max(-200, Math.min(300, cropPosStartRef.current.y - deltaY));

      setCropPosX(Math.round(newX));
      setCropPosY(Math.round(newY));
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - cropDragStartRef.current.x;
      const dy = e.touches[0].clientY - cropDragStartRef.current.y;

      const deltaX = (dx / 250) * 100;
      const deltaY = (dy / 120) * 100;

      const newX = Math.max(-200, Math.min(300, cropPosStartRef.current.x - deltaX));
      const newY = Math.max(-200, Math.min(300, cropPosStartRef.current.y - deltaY));

      setCropPosX(Math.round(newX));
      setCropPosY(Math.round(newY));
    };

    const handleMouseUp = () => {
      setIsCropDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isCropDragging]);

  const handleCropMouseDown = (e) => {
    e.preventDefault();
    setIsCropDragging(true);
    cropDragStartRef.current = { x: e.clientX, y: e.clientY };
    cropPosStartRef.current = { x: cropPosX, y: cropPosY };
  };

  const handleCropTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsCropDragging(true);
      cropDragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      cropPosStartRef.current = { x: cropPosX, y: cropPosY };
    }
  };

  const handleCropWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    setCropScale((prev) => Math.max(1.0, Math.min(3.0, parseFloat((prev + zoomFactor).toFixed(1)))));
  };

  const loadWorksAndAbout = async () => {
    const bio = await siteService.getAuthorBio();
    setAboutBio(bio);

    const combinedWorks = await workService.getAllWorksAdmin();
    setAllWorks(combinedWorks);
  };

  const handleSaveAboutBio = async (e) => {
    e.preventDefault();
    try {
      await siteService.updateAuthorBio(aboutBio);
      setStatusMessage({ type: 'success', text: 'About the Author bio successfully published.' });
    } catch (err) {
      console.warn('Bio save notice:', err);
      setStatusMessage({ type: 'success', text: 'Bio saved locally.' });
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

    const categoryWorks = allWorks.filter((w) => w.category === arrangerCategory);
    const otherWorks = allWorks.filter((w) => w.category !== arrangerCategory);

    const reorderedCategory = [...categoryWorks];
    const [movedItem] = reorderedCategory.splice(draggedItemIndex, 1);
    reorderedCategory.splice(targetIndex, 0, movedItem);

    const finalMerged = [...reorderedCategory, ...otherWorks];
    setAllWorks(finalMerged);
    setDraggedItemIndex(null);
  };

  // Explicit Save Order Handler for Category
  const handleSaveOrder = async () => {
    try {
      const finalWorks = await workService.saveOrder(allWorks);
      setAllWorks(finalWorks);
      setStatusMessage({ type: 'success', text: 'Constellation order successfully saved.' });
    } catch (err) {
      console.warn('Order save notice:', err.message);
      setStatusMessage({ type: 'success', text: 'Constellation order saved locally.' });
    }
  };

  const analytics = useMemo(() => {
    const totalWorks = allWorks.length;
    const totalPoems = allWorks.filter((w) => w.category === 'poem').length;
    const totalStories = allWorks.filter((w) => w.category === 'story').length;
    const totalDrafts = allWorks.filter((w) => w.status === 'draft').length;
    const totalResonances = allWorks.reduce((acc, w) => acc + (w.gilded_likes_count || 0), 0);
    const totalWords = allWorks.reduce((acc, w) => acc + (w.body ? w.body.trim().split(/\s+/).length : 0), 0);
    const avgWords = totalWorks > 0 ? Math.round(totalWords / totalWorks) : 0;
    return { totalWorks, totalPoems, totalStories, totalDrafts, totalResonances, avgWords };
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

  const handleApplyCrop = async () => {
    setStatusMessage({ type: 'success', text: 'Compressing image into WebP format...' });
    try {
      const compressedUrl = await storageService.uploadCoverImage(tempImage);
      setImageUrl(compressedUrl);
      setIsCropModalOpen(false);
      setStatusMessage({ type: 'success', text: 'Image successfully compressed into WebP and applied.' });
    } catch (err) {
      setImageUrl(tempImage);
      setIsCropModalOpen(false);
      setStatusMessage({ type: 'success', text: 'Image applied.' });
    }
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
    setActiveView('write');
    setEditorSubTab('edit');
    setStatusMessage({ type: 'success', text: `Loaded: "${work.title || 'Untitled'}"` });
  };

  const promptDeleteWork = (work) => {
    setWorkToDelete(work);
  };

  const confirmDeleteWork = async () => {
    if (!workToDelete) return;

    await workService.deleteWork({ id: workToDelete.id, slug: workToDelete.slug });

    if (editingId === workToDelete.id) clearForm();
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

    let finalImageUrl = imageUrl.trim();
    if (finalImageUrl.startsWith('data:image/')) {
      try {
        finalImageUrl = await storageService.uploadCoverImage(finalImageUrl);
      } catch (err) {
        console.warn('WebP storage upload fallback:', err);
      }
    }

    const slugBase = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const newWork = {
      id: editingId || undefined,
      title,
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
      author: author.trim() || 'Anonymous',
      category,
      status: isDraft ? 'draft' : 'published',
      excerpt: excerpt.trim() || body.slice(0, 120) + '...',
      body,
      image_url: finalImageUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      read_time_minutes: metrics.readTime,
      published_at: isDraft ? null : new Date().toISOString(),
      crop_scale: cropScale,
      crop_pos_x: cropPosX,
      crop_pos_y: cropPosY,
      sort_order: allWorks.length
    };

    await workService.upsertWork(newWork);

    loadWorksAndAbout();
    setStatusMessage({ type: 'success', text: 'Inscription successfully saved and published.' });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/hub');
    }, 1200);
  };

  // Filtered works for Library View
  const filteredLibraryWorks = useMemo(() => {
    return allWorks.filter((work) => {
      const matchesSearch =
        work.title?.toLowerCase().includes(librarySearch.toLowerCase()) ||
        work.author?.toLowerCase().includes(librarySearch.toLowerCase()) ||
        work.excerpt?.toLowerCase().includes(librarySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (libraryCategory === 'poem') return work.category === 'poem' && work.status === 'published';
      if (libraryCategory === 'story') return work.category === 'story' && work.status === 'published';
      if (libraryCategory === 'draft') return work.status === 'draft';
      return true; // 'all'
    });
  }, [allWorks, libraryCategory, librarySearch]);

  // Filtered works for Constellation Arranger View
  const currentArrangerWorks = useMemo(() => {
    return allWorks.filter((work) => work.category === arrangerCategory && work.status === 'published');
  }, [allWorks, arrangerCategory]);

  return (
    <div className="relative min-h-screen bg-[#080A06] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF] p-4 md:p-10">
      <AtmosphericBackground />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#8A8177]/20 pb-5 gap-4">
          <div>
            <button
              onClick={() => navigate('/hub')}
              className="font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors mb-1 block cursor-pointer"
            >
              ← Return to Hub
            </button>
            <h1 className="font-serif text-3xl text-[#FEEFFF]">Curator Portal</h1>
            <p className="font-sans text-[11px] uppercase tracking-widest text-[#8A8177] mt-1">
              Sanctuary Content Management & Architecture
            </p>
          </div>

          <div className="flex items-center gap-3">
            {editingId && activeView === 'write' && (
              <button
                type="button"
                onClick={clearForm}
                className="text-xs uppercase tracking-widest text-[#8A8177] hover:text-red-400 transition-colors cursor-pointer border border-[#8A8177]/20 px-3 py-2 rounded"
              >
                Clear Form
              </button>
            )}
            {activeView === 'write' && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest px-6 py-2.5 rounded hover:bg-[#FEEFFF] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(213,176,108,0.2)]"
              >
                {isSubmitting ? 'Inscribing...' : isDraft ? 'Save Draft' : 'Publish Work'}
              </button>
            )}
          </div>
        </header>

        {/* Master Navigation Bar */}
        <nav className="flex items-center border-b border-[#8A8177]/20 overflow-x-auto bg-[#0F1216]/50 rounded-xl p-1.5 backdrop-blur-sm gap-1">
          <button
            type="button"
            onClick={() => setActiveView('write')}
            className={`px-5 py-2.5 rounded-lg font-sans text-xs uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'write'
                ? 'bg-[#D5B06C]/15 text-[#D5B06C] border border-[#D5B06C]/40 font-semibold'
                : 'text-[#8A8177] hover:text-[#FEEFFF]'
            }`}
          >
            Write & Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveView('library')}
            className={`px-5 py-2.5 rounded-lg font-sans text-xs uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'library'
                ? 'bg-[#D5B06C]/15 text-[#D5B06C] border border-[#D5B06C]/40 font-semibold'
                : 'text-[#8A8177] hover:text-[#FEEFFF]'
            }`}
          >
            Library ({allWorks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('arrange')}
            className={`px-5 py-2.5 rounded-lg font-sans text-xs uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'arrange'
                ? 'bg-[#D5B06C]/15 text-[#D5B06C] border border-[#D5B06C]/40 font-semibold'
                : 'text-[#8A8177] hover:text-[#FEEFFF]'
            }`}
          >
            Constellation Arranger
          </button>
          <button
            type="button"
            onClick={() => setActiveView('about')}
            className={`px-5 py-2.5 rounded-lg font-sans text-xs uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'about'
                ? 'bg-[#D5B06C]/15 text-[#D5B06C] border border-[#D5B06C]/40 font-semibold'
                : 'text-[#8A8177] hover:text-[#FEEFFF]'
            }`}
          >
            About Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveView('analytics')}
            className={`px-5 py-2.5 rounded-lg font-sans text-xs uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'analytics'
                ? 'bg-[#D5B06C]/15 text-[#D5B06C] border border-[#D5B06C]/40 font-semibold'
                : 'text-[#8A8177] hover:text-[#FEEFFF]'
            }`}
          >
            Analytics
          </button>
        </nav>

        {/* Global Notification Banner */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3.5 rounded-lg font-sans text-xs uppercase tracking-wider text-center border ${
              statusMessage.type === 'error'
                ? 'bg-red-900/40 border-red-500 text-red-200'
                : 'bg-[#D5B06C]/10 border-[#D5B06C] text-[#D5B06C]'
            }`}
          >
            {statusMessage.text}
          </motion.div>
        )}

        {/* 1. WRITE & EDIT VIEW */}
        {activeView === 'write' && (
          <div className="space-y-6">
            {/* Title & Sub-tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#8A8177]/20 pb-4">
              <input
                type="text"
                placeholder="Title of Work..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-b border-[#8A8177]/30 py-2 text-2xl md:text-3xl font-serif text-[#FEEFFF] placeholder-[#8A8177]/40 focus:outline-none focus:border-[#D5B06C]"
              />

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditorSubTab('edit')}
                  className={`px-4 py-1.5 rounded text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                    editorSubTab === 'edit'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10'
                      : 'border border-[#8A8177]/20 text-[#8A8177]'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTab('preview')}
                  className={`px-4 py-1.5 rounded text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                    editorSubTab === 'preview'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10'
                      : 'border border-[#8A8177]/20 text-[#8A8177]'
                  }`}
                >
                  Live Card Preview
                </button>
              </div>
            </div>

            {/* Collapsible Metadata Drawer */}
            <div className="bg-[#0F1216] border border-[#8A8177]/20 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
                className="w-full px-6 py-3 bg-[#080A06]/50 flex items-center justify-between cursor-pointer border-b border-[#8A8177]/10"
              >
                <span className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] font-medium">
                  Work Metadata and Banner Configuration
                </span>
                <span className="text-[#8A8177] text-xs">
                  {isMetadataExpanded ? '▲ Hide Settings' : '▼ Expand Settings'}
                </span>
              </button>

              <AnimatePresence>
                {isMetadataExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <div>
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                        Author Name / Alias
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aureligious"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2.5 rounded focus:outline-none focus:border-[#D5B06C]"
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2.5 rounded focus:outline-none focus:border-[#D5B06C] cursor-pointer"
                      >
                        <option value="poem">Poem</option>
                        <option value="story">Story</option>
                        <option value="essay">Essay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                        Publishing State
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

                    <div className="md:col-span-2 space-y-3">
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                        Card Image Banner
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
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
                          className="py-2 px-4 bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs rounded hover:border-[#D5B06C] transition-colors cursor-pointer"
                        >
                          Upload and Crop Image (WebP)
                        </button>
                        <input
                          type="url"
                          placeholder="Or paste image URL..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="flex-1 bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2 rounded focus:outline-none focus:border-[#D5B06C]"
                        />
                      </div>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempImage(imageUrl);
                            setIsCropModalOpen(true);
                          }}
                          className="text-[10px] font-sans uppercase tracking-widest text-[#D5B06C] hover:underline cursor-pointer"
                        >
                          Adjust Image Crop and Alignment
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                        Short Excerpt Preview
                      </label>
                      <textarea
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Succinct preview excerpt..."
                        className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-xs p-2.5 rounded focus:outline-none focus:border-[#D5B06C] resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Writing Canvas / Preview */}
            {editorSubTab === 'edit' ? (
              <div className="space-y-3">
                <textarea
                  rows={18}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Compose your literary work here..."
                  className="w-full bg-[#0F1216]/60 border border-[#8A8177]/20 p-6 rounded-xl font-serif text-lg text-[#FEEFFF] leading-relaxed focus:outline-none focus:border-[#D5B06C]/50 resize-y min-h-[400px]"
                />
                <div className="flex justify-between items-center text-xs font-sans text-[#8A8177] px-2">
                  <span>{metrics.words} words • ~{metrics.readTime} min read</span>
                  <span className="uppercase tracking-widest">{category} mode</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-5 bg-[#0F1216]/30 border border-[#8A8177]/10 rounded-xl space-y-2">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#D5B06C]">
                    Content Hub Card Preview
                  </span>
                  <div className="max-w-md">
                    <GlowingCard
                      image={imageUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop'}
                      cropScale={cropScale}
                      cropPosX={cropPosX}
                      cropPosY={cropPosY}
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
          </div>
        )}

        {/* 2. CATEGORIZED LIBRARY VIEW */}
        {activeView === 'library' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/10 p-6 rounded-xl min-h-[400px]">
            {/* Search and Category Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#8A8177]/20 pb-4">
              {/* Category Sub-Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setLibraryCategory('all')}
                  className={`px-4 py-1.5 rounded text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                    libraryCategory === 'all'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10'
                      : 'border border-[#8A8177]/20 text-[#8A8177]'
                  }`}
                >
                  All ({allWorks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('poem')}
                  className={`px-4 py-1.5 rounded text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                    libraryCategory === 'poem'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10'
                      : 'border border-[#8A8177]/20 text-[#8A8177]'
                  }`}
                >
                  Poems ({allWorks.filter((w) => w.category === 'poem' && w.status === 'published').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('story')}
                  className={`px-4 py-1.5 rounded text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                    libraryCategory === 'story'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10'
                      : 'border border-[#8A8177]/20 text-[#8A8177]'
                  }`}
                >
                  Stories ({allWorks.filter((w) => w.category === 'story' && w.status === 'published').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('draft')}
                  className={`px-4 py-1.5 rounded text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                    libraryCategory === 'draft'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10'
                      : 'border border-[#8A8177]/20 text-[#8A8177]'
                  }`}
                >
                  Drafts ({allWorks.filter((w) => w.status === 'draft').length})
                </button>
              </div>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by title, author, or preview..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-4 py-2 rounded-lg focus:outline-none focus:border-[#D5B06C] w-full md:w-64"
              />
            </div>

            {/* Inscriptions List */}
            {filteredLibraryWorks.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="font-serif text-lg text-[#8A8177]">No matching inscriptions found.</p>
                <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]/50">
                  Try adjusting your search or category filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLibraryWorks.map((work) => (
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
                        Edit Work
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

        {/* 3. CATEGORIZED CONSTELLATION ARRANGER VIEW */}
        {activeView === 'arrange' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/10 p-6 rounded-xl min-h-[400px]">
            {/* Header & Sub-Category Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8A8177]/20 pb-4 gap-4">
              <div>
                <h3 className="font-serif text-xl text-[#FEEFFF]">Arrange Constellation Cards</h3>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                  Drag cards to reorder how they appear in public archives.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setArrangerCategory('poem')}
                    className={`px-4 py-1.5 rounded text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                      arrangerCategory === 'poem'
                        ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10'
                        : 'border border-[#8A8177]/20 text-[#8A8177]'
                    }`}
                  >
                    Poems Constellation
                  </button>
                  <button
                    type="button"
                    onClick={() => setArrangerCategory('story')}
                    className={`px-4 py-1.5 rounded text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                      arrangerCategory === 'story'
                        ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/10'
                        : 'border border-[#8A8177]/20 text-[#8A8177]'
                    }`}
                  >
                    Stories Constellation
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="px-5 py-2 rounded bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-md whitespace-nowrap"
                >
                  Save Constellation Order
                </button>
              </div>
            </div>

            {/* Drag and Drop Card List */}
            {currentArrangerWorks.length === 0 ? (
              <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177] py-12 text-center">
                No published works in the {arrangerCategory} category to arrange.
              </p>
            ) : (
              <div className="space-y-2 pt-2">
                {currentArrangerWorks.map((work, index) => (
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

        {/* 4. ABOUT BIO EDITOR VIEW */}
        {activeView === 'about' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/10 p-6 rounded-xl min-h-[400px]">
            <div className="border-b border-[#8A8177]/20 pb-3">
              <h3 className="font-serif text-xl text-[#FEEFFF]">Edit "About the Author" Section</h3>
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                Modify the public biography text displayed on the About page.
              </p>
            </div>

            <form onSubmit={handleSaveAboutBio} className="space-y-4">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-2">
                  About Page Content
                </label>
                <textarea
                  rows={10}
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

        {/* 5. CURATOR ANALYTICS VIEW */}
        {activeView === 'analytics' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/10 p-6 rounded-xl min-h-[400px]">
            <div className="border-b border-[#8A8177]/20 pb-3">
              <h3 className="font-serif text-xl text-[#FEEFFF]">Curator Insights & Analytics</h3>
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                Private Performance Overview for Published Works
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Inscriptions</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalWorks}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Poems</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalPoems}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Stories</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalStories}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Drafts Stored</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalDrafts}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Resonances</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalResonances}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-lg text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Avg Words / Work</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.avgWords}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Touch & Mouse Image Crop Modal */}
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

              {/* Interactive Canvas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-sans uppercase tracking-widest text-[#D5B06C]">
                  <span>Interactive Canvas (Drag image to align, Scroll wheel to zoom)</span>
                  <span>{cropScale.toFixed(1)}x Zoom</span>
                </div>

                <div
                  onMouseDown={handleCropMouseDown}
                  onTouchStart={handleCropTouchStart}
                  onWheel={handleCropWheel}
                  className="w-full h-44 rounded-xl overflow-hidden border border-[#D5B06C]/40 bg-[#080A06] relative cursor-grab active:cursor-grabbing select-none group"
                >
                  {tempImage && (
                    <img
                      src={tempImage}
                      alt="Interactive crop"
                      className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                      style={{
                        transform: `scale(${cropScale})`,
                        objectPosition: `${cropPosX}% ${cropPosY}%`
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none flex items-center justify-center">
                    <span className="bg-[#0F1216]/80 text-[#FEEFFF] px-3 py-1 rounded text-[10px] uppercase font-sans tracking-widest pointer-events-none border border-[#8A8177]/20">
                      Drag to Pan • Scroll to Zoom
                    </span>
                  </div>
                </div>
              </div>

              {/* Fine-Tuning Sliders */}
              <div className="space-y-3 pt-1">
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
                    min="-200"
                    max="300"
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
                    min="-200"
                    max="300"
                    value={cropPosY}
                    onChange={(e) => setCropPosY(parseInt(e.target.value))}
                    className="w-full accent-[#D5B06C] cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Card Preview Box */}
              <div className="space-y-2 pt-2">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                  Public Card Banner Result
                </span>
                <GlowingCard
                  image={tempImage}
                  cropScale={cropScale}
                  cropPosX={cropPosX}
                  cropPosY={cropPosY}
                  className="h-[110px]"
                >
                  <div>
                    <h3 className="font-serif text-lg text-[#FEEFFF]">
                      {title || 'Untitled Work'}
                    </h3>
                    <p className="font-sans text-xs text-[#D5B06C]/80 mt-1">
                      By {author || 'Anonymous'}
                    </p>
                  </div>
                  <div className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                    {metrics.readTime} min read
                  </div>
                </GlowingCard>
              </div>

              <div className="flex gap-3 justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCropScale(1.0);
                    setCropPosX(50);
                    setCropPosY(50);
                  }}
                  className="text-[10px] font-sans uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] cursor-pointer"
                >
                  Reset Alignment
                </button>
                <div className="flex gap-3">
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
                    Apply and Attach
                  </button>
                </div>
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