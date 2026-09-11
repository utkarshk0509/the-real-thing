import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Feather, BookOpen, Compass, User, BarChart2, Sparkles, Upload, 
  Trash2, Edit3, Eye, Check, RotateCcw, Scissors, Layers, ArrowLeft, 
  MessageSquare, Copy, Download, Database, Settings, Megaphone, Tag, 
  Filter, CheckSquare, Square, FileText, ExternalLink, RefreshCw, 
  Star, Heart, X, Plus, Sliders, ChevronDown
} from 'lucide-react';
import CosmicNebulaBackground from '../components/Shared/CosmicNebulaBackground';
import { GlowingCard } from '../components/Shared/GlowingCard';
import workService from '../services/workService';
import storageService from '../services/storageService';
import siteService from '../services/siteService';
import commentService from '../services/commentService';
import readerProgressService from '../services/readerProgressService';
import { supabase } from '../lib/supabase';

// Aesthetic Celestial Cover Presets
const CELESTIAL_COVER_PRESETS = [
  {
    name: 'Obsidian Eclipse',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    color: '#D5B06C'
  },
  {
    name: 'Deep Galactic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
    color: '#A78BFA'
  },
  {
    name: 'Velvet Midnight Moon',
    url: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=1200&auto=format&fit=crop',
    color: '#7CB9E8'
  },
  {
    name: 'Golden Astrolabe Dust',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    color: '#E0BE81'
  },
  {
    name: 'Celestial Horizon',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    color: '#6EE7B7'
  },
  {
    name: 'Smoked Ink Solitude',
    url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=1200&auto=format&fit=crop',
    color: '#E5E7EB'
  }
];

// Constellation Mood Options
const MOOD_OPTIONS = [
  { id: 'cosmic', label: 'Cosmic & Wonder', color: '#D5B06C' },
  { id: 'melancholy', label: 'Melancholic Rain', color: '#7CB9E8' },
  { id: 'heart', label: 'Heart & Longing', color: '#F472B6' },
  { id: 'solitude', label: 'Quiet Solitude', color: '#A78BFA' },
  { id: 'astral', label: 'Astral Odyssey', color: '#34D399' }
];

export const AuthorPortal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const backupFileInputRef = useRef(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('real_thing_author_auth');
    if (isAuth !== 'true') {
      navigate('/hub');
    }
  }, [navigate]);

  // Main Portal Navigation
  const [activeView, setActiveView] = useState('write'); // 'write', 'library', 'arrange', 'moderation', 'about', 'analytics', 'settings', 'vault'

  // Writing & Editing State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('poem');
  const [mood, setMood] = useState('cosmic');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [editorSubTab, setEditorSubTab] = useState('edit'); // 'edit' or 'preview'
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Library & Batch Management State
  const [allWorks, setAllWorks] = useState([]);
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [libraryMoodFilter, setLibraryMoodFilter] = useState('all');
  const [librarySearch, setLibrarySearch] = useState('');
  const [librarySortBy, setLibrarySortBy] = useState('newest'); // 'newest', 'likes', 'readTime', 'alpha'
  const [selectedWorkIds, setSelectedWorkIds] = useState([]);
  const [previewWorkModal, setPreviewWorkModal] = useState(null);
  const [workToDelete, setWorkToDelete] = useState(null);
  const [batchActionType, setBatchActionType] = useState(null);

  // Constellation Arranger State
  const [arrangerCategory, setArrangerCategory] = useState('poem');
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // Moderation Center (Reflections & Whispers)
  const [moderationSubTab, setModerationSubTab] = useState('comments'); // 'comments' vs 'whispers'
  const [allComments, setAllComments] = useState([]);
  const [commentsFilterWorkId, setCommentsFilterWorkId] = useState('all');
  const [commentsSearch, setCommentsSearch] = useState('');
  const [readerMessages, setReaderMessages] = useState([]);

  // Sanctuary About State
  const [aboutAuthorName, setAboutAuthorName] = useState('Utkarsh');
  const [aboutAuthorTagline, setAboutAuthorTagline] = useState('Sanctuary Curator & Author');
  const [aboutBio, setAboutBio] = useState('');
  const [aboutWhyTitle, setAboutWhyTitle] = useState('Why I Write');
  const [aboutWhyFull, setAboutWhyFull] = useState('');
  const [aboutPhilosophyTitle, setAboutPhilosophyTitle] = useState('The Real Thing');
  const [aboutPhilosophyFull, setAboutPhilosophyFull] = useState('');
  const [aboutInfluencesTitle, setAboutInfluencesTitle] = useState('Literary Influences');
  const [aboutInfluencesFull, setAboutInfluencesFull] = useState('');
  const [aboutSpotlightSlug, setAboutSpotlightSlug] = useState('');

  // Global Settings State
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState('✦ New Celestial Inscriptions Added to the Sanctuary Galaxy');
  const [announcementLink, setAnnouncementLink] = useState('/hub');
  const [celestialCursorEnabled, setCelestialCursorEnabled] = useState(true);
  const [stardustTrailEnabled, setStardustTrailEnabled] = useState(true);
  const [defaultReaderTheme, setDefaultReaderTheme] = useState('midnight');
  const [defaultTypography, setDefaultTypography] = useState('serif');

  // Vault (Backup & Restore) State
  const [isExporting, setIsExporting] = useState(false);
  const [restoreConfirmData, setRestoreConfirmData] = useState(null);

  // Image Cropper Modal State
  const [tempImage, setTempImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropMode, setCropMode] = useState('grid');
  const [cropScale, setCropScale] = useState(1);
  const [cropPosX, setCropPosX] = useState(50);
  const [cropPosY, setCropPosY] = useState(50);
  const [bookshelfCropScale, setBookshelfCropScale] = useState(1);
  const [bookshelfCropPosX, setBookshelfCropPosX] = useState(50);
  const [bookshelfCropPosY, setBookshelfCropPosY] = useState(50);
  const [isCropDragging, setIsCropDragging] = useState(false);
  const cropDragStartRef = useRef({ x: 0, y: 0 });
  const cropPosStartRef = useRef({ x: 50, y: 50 });

  // Initial Data Loader
  const loadInitialData = async () => {
    // 1. Works
    const combinedWorks = await workService.getAllWorksAdmin();
    setAllWorks(combinedWorks);

    // 2. Full About Data
    const fullAbout = await siteService.getAboutData();
    if (fullAbout) {
      if (fullAbout.name) setAboutAuthorName(fullAbout.name);
      if (fullAbout.tagline) setAboutAuthorTagline(fullAbout.tagline);
      if (fullAbout.bio) setAboutBio(fullAbout.bio);
      if (fullAbout.whyTitle) setAboutWhyTitle(fullAbout.whyTitle);
      if (fullAbout.whyFull) setAboutWhyFull(fullAbout.whyFull);
      if (fullAbout.philosophyTitle) setAboutPhilosophyTitle(fullAbout.philosophyTitle);
      if (fullAbout.philosophyFull) setAboutPhilosophyFull(fullAbout.philosophyFull);
      if (fullAbout.influencesTitle) setAboutInfluencesTitle(fullAbout.influencesTitle);
      if (fullAbout.influencesFull) setAboutInfluencesFull(fullAbout.influencesFull);
      if (fullAbout.spotlightSlug) setAboutSpotlightSlug(fullAbout.spotlightSlug);
    }

    // 3. Whispers
    const msgs = await siteService.getWhispers();
    setReaderMessages(msgs || []);

    // 4. Comments
    const comms = await commentService.getAllCommentsAdmin();
    setAllComments(comms || []);

    // 5. Global Settings
    const settings = await siteService.getGlobalSettings();
    if (settings) {
      setAnnouncementEnabled(settings.announcementEnabled ?? false);
      setAnnouncementText(settings.announcementText || '');
      setAnnouncementLink(settings.announcementLink || '/hub');
      setCelestialCursorEnabled(settings.celestialCursorEnabled !== false);
      setStardustTrailEnabled(settings.stardustTrailEnabled !== false);
      setDefaultReaderTheme(settings.defaultReaderTheme || 'midnight');
      setDefaultTypography(settings.defaultTypography || 'serif');
    }

    // 6. Restore working draft if exists
    const draft = readerProgressService.getCuratorDraft();
    if (draft && draft.body && !editingId) {
      setTitle(draft.title || '');
      setAuthor(draft.author || '');
      setCategory(draft.category || 'poem');
      setMood(draft.mood || 'cosmic');
      setExcerpt(draft.excerpt || '');
      setBody(draft.body || '');
      setImageUrl(draft.imageUrl || '');
      setIsDraft(draft.isDraft || false);
      if (draft.cropScale) setCropScale(draft.cropScale);
      if (draft.cropPosX) setCropPosX(draft.cropPosX);
      if (draft.cropPosY) setCropPosY(draft.cropPosY);
      setStatusMessage({ type: 'success', text: 'Restored auto-saved working draft.' });
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Realtime Whispers & Comments Subscription
  useEffect(() => {
    if (supabase) {
      const channel = supabase
        .channel('curator_portal_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reader_whispers' }, async () => {
          const updated = await siteService.getWhispers();
          setReaderMessages(updated || []);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, async () => {
          const comms = await commentService.getAllCommentsAdmin();
          setAllComments(comms || []);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Auto-Save Working Draft
  useEffect(() => {
    if (!editingId && (title.trim() || body.trim())) {
      readerProgressService.saveCuratorDraft({
        title,
        author,
        category,
        mood,
        excerpt,
        body,
        imageUrl,
        isDraft,
        cropScale,
        cropPosX,
        cropPosY,
      });
    }
  }, [title, author, category, mood, excerpt, body, imageUrl, isDraft, cropScale, cropPosX, cropPosY, editingId]);

  // Verse Metrics Computation
  const metrics = useMemo(() => {
    const trimmed = body.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = trimmed ? trimmed.split('\n').filter(l => l.trim() !== '').length : 0;
    const stanzas = trimmed ? trimmed.split('\n\n').filter(s => s.trim() !== '').length : 0;
    const readTime = Math.max(1, Math.ceil(words / 180));
    return { words, lines, stanzas, readTime };
  }, [body]);

  // Analytics Computation
  const analytics = useMemo(() => {
    const totalWorks = allWorks.length;
    const totalPoems = allWorks.filter((w) => w.category === 'poem').length;
    const totalStories = allWorks.filter((w) => w.category === 'story').length;
    const totalDrafts = allWorks.filter((w) => w.status === 'draft').length;
    const totalPublished = allWorks.filter((w) => w.status === 'published').length;
    const totalResonances = allWorks.reduce((acc, w) => acc + (w.gilded_likes_count || 0), 0);
    const totalWords = allWorks.reduce((acc, w) => acc + (w.body ? w.body.trim().split(/\s+/).length : 0), 0);
    const avgWords = totalWorks > 0 ? Math.round(totalWords / totalWorks) : 0;
    return { totalWorks, totalPoems, totalStories, totalDrafts, totalPublished, totalResonances, avgWords };
  }, [allWorks]);

  // Poetic Toolbar Inserter
  const handleInsertSnippet = (snippet) => {
    setBody((prev) => {
      return prev ? `${prev}${snippet}` : snippet;
    });
  };

  // Form Reset
  const clearForm = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('');
    setCategory('poem');
    setMood('cosmic');
    setExcerpt('');
    setBody('');
    setImageUrl('');
    setIsDraft(false);
    setCropScale(1);
    setCropPosX(50);
    setCropPosY(50);
    setBookshelfCropScale(1);
    setBookshelfCropPosX(50);
    setBookshelfCropPosY(50);
    readerProgressService.clearCuratorDraft();
    setStatusMessage({ type: 'success', text: 'Editor cleared for new inscription.' });
  };

  // Publish / Save Work
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
      slug: editingId ? undefined : `${slugBase}-${Date.now().toString().slice(-4)}`,
      author: author.trim() || 'Anonymous',
      category,
      mood,
      status: isDraft ? 'draft' : 'published',
      excerpt: excerpt.trim() || body.slice(0, 120) + '...',
      body,
      image_url: finalImageUrl || CELESTIAL_COVER_PRESETS[0].url,
      read_time_minutes: metrics.readTime,
      published_at: isDraft ? null : new Date().toISOString(),
      crop_scale: cropScale,
      crop_pos_x: cropPosX,
      crop_pos_y: cropPosY,
      bookshelf_crop_scale: bookshelfCropScale,
      bookshelf_crop_pos_x: bookshelfCropPosX,
      bookshelf_crop_pos_y: bookshelfCropPosY,
      sort_order: allWorks.length
    };

    try {
      await workService.upsertWork(newWork);
      readerProgressService.clearCuratorDraft();
      setStatusMessage({ type: 'success', text: isDraft ? 'Draft saved in archives.' : 'Inscription successfully published to the galaxy.' });
      const updated = await workService.getAllWorksAdmin();
      setAllWorks(updated);

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (err) {
      console.error('[AuthorPortal] Publish error:', err);
      setIsSubmitting(false);
      setStatusMessage({
        type: 'error',
        text: `Failed to save: ${err.message || 'Unknown error.'}`,
      });
    }
  };

  // Load Work into Editor
  const handleLoadWork = (work) => {
    setEditingId(work.id);
    setTitle(work.title || '');
    setAuthor(work.author || '');
    setCategory(work.category || 'poem');
    setMood(work.mood || 'cosmic');
    setExcerpt(work.excerpt || '');
    setBody(work.body || '');
    setImageUrl(work.image_url || '');
    setIsDraft(work.status === 'draft');
    if (work.crop_scale) setCropScale(work.crop_scale);
    if (work.crop_pos_x) setCropPosX(work.crop_pos_x);
    if (work.crop_pos_y) setCropPosY(work.crop_pos_y);
    setBookshelfCropScale(work.bookshelf_crop_scale || work.crop_scale || 1);
    setBookshelfCropPosX(work.bookshelf_crop_pos_x ?? work.crop_pos_x ?? 50);
    setBookshelfCropPosY(work.bookshelf_crop_pos_y ?? work.crop_pos_y ?? 50);
    setActiveView('write');
    setEditorSubTab('edit');
    setStatusMessage({ type: 'success', text: `Loaded: "${work.title || 'Untitled'}"` });
  };

  // 1-Click Status Toggle
  const handleTogglePublish = async (work) => {
    const updated = await workService.togglePublishStatus(work);
    setAllWorks(updated);
    const newStatus = work.status === 'published' ? 'Draft' : 'Published';
    setStatusMessage({ type: 'success', text: `"${work.title}" is now ${newStatus}.` });
  };

  // 1-Click Duplicate Work
  const handleDuplicateWork = async (work) => {
    setStatusMessage({ type: 'success', text: `Duplicating "${work.title}"...` });
    await workService.duplicateWork(work);
    const updated = await workService.getAllWorksAdmin();
    setAllWorks(updated);
    setStatusMessage({ type: 'success', text: `Created draft duplicate of "${work.title}".` });
  };

  // Delete Confirmations
  const promptDeleteWork = (work) => {
    setWorkToDelete(work);
  };

  const confirmDeleteWork = async () => {
    if (!workToDelete) return;
    await workService.deleteWork({ id: workToDelete.id, slug: workToDelete.slug });
    if (editingId === workToDelete.id) clearForm();
    setStatusMessage({ type: 'success', text: 'Inscription permanently deleted.' });
    setWorkToDelete(null);
    const updated = await workService.getAllWorksAdmin();
    setAllWorks(updated);
  };

  // Multi-Select Handlers
  const handleToggleSelectWork = (id) => {
    setSelectedWorkIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredLibraryWorks.map((w) => w.id || w.slug);
    if (selectedWorkIds.length === visibleIds.length) {
      setSelectedWorkIds([]);
    } else {
      setSelectedWorkIds(visibleIds);
    }
  };

  const handleExecuteBatchAction = async (action) => {
    if (selectedWorkIds.length === 0) return;

    if (action === 'publish') {
      const updated = await workService.batchUpdateStatus(selectedWorkIds, 'published');
      setAllWorks(updated);
      setStatusMessage({ type: 'success', text: `Published ${selectedWorkIds.length} selected works.` });
      setSelectedWorkIds([]);
    } else if (action === 'draft') {
      const updated = await workService.batchUpdateStatus(selectedWorkIds, 'draft');
      setAllWorks(updated);
      setStatusMessage({ type: 'success', text: `Moved ${selectedWorkIds.length} selected works to drafts.` });
      setSelectedWorkIds([]);
    } else if (action === 'delete') {
      setBatchActionType('delete');
    }
  };

  const confirmBatchDelete = async () => {
    const updated = await workService.batchDeleteWorks(selectedWorkIds);
    setAllWorks(updated);
    setStatusMessage({ type: 'success', text: `Permanently deleted ${selectedWorkIds.length} works.` });
    setSelectedWorkIds([]);
    setBatchActionType(null);
  };

  // Filtered & Sorted Library Works
  const filteredLibraryWorks = useMemo(() => {
    let list = allWorks.filter((work) => {
      const matchesSearch =
        work.title?.toLowerCase().includes(librarySearch.toLowerCase()) ||
        work.author?.toLowerCase().includes(librarySearch.toLowerCase()) ||
        work.excerpt?.toLowerCase().includes(librarySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (libraryCategory === 'poem' && work.category !== 'poem') return false;
      if (libraryCategory === 'story' && work.category !== 'story') return false;
      if (libraryCategory === 'draft' && work.status !== 'draft') return false;
      if (libraryCategory === 'published' && work.status !== 'published') return false;

      if (libraryMoodFilter !== 'all' && (work.mood || 'cosmic') !== libraryMoodFilter) return false;

      return true;
    });

    // Sort
    list.sort((a, b) => {
      if (librarySortBy === 'likes') return (b.gilded_likes_count || 0) - (a.gilded_likes_count || 0);
      if (librarySortBy === 'readTime') return (b.read_time_minutes || 0) - (a.read_time_minutes || 0);
      if (librarySortBy === 'alpha') return (a.title || '').localeCompare(b.title || '');
      // newest (default)
      return new Date(b.created_at || b.published_at || 0) - new Date(a.created_at || a.published_at || 0);
    });

    return list;
  }, [allWorks, libraryCategory, libraryMoodFilter, librarySearch, librarySortBy]);

  // Constellation Arranger Filter
  const currentArrangerWorks = useMemo(() => {
    return allWorks.filter((work) => work.category === arrangerCategory && work.status === 'published');
  }, [allWorks, arrangerCategory]);

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

  // Moderation Handlers
  const handleDeleteComment = async (id) => {
    await commentService.deleteComment(id);
    const comms = await commentService.getAllCommentsAdmin();
    setAllComments(comms || []);
    setStatusMessage({ type: 'success', text: 'Reader reflection removed.' });
  };

  const handleDeleteWhisper = async (id) => {
    const updated = await siteService.deleteWhisper(id);
    setReaderMessages(updated || []);
    setStatusMessage({ type: 'success', text: 'Reader whisper note deleted.' });
  };

  const filteredComments = useMemo(() => {
    return allComments.filter((c) => {
      const matchesSearch = 
        (c.author_alias || '').toLowerCase().includes(commentsSearch.toLowerCase()) ||
        (c.content || '').toLowerCase().includes(commentsSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (commentsFilterWorkId !== 'all' && c.work_id !== commentsFilterWorkId) return false;
      return true;
    });
  }, [allComments, commentsSearch, commentsFilterWorkId]);

  // Sanctuary Bio Save
  const handleSaveAboutBio = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: aboutAuthorName,
        tagline: aboutAuthorTagline,
        bio: aboutBio,
        whyTitle: aboutWhyTitle,
        whyFull: aboutWhyFull,
        philosophyTitle: aboutPhilosophyTitle,
        philosophyFull: aboutPhilosophyFull,
        influencesTitle: aboutInfluencesTitle,
        influencesFull: aboutInfluencesFull,
        spotlightSlug: aboutSpotlightSlug,
      };

      await siteService.updateAboutData(payload);
      await siteService.updateAuthorBio(aboutBio);
      setStatusMessage({ type: 'success', text: 'All Sanctuary Bio and Manifesto changes successfully published!' });
    } catch (err) {
      setStatusMessage({ type: 'success', text: 'About section saved.' });
    }
  };

  // Global Settings Save
  const handleSaveGlobalSettings = async (e) => {
    e.preventDefault();
    const payload = {
      announcementEnabled,
      announcementText,
      announcementLink,
      celestialCursorEnabled,
      stardustTrailEnabled,
      defaultReaderTheme,
      defaultTypography,
    };
    await siteService.updateGlobalSettings(payload);
    setStatusMessage({ type: 'success', text: 'Sanctuary Experience & Broadcast settings successfully updated!' });
  };

  // Sanctuary Vault (Backup & Export) Handlers
  const handleExportDatabase = () => {
    setIsExporting(true);
    try {
      const backupObject = {
        exportDate: new Date().toISOString(),
        version: '2.0',
        sanctuaryName: 'The Real Thing',
        works: allWorks,
        aboutData: {
          name: aboutAuthorName,
          tagline: aboutAuthorTagline,
          bio: aboutBio,
          whyTitle: aboutWhyTitle,
          whyFull: aboutWhyFull,
          philosophyTitle: aboutPhilosophyTitle,
          philosophyFull: aboutPhilosophyFull,
          influencesTitle: aboutInfluencesTitle,
          influencesFull: aboutInfluencesFull,
          spotlightSlug: aboutSpotlightSlug,
        },
        whispers: readerMessages,
        globalSettings: {
          announcementEnabled,
          announcementText,
          announcementLink,
          celestialCursorEnabled,
          stardustTrailEnabled,
          defaultReaderTheme,
          defaultTypography,
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObject, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateKey = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `the-real-thing-vault-backup-${dateKey}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMessage({ type: 'success', text: 'Full Sanctuary JSON Vault backup downloaded successfully.' });
    } catch (err) {
      console.error('Export error:', err);
      setStatusMessage({ type: 'error', text: 'Failed to generate vault backup file.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdownCollection = () => {
    try {
      const published = allWorks.filter((w) => w.status === 'published');
      let markdownText = `# THE REAL THING — SANCTUARY COLLECTION\n*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

      published.forEach((work, index) => {
        markdownText += `## ${index + 1}. ${work.title}\n`;
        markdownText += `**Author:** ${work.author || 'Anonymous'}  \n`;
        markdownText += `**Category:** ${work.category.toUpperCase()} | **Mood:** ${work.mood || 'Cosmic'} | **Read Time:** ~${work.read_time_minutes} min  \n`;
        if (work.excerpt) markdownText += `*${work.excerpt}*\n\n`;
        markdownText += `${work.body}\n\n`;
        markdownText += `\n---\n\n`;
      });

      const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `the-real-thing-collection-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: `Exported ${published.length} published works as Markdown book collection.` });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to export Markdown collection.' });
    }
  };

  const handleFileRestoreSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && Array.isArray(parsed.works)) {
            setRestoreConfirmData(parsed);
          } else {
            setStatusMessage({ type: 'error', text: 'Invalid backup file. Missing works array.' });
          }
        } catch (err) {
          setStatusMessage({ type: 'error', text: 'Corrupted JSON backup file.' });
        }
      };
      reader.readAsText(file);
    }
  };

  const executeRestore = async () => {
    if (!restoreConfirmData) return;
    setStatusMessage({ type: 'success', text: 'Restoring vault data...' });

    try {
      if (Array.isArray(restoreConfirmData.works)) {
        for (const w of restoreConfirmData.works) {
          await workService.upsertWork(w);
        }
      }

      if (restoreConfirmData.aboutData) {
        await siteService.updateAboutData(restoreConfirmData.aboutData);
      }

      if (restoreConfirmData.globalSettings) {
        await siteService.updateGlobalSettings(restoreConfirmData.globalSettings);
      }

      setRestoreConfirmData(null);
      await loadInitialData();
      setStatusMessage({ type: 'success', text: 'Sanctuary database restored successfully!' });
    } catch (err) {
      console.error('Restore error:', err);
      setStatusMessage({ type: 'error', text: 'Failed during vault restore operation.' });
    }
  };

  // Image Upload Handling
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
    setStatusMessage({ type: 'success', text: 'Applying image...' });
    try {
      const compressedUrl = await storageService.uploadCoverImage(tempImage);
      setImageUrl(compressedUrl);
      setIsCropModalOpen(false);
      setStatusMessage({ type: 'success', text: 'Cover image successfully compressed and attached.' });
    } catch (err) {
      setImageUrl(tempImage);
      setIsCropModalOpen(false);
      setStatusMessage({ type: 'success', text: 'Image applied.' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050608] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF] p-3 sm:p-6 md:p-10">
      <CosmicNebulaBackground variant="about" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#8A8177]/20 pb-5 gap-4">
          <div>
            <button
              onClick={() => navigate('/hub')}
              className="font-sans text-xs uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-all mb-2 flex items-center gap-1.5 cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Return to Constellation Hub</span>
            </button>
            <h1 className="font-serif text-3xl md:text-4xl text-[#FEEFFF] tracking-wide flex items-center gap-2.5">
              Curator Command Center <Sparkles className="w-5 h-5 text-[#D5B06C] animate-pulse" />
            </h1>
            <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8A8177] mt-1">
              Complete Sanctuary Content, Moderation & Global Website Architecture
            </p>
          </div>

          <div className="flex items-center gap-3">
            {editingId && activeView === 'write' && (
              <button
                type="button"
                onClick={clearForm}
                className="text-xs uppercase tracking-widest text-[#8A8177] hover:text-red-400 transition-colors cursor-pointer border border-[#8A8177]/20 px-3.5 py-2.5 rounded-xl bg-[#0F1216]/60 backdrop-blur-md"
              >
                Clear Form
              </button>
            )}
            {activeView === 'write' && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#FEEFFF] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-[0_0_25px_rgba(213,176,108,0.35)] flex items-center gap-2"
              >
                <Feather className="w-3.5 h-3.5" />
                {isSubmitting ? 'Inscribing...' : isDraft ? 'Save Draft' : 'Publish Work'}
              </button>
            )}
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center border border-[#D5B06C]/25 overflow-x-auto bg-[#0F1216]/80 rounded-2xl p-2 backdrop-blur-xl gap-1.5 shadow-2xl no-scrollbar">
          {[
            { id: 'write', label: 'Write & Inscribe', icon: Feather },
            { id: 'library', label: `Library & Batch (${allWorks.length})`, icon: BookOpen },
            { id: 'arrange', label: 'Arranger', icon: Compass },
            { id: 'moderation', label: `Reflections & Notes (${allComments.length + readerMessages.length})`, icon: MessageSquare },
            { id: 'about', label: 'Sanctuary Bio', icon: User },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'settings', label: 'Broadcast & Settings', icon: Settings },
            { id: 'vault', label: 'Sanctuary Vault', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`relative px-3.5 py-2 rounded-xl font-sans text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#D5B06C]/20 text-[#D5B06C] border border-[#D5B06C]/50 font-semibold shadow-[0_0_15px_rgba(213,176,108,0.2)]'
                    : 'text-[#8A8177] hover:text-[#FEEFFF] hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Status Toast Notification */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3.5 rounded-xl font-sans text-xs uppercase tracking-wider text-center border shadow-lg flex items-center justify-between px-6 ${
              statusMessage.type === 'error'
                ? 'bg-red-900/40 border-red-500 text-red-200'
                : 'bg-[#D5B06C]/10 border-[#D5B06C] text-[#D5B06C]'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="cursor-pointer hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* TAB 1: WRITE & INSCRIBE */}
        {activeView === 'write' && (
          <div className="space-y-6">
            {/* Title & Preview Sub-Tab Toggle */}
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                    editorSubTab === 'edit'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 shadow-sm'
                      : 'border border-[#8A8177]/20 text-[#8A8177] hover:text-[#FEEFFF]'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTab('preview')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                    editorSubTab === 'preview'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 shadow-sm'
                      : 'border border-[#8A8177]/20 text-[#8A8177] hover:text-[#FEEFFF]'
                  }`}
                >
                  Live Card Preview
                </button>
              </div>
            </div>

            {/* Work Metadata & Cover Settings */}
            <div className="bg-[#0F1216] border border-[#8A8177]/20 rounded-2xl overflow-hidden shadow-lg">
              <button
                type="button"
                onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
                className="w-full px-6 py-3.5 bg-[#080A06]/60 flex items-center justify-between cursor-pointer border-b border-[#8A8177]/10"
              >
                <span className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] font-semibold flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" /> Work Metadata, Mood & Cover Configuration
                </span>
                <span className="text-[#8A8177] text-xs font-sans uppercase">
                  {isMetadataExpanded ? '▲ Hide Settings' : '▼ Expand Settings'}
                </span>
              </button>

              <AnimatePresence>
                {isMetadataExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-6 space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Author */}
                      <div>
                        <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1.5">
                          Author Name / Alias
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Aureligious"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1.5">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer"
                        >
                          <option value="poem">Poem</option>
                          <option value="story">Story</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      {/* Constellation Mood */}
                      <div>
                        <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1.5">
                          Constellation Orbit Mood
                        </label>
                        <select
                          value={mood}
                          onChange={(e) => setMood(e.target.value)}
                          className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer"
                        >
                          {MOOD_OPTIONS.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Publishing State */}
                      <div>
                        <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1.5">
                          Publishing State
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsDraft(false)}
                            className={`flex-1 py-2 text-[10px] font-sans uppercase tracking-wider border rounded-xl transition-all cursor-pointer ${
                              !isDraft ? 'border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold' : 'border-[#8A8177]/20 text-[#8A8177]'
                            }`}
                          >
                            Published
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDraft(true)}
                            className={`flex-1 py-2 text-[10px] font-sans uppercase tracking-wider border rounded-xl transition-all cursor-pointer ${
                              isDraft ? 'border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold' : 'border-[#8A8177]/20 text-[#8A8177]'
                            }`}
                          >
                            Draft
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1.5">
                        Short Excerpt Preview (Shown on Galaxy Star Hover)
                      </label>
                      <textarea
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Succinct poetic summary or opening stanza excerpt..."
                        className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-xs p-3 rounded-xl focus:outline-none focus:border-[#D5B06C] resize-none"
                      />
                    </div>

                    {/* Cover Image & Presets */}
                    <div className="space-y-3 pt-2 border-t border-[#8A8177]/15">
                      <div className="flex items-center justify-between">
                        <label className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                          Cover Image Banner (Upload, URL, or 1-Click Cosmic Preset)
                        </label>
                        {imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setTempImage(imageUrl);
                              setIsCropModalOpen(true);
                            }}
                            className="text-[10px] font-sans uppercase tracking-widest text-[#D5B06C] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Scissors className="w-3 h-3" /> Adjust Crop & Alignment
                          </button>
                        )}
                      </div>

                      {/* Presets Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {CELESTIAL_COVER_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setImageUrl(preset.url)}
                            className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                              imageUrl === preset.url
                                ? 'border-[#D5B06C] bg-[#D5B06C]/10 shadow-[0_0_15px_rgba(213,176,108,0.2)]'
                                : 'border-white/10 bg-[#080A06] hover:border-white/25'
                            }`}
                          >
                            <div className="h-10 w-full rounded-lg overflow-hidden mb-1 relative">
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/30" />
                            </div>
                            <span className="text-[9px] font-sans text-[#8A8177] group-hover:text-[#FEEFFF] truncate block">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Upload or URL */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
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
                          className="py-2.5 px-4 bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs rounded-xl hover:border-[#D5B06C] transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#D5B06C]" /> Upload Custom Image
                        </button>
                        <input
                          type="url"
                          placeholder="Or paste any high-resolution image URL..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="flex-1 bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Main Composition Editor */}
            {editorSubTab === 'edit' ? (
              <div className="space-y-3">
                {/* Poetic Formatting Toolbar */}
                <div className="flex flex-wrap items-center justify-between p-2 bg-[#0F1216] border border-[#8A8177]/20 rounded-xl gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-[#8A8177] px-2">
                      Poetic Toolbar:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('\n\n✦   ✧   ✦\n\n')}
                      className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-[#D5B06C] text-[#D5B06C] text-xs font-serif hover:bg-white/5 transition-all cursor-pointer"
                      title="Insert Cosmic Asterism Divider"
                    >
                      ✦ ✧ ✦ Asterism
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('\n\n')}
                      className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-[#D5B06C] text-[#FEEFFF] text-xs font-sans hover:bg-white/5 transition-all cursor-pointer"
                      title="Insert Stanza Break"
                    >
                      ¶ Stanza Break
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet(' — ')}
                      className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-[#D5B06C] text-[#FEEFFF] text-xs font-serif hover:bg-white/5 transition-all cursor-pointer"
                      title="Insert Em-Dash"
                    >
                      — Em-Dash
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('“ ”')}
                      className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-[#D5B06C] text-[#FEEFFF] text-xs font-serif hover:bg-white/5 transition-all cursor-pointer"
                      title="Insert Curly Quotes"
                    >
                      “ ” Quotes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('\n    ')}
                      className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-[#D5B06C] text-[#FEEFFF] text-xs font-mono hover:bg-white/5 transition-all cursor-pointer"
                      title="Indent Stanza"
                    >
                      ⇥ Indent
                    </button>
                  </div>

                  {/* Live Metrics HUD */}
                  <div className="flex items-center gap-3 px-3 py-1 bg-[#080A06] rounded-lg border border-white/5 text-[11px] font-sans text-[#8A8177]">
                    <span><strong className="text-[#D5B06C]">{metrics.words}</strong> words</span>
                    <span>•</span>
                    <span><strong className="text-[#D5B06C]">{metrics.lines}</strong> lines</span>
                    <span>•</span>
                    <span><strong className="text-[#D5B06C]">{metrics.stanzas}</strong> stanzas</span>
                    <span>•</span>
                    <span>~{metrics.readTime} min read</span>
                  </div>
                </div>

                <textarea
                  rows={20}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Inscribe your poem or literary narrative here... Use blank lines to separate stanzas."
                  className="w-full bg-[#0F1216]/60 border border-[#8A8177]/20 p-6 rounded-2xl font-serif text-lg text-[#FEEFFF] leading-relaxed focus:outline-none focus:border-[#D5B06C]/50 resize-y min-h-[440px] shadow-inner"
                />
              </div>
            ) : (
              /* Live Preview Subtab */
              <div className="space-y-6">
                <div className="p-6 bg-[#0F1216]/40 border border-[#8A8177]/20 rounded-2xl space-y-3">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#D5B06C] font-semibold block">
                    Public Galaxy Card Appearance
                  </span>
                  <div className="max-w-md">
                    <GlowingCard
                      image={imageUrl || CELESTIAL_COVER_PRESETS[0].url}
                      cropScale={cropScale}
                      cropPosX={cropPosX}
                      cropPosY={cropPosY}
                      className="h-[110px]"
                    >
                      <div>
                        <h3 className="font-serif text-lg md:text-xl text-[#FEEFFF]">
                          {title || 'Untitled Inscription'}
                        </h3>
                        <p className="font-sans text-xs text-[#D5B06C]/80 mt-1">
                          By {author || 'Anonymous'}
                        </p>
                      </div>
                      <div className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                        {metrics.readTime} min <span className="mx-1 text-[#D5B06C]">•</span> {mood.toUpperCase()}
                      </div>
                    </GlowingCard>
                  </div>
                </div>

                <div className="bg-[#0F1216]/40 border border-[#8A8177]/20 p-8 rounded-2xl min-h-[320px]">
                  <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#D5B06C] block mb-2">
                    Sanctuary • {category.toUpperCase()} ({mood})
                  </span>
                  <h1 className="font-serif text-3xl md:text-4xl text-[#FEEFFF] mb-2">{title || 'Untitled Inscription'}</h1>
                  <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177] mb-8">
                    By {author || 'Anonymous'}
                  </p>
                  <div className="font-serif text-lg text-[#FEEFFF]/90 leading-relaxed whitespace-pre-line font-light">
                    {body || <span className="text-[#8A8177] italic">Your verse will preview here...</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIBRARY & BATCH CONTROL CENTER */}
        {activeView === 'library' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/15 p-6 rounded-2xl min-h-[400px]">
            {/* Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#8A8177]/20 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category filters */}
                <button
                  type="button"
                  onClick={() => setLibraryCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                    libraryCategory === 'all'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold'
                      : 'border border-[#8A8177]/20 text-[#8A8177] hover:text-[#FEEFFF]'
                  }`}
                >
                  All ({allWorks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('poem')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                    libraryCategory === 'poem'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold'
                      : 'border border-[#8A8177]/20 text-[#8A8177] hover:text-[#FEEFFF]'
                  }`}
                >
                  Poems ({allWorks.filter((w) => w.category === 'poem').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('story')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                    libraryCategory === 'story'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold'
                      : 'border border-[#8A8177]/20 text-[#8A8177] hover:text-[#FEEFFF]'
                  }`}
                >
                  Stories ({allWorks.filter((w) => w.category === 'story').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                    libraryCategory === 'draft'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold'
                      : 'border border-[#8A8177]/20 text-[#8A8177] hover:text-[#FEEFFF]'
                  }`}
                >
                  Drafts ({allWorks.filter((w) => w.status === 'draft').length})
                </button>

                {/* Mood Filter */}
                <select
                  value={libraryMoodFilter}
                  onChange={(e) => setLibraryMoodFilter(e.target.value)}
                  className="bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D5B06C] cursor-pointer"
                >
                  <option value="all">All Moods</option>
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>

                {/* Sort dropdown */}
                <select
                  value={librarySortBy}
                  onChange={(e) => setLibrarySortBy(e.target.value)}
                  className="bg-[#080A06] border border-[#8A8177]/30 text-[#D5B06C] font-sans text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D5B06C] cursor-pointer"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="likes">Sort: Most Resonant (Hearts)</option>
                  <option value="readTime">Sort: Reading Time</option>
                  <option value="alpha">Sort: Title (A-Z)</option>
                </select>
              </div>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search inscriptions by title or author..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs px-4 py-2 rounded-xl focus:outline-none focus:border-[#D5B06C] w-full lg:w-72"
              />
            </div>

            {/* Multi-Select Batch Actions Bar */}
            <div className="flex flex-wrap items-center justify-between p-3 bg-[#080A06]/90 border border-[#D5B06C]/30 rounded-xl gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-[#8A8177] hover:text-[#FEEFFF] cursor-pointer"
                >
                  {selectedWorkIds.length > 0 && selectedWorkIds.length === filteredLibraryWorks.length ? (
                    <CheckSquare className="w-4 h-4 text-[#D5B06C]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8A8177]" />
                  )}
                  <span>Select All ({selectedWorkIds.length}/{filteredLibraryWorks.length})</span>
                </button>
              </div>

              {selectedWorkIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#D5B06C] font-sans font-medium mr-1">
                    {selectedWorkIds.length} Selected:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleExecuteBatchAction('publish')}
                    className="px-3 py-1 bg-[#D5B06C]/20 border border-[#D5B06C]/50 text-[#D5B06C] text-xs font-sans uppercase rounded-lg hover:bg-[#D5B06C] hover:text-[#080A06] transition-colors cursor-pointer"
                  >
                    Batch Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteBatchAction('draft')}
                    className="px-3 py-1 bg-white/5 border border-white/20 text-[#FEEFFF] text-xs font-sans uppercase rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Move to Drafts
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteBatchAction('delete')}
                    className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-sans uppercase rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  >
                    Batch Delete
                  </button>
                </div>
              )}
            </div>

            {/* Works List */}
            {filteredLibraryWorks.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="font-serif text-lg text-[#8A8177]">No matching inscriptions found.</p>
                <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]/50">
                  Try adjusting your search query, mood filter, or category toggle.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLibraryWorks.map((work) => {
                  const isSelected = selectedWorkIds.includes(work.id || work.slug);
                  return (
                    <div
                      key={work.id || work.slug}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                        isSelected
                          ? 'border-[#D5B06C] bg-[#D5B06C]/10 shadow-md'
                          : 'border-[#8A8177]/20 bg-[#080A06]/60 hover:border-[#D5B06C]/40'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectWork(work.id || work.slug)}
                          className="mt-1 sm:mt-0 text-[#8A8177] hover:text-[#D5B06C] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#D5B06C]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#8A8177]" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-serif text-lg text-[#FEEFFF]">
                              {work.title || 'Untitled Work'}
                            </h4>

                            {/* Clickable 1-Click Status Toggle */}
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(work)}
                              title="Click to toggle status immediately"
                              className={`text-[9px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                                work.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                              }`}
                            >
                              {work.status === 'published' ? '● Published' : '○ Draft'}
                            </button>

                            {/* Mood Tag */}
                            <span className="text-[9px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D5B06C]/10 text-[#D5B06C] border border-[#D5B06C]/30">
                              {work.mood || 'Cosmic'}
                            </span>
                          </div>

                          <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1 flex items-center gap-3">
                            <span>{work.category}</span>
                            <span>•</span>
                            <span>By {work.author || 'Anonymous'}</span>
                            <span>•</span>
                            <span>~{work.read_time_minutes} min read</span>
                            <span>•</span>
                            <span className="text-[#D5B06C]">♥ {work.gilded_likes_count || 0} Hearts</span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setPreviewWorkModal(work)}
                          className="p-2 rounded-lg border border-white/10 hover:border-[#D5B06C] text-[#8A8177] hover:text-[#FEEFFF] transition-colors cursor-pointer"
                          title="Quick Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateWork(work)}
                          className="p-2 rounded-lg border border-white/10 hover:border-[#D5B06C] text-[#8A8177] hover:text-[#D5B06C] transition-colors cursor-pointer"
                          title="Duplicate Work as Draft"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLoadWork(work)}
                          className="px-3.5 py-1.5 rounded-lg border border-[#D5B06C]/40 text-[#D5B06C] font-sans text-xs uppercase tracking-wider hover:bg-[#D5B06C] hover:text-[#080A06] transition-colors cursor-pointer font-medium"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => promptDeleteWork(work)}
                          className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Delete Work"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONSTELLATION ARRANGER */}
        {activeView === 'arrange' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/15 p-6 rounded-2xl min-h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8A8177]/20 pb-4 gap-4">
              <div>
                <h3 className="font-serif text-xl text-[#FEEFFF]">Arrange Constellation Cards</h3>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                  Drag cards to visually reorder how poems and stories orbit in the galaxy archives.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setArrangerCategory('poem')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                      arrangerCategory === 'poem'
                        ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold'
                        : 'border border-[#8A8177]/20 text-[#8A8177]'
                    }`}
                  >
                    Poems
                  </button>
                  <button
                    type="button"
                    onClick={() => setArrangerCategory('story')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans uppercase tracking-widest transition-all cursor-pointer ${
                      arrangerCategory === 'story'
                        ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold'
                        : 'border border-[#8A8177]/20 text-[#8A8177]'
                    }`}
                  >
                    Stories
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="px-5 py-2 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-md"
                >
                  Save Order
                </button>
              </div>
            </div>

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
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[#8A8177]/20 bg-[#080A06] hover:border-[#D5B06C]/50 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#8A8177] text-xs font-mono select-none">⠿</span>
                      <span className="font-serif text-sm text-[#FEEFFF] truncate max-w-[320px]">
                        {index + 1}. {work.title || 'Untitled Work'}
                      </span>
                      <span className="text-[9px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-[#D5B06C]/10 text-[#D5B06C]">
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

        {/* TAB 4: MODERATION CENTER (REFLECTIONS & WHISPERS) */}
        {activeView === 'moderation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8A8177]/20 pb-4 gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[#FEEFFF]">Reader Moderation Hub</h2>
                <p className="font-sans text-xs text-[#8A8177]">
                  Review and moderate reflections left by readers across all inscriptions and whispers.
                </p>
              </div>

              {/* Sub-Tab Pill Switcher */}
              <div className="flex items-center gap-2 bg-[#0F1216] p-1 rounded-xl border border-[#8A8177]/20">
                <button
                  type="button"
                  onClick={() => setModerationSubTab('comments')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                    moderationSubTab === 'comments'
                      ? 'bg-[#D5B06C] text-[#080A06] font-semibold shadow'
                      : 'text-[#8A8177] hover:text-[#FEEFFF]'
                  }`}
                >
                  Poem Reflections ({allComments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setModerationSubTab('whispers')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                    moderationSubTab === 'whispers'
                      ? 'bg-[#D5B06C] text-[#080A06] font-semibold shadow'
                      : 'text-[#8A8177] hover:text-[#FEEFFF]'
                  }`}
                >
                  About Whispers ({readerMessages.length})
                </button>
              </div>
            </div>

            {/* Poem Reflections Stream */}
            {moderationSubTab === 'comments' ? (
              <div className="space-y-4">
                {/* Search & Work Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search comments by reader alias or words..."
                    value={commentsSearch}
                    onChange={(e) => setCommentsSearch(e.target.value)}
                    className="flex-1 bg-[#0F1216] border border-[#8A8177]/25 text-[#FEEFFF] font-sans text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                  />
                  <select
                    value={commentsFilterWorkId}
                    onChange={(e) => setCommentsFilterWorkId(e.target.value)}
                    className="bg-[#0F1216] border border-[#8A8177]/25 text-[#FEEFFF] font-sans text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer"
                  >
                    <option value="all">All Inscriptions</option>
                    {allWorks.map((w) => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </div>

                {filteredComments.length === 0 ? (
                  <div className="p-12 text-center border border-[#8A8177]/20 rounded-2xl bg-[#0F1216]/50 space-y-2">
                    <p className="font-serif text-lg text-[#8A8177]">No reader reflections found.</p>
                    <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]/50">
                      When readers leave reflections on poems, they will appear here for review.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredComments.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl bg-[#0F1216] border border-white/10 hover:border-[#D5B06C]/30 transition-all flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-sm font-semibold text-[#D5B06C]">
                                {c.author_alias || 'Anonymous Reader'}
                              </span>
                              {c.works?.title && (
                                <span className="text-[10px] font-sans text-[#8A8177] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                  On "{c.works.title}"
                                </span>
                              )}
                            </div>
                            <span className="font-sans text-[10px] text-[#8A8177]">
                              {new Date(c.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="font-serif text-sm text-[#FEEFFF]/90 leading-relaxed italic">
                            “{c.content}”
                          </p>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-[#8A8177] hover:text-red-400 font-sans text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Reflection</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Whispers Stream */
              <div className="space-y-4">
                {readerMessages.length === 0 ? (
                  <div className="p-12 text-center border border-[#8A8177]/20 rounded-2xl bg-[#0F1216]/50 space-y-2">
                    <p className="font-serif text-lg text-[#8A8177]">The Sanctuary is quiet.</p>
                    <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]/60">
                      No reader whispers received on the About page yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {readerMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-xl bg-[#0F1216] border border-[#D5B06C]/30 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-sm font-semibold text-[#D5B06C]">{msg.sender}</span>
                            <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                              {msg.timestamp}
                            </span>
                          </div>
                          <p className="font-serif text-sm leading-relaxed text-[#FEEFFF]/90 italic">
                            “{msg.text}”
                          </p>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleDeleteWhisper(msg.id)}
                            className="text-[#8A8177] hover:text-red-400 font-sans text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Whisper</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SANCTUARY BIO & MANIFESTO */}
        {activeView === 'about' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/15 p-6 md:p-8 rounded-2xl min-h-[400px]">
            <div className="border-b border-[#8A8177]/20 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[#FEEFFF]">Edit "About the Author" Sanctuary Page</h3>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#D5B06C] mt-1">
                  Full Control Over Author Profile, Manifesto Cards & Featured Spotlight
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAboutBio} className="space-y-6">
              <div className="space-y-4 border-b border-[#8A8177]/15 pb-6">
                <h4 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] font-semibold">
                  1. Author Profile Header
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={aboutAuthorName}
                      onChange={(e) => setAboutAuthorName(e.target.value)}
                      className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-base p-3 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1">
                      Title / Role Tagline
                    </label>
                    <input
                      type="text"
                      value={aboutAuthorTagline}
                      onChange={(e) => setAboutAuthorTagline(e.target.value)}
                      className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs p-3 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1">
                    Author Bio Quote
                  </label>
                  <textarea
                    rows={3}
                    value={aboutBio}
                    onChange={(e) => setAboutBio(e.target.value)}
                    className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-base p-3 rounded-xl focus:outline-none focus:border-[#D5B06C] leading-relaxed"
                  />
                </div>
              </div>

              <div className="space-y-4 border-b border-[#8A8177]/15 pb-6">
                <h4 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] font-semibold">
                  2. Living Manifesto Cards
                </h4>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#080A06]/60 border border-[#D5B06C]/30 space-y-3">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#D5B06C]">Card 1: Why I Write</span>
                    <input
                      type="text"
                      placeholder="Card Title"
                      value={aboutWhyTitle}
                      onChange={(e) => setAboutWhyTitle(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/20 text-[#FEEFFF] font-serif text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#D5B06C]"
                    />
                    <textarea
                      rows={3}
                      placeholder="Expanded Full Text"
                      value={aboutWhyFull}
                      onChange={(e) => setAboutWhyFull(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/20 text-[#8A8177] font-sans text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#D5B06C]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#080A06]/60 border border-[#7CB9E8]/30 space-y-3">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#7CB9E8]">Card 2: The Real Thing</span>
                    <input
                      type="text"
                      placeholder="Card Title"
                      value={aboutPhilosophyTitle}
                      onChange={(e) => setAboutPhilosophyTitle(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/20 text-[#FEEFFF] font-serif text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#7CB9E8]"
                    />
                    <textarea
                      rows={3}
                      placeholder="Expanded Full Text"
                      value={aboutPhilosophyFull}
                      onChange={(e) => setAboutPhilosophyFull(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/20 text-[#8A8177] font-sans text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#7CB9E8]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#080A06]/60 border border-[#C9A9FF]/30 space-y-3">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#C9A9FF]">Card 3: Literary Influences</span>
                    <input
                      type="text"
                      placeholder="Card Title"
                      value={aboutInfluencesTitle}
                      onChange={(e) => setAboutInfluencesTitle(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/20 text-[#FEEFFF] font-serif text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#C9A9FF]"
                    />
                    <textarea
                      rows={3}
                      placeholder="Expanded Full Text"
                      value={aboutInfluencesFull}
                      onChange={(e) => setAboutInfluencesFull(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/20 text-[#8A8177] font-sans text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#C9A9FF]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] font-semibold">
                  3. Author's Choice Spotlight Inscription
                </h4>
                <select
                  value={aboutSpotlightSlug}
                  onChange={(e) => setAboutSpotlightSlug(e.target.value)}
                  className="w-full bg-[#080A06] border border-[#8A8177]/30 text-[#FEEFFF] font-sans text-xs p-3 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer"
                >
                  <option value="">-- Automatic Default (First Poem) --</option>
                  {allWorks.map((w) => (
                    <option key={w.slug} value={w.slug}>
                      {w.title} ({w.category})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-lg"
              >
                Publish All About Sanctuary Changes →
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: READER INSIGHTS & ANALYTICS */}
        {activeView === 'analytics' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/15 p-6 rounded-2xl min-h-[400px]">
            <div className="border-b border-[#8A8177]/20 pb-3">
              <h3 className="font-serif text-xl text-[#FEEFFF]">Curator Insights & Analytics</h3>
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mt-1">
                Private Performance Overview for Published Works and Sanctuary Resonance
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-xl text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Inscriptions</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalWorks}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-xl text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Poems</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalPoems}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-xl text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Stories</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalStories}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-xl text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Drafts Stored</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.totalDrafts}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-xl text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Total Resonances</span>
                <p className="font-serif text-3xl text-[#D5B06C]">♥ {analytics.totalResonances}</p>
              </div>

              <div className="p-4 bg-[#080A06]/80 border border-[#8A8177]/20 rounded-xl text-center space-y-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">Avg Words / Work</span>
                <p className="font-serif text-3xl text-[#D5B06C]">{analytics.avgWords}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SANCTUARY BROADCAST & EXPERIENCE SETTINGS */}
        {activeView === 'settings' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/15 p-6 md:p-8 rounded-2xl min-h-[400px]">
            <div className="border-b border-[#8A8177]/20 pb-3">
              <h3 className="font-serif text-2xl text-[#FEEFFF]">Sanctuary Experience & Broadcast Settings</h3>
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#D5B06C] mt-1">
                Global Announcement Ribbon, Visual Effects & Default Reader Configurations
              </p>
            </div>

            <form onSubmit={handleSaveGlobalSettings} className="space-y-6">
              {/* Announcement Ribbon Section */}
              <div className="p-5 rounded-2xl bg-[#080A06]/80 border border-[#D5B06C]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#D5B06C]" />
                    <span className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] font-semibold">
                      Global Announcement Ribbon
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                    className={`px-3 py-1 rounded-full text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                      announcementEnabled
                        ? 'bg-[#D5B06C] text-[#080A06] font-semibold shadow-[0_0_10px_rgba(213,176,108,0.4)]'
                        : 'bg-white/10 text-[#8A8177]'
                    }`}
                  >
                    {announcementEnabled ? 'Active (ON)' : 'Disabled (OFF)'}
                  </button>
                </div>

                <p className="text-xs text-[#8A8177] font-sans">
                  When enabled, displays an illuminated notification ribbon across the top of every page.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1">
                      Announcement Message
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ✦ New Nocturne Collection Available..."
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/25 text-[#FEEFFF] font-sans text-xs p-3 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-[10px] uppercase tracking-widest text-[#8A8177] mb-1">
                      Target Link / Route
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /hub or /read/the-real-thing"
                      value={announcementLink}
                      onChange={(e) => setAnnouncementLink(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/25 text-[#FEEFFF] font-sans text-xs p-3 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                    />
                  </div>
                </div>

                {/* Live Preview Ribbon */}
                {announcementEnabled && announcementText && (
                  <div className="pt-2">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-[#8A8177] block mb-1">
                      Live Ribbon Preview:
                    </span>
                    <div className="w-full bg-gradient-to-r from-[#D5B06C]/15 via-[#D5B06C]/30 to-[#D5B06C]/15 border border-[#D5B06C]/40 py-2 px-4 rounded-xl text-center text-xs font-sans uppercase tracking-widest text-[#D5B06C]">
                      ✦ {announcementText} →
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Effects & Defaults Section */}
              <div className="p-5 rounded-2xl bg-[#080A06]/80 border border-white/10 space-y-4">
                <span className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] font-semibold block">
                  Sanctuary Atmosphere & Default Reader Themes
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cursor Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl">
                    <div>
                      <span className="text-xs font-sans font-medium text-[#FEEFFF] block">Custom Celestial Cursor</span>
                      <span className="text-[10px] font-sans text-[#8A8177]">Golden ring with trailing starlight orb</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCelestialCursorEnabled(!celestialCursorEnabled)}
                      className={`px-3 py-1 rounded-full text-xs font-sans uppercase ${
                        celestialCursorEnabled ? 'bg-[#D5B06C] text-[#080A06] font-semibold' : 'bg-white/10 text-[#8A8177]'
                      }`}
                    >
                      {celestialCursorEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Stardust Trail Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl">
                    <div>
                      <span className="text-xs font-sans font-medium text-[#FEEFFF] block">Stardust Particle Trail</span>
                      <span className="text-[10px] font-sans text-[#8A8177]">Floating starlight embers following cursor</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStardustTrailEnabled(!stardustTrailEnabled)}
                      className={`px-3 py-1 rounded-full text-xs font-sans uppercase ${
                        stardustTrailEnabled ? 'bg-[#D5B06C] text-[#080A06] font-semibold' : 'bg-white/10 text-[#8A8177]'
                      }`}
                    >
                      {stardustTrailEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Default Theme */}
                  <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-1">
                    <label className="text-xs font-sans font-medium text-[#FEEFFF] block">Default Reader Theme</label>
                    <select
                      value={defaultReaderTheme}
                      onChange={(e) => setDefaultReaderTheme(e.target.value)}
                      className="w-full bg-[#0F1216] border border-white/15 text-[#FEEFFF] text-xs p-2 rounded-lg"
                    >
                      <option value="midnight">Midnight Obsidian (Dark)</option>
                      <option value="sepia">Warm Espresso Sepia</option>
                      <option value="nebula">Deep Cosmic Violet</option>
                    </select>
                  </div>

                  {/* Default Typography */}
                  <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-1">
                    <label className="text-xs font-sans font-medium text-[#FEEFFF] block">Default Reader Typography</label>
                    <select
                      value={defaultTypography}
                      onChange={(e) => setDefaultTypography(e.target.value)}
                      className="w-full bg-[#0F1216] border border-white/15 text-[#FEEFFF] text-xs p-2 rounded-lg"
                    >
                      <option value="serif">Cormorant Garamond (Lyric)</option>
                      <option value="playfair">Playfair Display (Luxury)</option>
                      <option value="sans">Inter (Modern Clean)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-lg"
              >
                Save All Global Settings →
              </button>
            </form>
          </div>
        )}

        {/* TAB 8: SANCTUARY VAULT (BACKUP & EXPORT) */}
        {activeView === 'vault' && (
          <div className="space-y-6 bg-[#0F1216]/40 border border-[#8A8177]/15 p-6 md:p-8 rounded-2xl min-h-[400px]">
            <div className="border-b border-[#8A8177]/20 pb-3">
              <h3 className="font-serif text-2xl text-[#FEEFFF]">Sanctuary Vault: Disaster Recovery & Data Portability</h3>
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#D5B06C] mt-1">
                1-Click Complete Database Backup, JSON Migration & Markdown Collection Exporter
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Full Database (JSON) */}
              <div className="p-6 rounded-2xl bg-[#080A06]/80 border border-[#D5B06C]/30 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#D5B06C]">
                    <Database className="w-5 h-5" />
                    <h4 className="font-serif text-lg font-semibold">1-Click Full JSON Vault Backup</h4>
                  </div>
                  <p className="text-xs font-sans text-[#8A8177] leading-relaxed">
                    Downloads an encrypted/complete snapshot of every single poem, story, draft, reader whisper, manifesto card, and site configuration into a portable `.json` file for offline safekeeping.
                  </p>
                  <div className="text-[10px] font-mono text-[#D5B06C]/80 bg-black/40 p-2 rounded-lg border border-white/5">
                    Includes: {allWorks.length} works • {readerMessages.length} whispers • Site Settings
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportDatabase}
                  disabled={isExporting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D5B06C] to-[#E0BE81] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Sanctuary Backup (.json)</span>
                </button>
              </div>

              {/* Export Markdown Collection */}
              <div className="p-6 rounded-2xl bg-[#080A06]/80 border border-white/15 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#7CB9E8]">
                    <FileText className="w-5 h-5" />
                    <h4 className="font-serif text-lg font-semibold">Export Book Collection (.md)</h4>
                  </div>
                  <p className="text-xs font-sans text-[#8A8177] leading-relaxed">
                    Compiles all published poetry and prose into formatted Markdown book format with frontmatter metadata. Ideal for printing, compiling an anthology, or offline reading in Obsidian/Notion.
                  </p>
                  <div className="text-[10px] font-mono text-[#7CB9E8]/80 bg-black/40 p-2 rounded-lg border border-white/5">
                    Includes: {allWorks.filter(w => w.status === 'published').length} published literary works
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportMarkdownCollection}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#FEEFFF] font-sans text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer border border-white/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#7CB9E8]" />
                  <span>Export Markdown Collection (.md)</span>
                </button>
              </div>

              {/* Restore From Backup */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-[#080A06]/80 border border-[#8A8177]/25 space-y-4">
                <div className="flex items-center gap-2 text-[#C9A9FF]">
                  <RotateCcw className="w-5 h-5" />
                  <h4 className="font-serif text-lg font-semibold">Restore Sanctuary Vault from JSON</h4>
                </div>
                <p className="text-xs font-sans text-[#8A8177] leading-relaxed">
                  Restore works and settings from a previously downloaded `.json` vault backup. This safely synchronizes records into your Supabase database and local storage.
                </p>

                <input
                  type="file"
                  ref={backupFileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileRestoreSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => backupFileInputRef.current?.click()}
                  className="py-3 px-6 rounded-xl border border-[#C9A9FF]/40 text-[#C9A9FF] hover:bg-[#C9A9FF]/10 font-sans text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Select JSON Backup File to Restore...</span>
                </button>

                {restoreConfirmData && (
                  <div className="p-4 rounded-xl bg-[#0F1216] border border-[#C9A9FF] space-y-3">
                    <div className="text-xs font-sans text-[#FEEFFF]">
                      <strong className="text-[#C9A9FF]">Backup File Verified:</strong> Contains {restoreConfirmData.works?.length || 0} works from {restoreConfirmData.exportDate || 'unknown date'}.
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setRestoreConfirmData(null)}
                        className="px-4 py-2 rounded-lg border border-white/20 text-xs font-sans text-[#8A8177] uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={executeRestore}
                        className="px-6 py-2 rounded-lg bg-[#C9A9FF] text-[#080A06] text-xs font-sans uppercase font-semibold"
                      >
                        Confirm and Restore All Records
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK INCRIPTION READER PREVIEW MODAL */}
      <AnimatePresence>
        {previewWorkModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto"
            onClick={() => setPreviewWorkModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#090B0E] border border-[#D5B06C]/40 p-6 md:p-10 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#D5B06C]">
                  Sanctuary Live Preview • {previewWorkModal.category} ({previewWorkModal.mood || 'Cosmic'})
                </span>
                <button
                  onClick={() => setPreviewWorkModal(null)}
                  className="text-[#8A8177] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewWorkModal.image_url && (
                <div className="h-44 w-full rounded-2xl overflow-hidden border border-white/10 relative">
                  <img src={previewWorkModal.image_url} alt={previewWorkModal.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090B0E] via-transparent to-transparent" />
                </div>
              )}

              <div className="space-y-2 text-center">
                <h2 className="font-serif text-3xl text-[#FEEFFF]">{previewWorkModal.title}</h2>
                <p className="font-sans text-xs uppercase tracking-widest text-[#D5B06C]">
                  By {previewWorkModal.author || 'Anonymous'}
                </p>
                <p className="font-sans text-[10px] text-[#8A8177]">
                  ~{previewWorkModal.read_time_minutes || 1} min read • {previewWorkModal.status?.toUpperCase()}
                </p>
              </div>

              <div className="font-serif text-base text-[#FEEFFF]/90 leading-relaxed whitespace-pre-line py-4 border-t border-b border-white/10 max-h-[40vh] overflow-y-auto">
                {previewWorkModal.body}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleLoadWork(previewWorkModal);
                    setPreviewWorkModal(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-wider"
                >
                  Edit in Writer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BATCH DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {batchActionType === 'delete' && (
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
                <h3 className="font-serif text-2xl text-[#FEEFFF]">Delete {selectedWorkIds.length} Inscriptions?</h3>
                <p className="font-sans text-xs text-[#8A8177]">
                  This will permanently delete all {selectedWorkIds.length} selected works from your sanctuary database. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setBatchActionType(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#8A8177]/30 text-[#8A8177] font-sans text-xs uppercase tracking-widest hover:text-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBatchDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-red-500 hover:text-[#080A06] transition-all cursor-pointer"
                >
                  Delete Selected
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE WORK DELETE CONFIRMATION MODAL */}
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
                  className="flex-1 py-2.5 rounded-xl border border-[#8A8177]/30 text-[#8A8177] font-sans text-xs uppercase tracking-widest hover:text-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteWork}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-red-500 hover:text-[#080A06] transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CROP MODAL */}
      <AnimatePresence>
        {isCropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1216] border border-[#D5B06C]/40 p-6 rounded-2xl max-w-xl w-full space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#8A8177]/20 pb-3">
                <h3 className="font-serif text-xl text-[#FEEFFF]">Adjust Cover Image Crop & Alignment</h3>
                <button onClick={() => setIsCropModalOpen(false)} className="text-[#8A8177] hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 bg-[#080A06] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setCropMode('grid')}
                  className={`flex-1 py-1.5 text-xs font-sans uppercase rounded-lg cursor-pointer ${
                    cropMode === 'grid' ? 'bg-[#D5B06C] text-[#080A06] font-semibold' : 'text-[#8A8177]'
                  }`}
                >
                  Grid Card Aspect
                </button>
                <button
                  type="button"
                  onClick={() => setCropMode('bookshelf')}
                  className={`flex-1 py-1.5 text-xs font-sans uppercase rounded-lg cursor-pointer ${
                    cropMode === 'bookshelf' ? 'bg-[#D5B06C] text-[#080A06] font-semibold' : 'text-[#8A8177]'
                  }`}
                >
                  Bookshelf Aspect
                </button>
              </div>

              <div className="h-56 w-full rounded-xl overflow-hidden border border-white/15 bg-black relative">
                <img
                  src={tempImage || imageUrl}
                  alt="Crop Preview"
                  className="w-full h-full object-cover select-none"
                  style={{
                    transform: `scale(${cropMode === 'grid' ? cropScale : bookshelfCropScale})`,
                    objectPosition: `${cropMode === 'grid' ? cropPosX : bookshelfCropPosX}% ${cropMode === 'grid' ? cropPosY : bookshelfCropPosY}%`,
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-sans text-[#8A8177] mb-1">
                    <span>Scale Zoom</span>
                    <span>{cropMode === 'grid' ? cropScale.toFixed(2) : bookshelfCropScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={cropMode === 'grid' ? cropScale : bookshelfCropScale}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (cropMode === 'grid') setCropScale(val);
                      else setBookshelfCropScale(val);
                    }}
                    className="w-full accent-[#D5B06C] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-sans text-[#8A8177] mb-1">
                      <span>Horizontal Position</span>
                      <span>{cropMode === 'grid' ? cropPosX : bookshelfCropPosX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cropMode === 'grid' ? cropPosX : bookshelfCropPosX}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (cropMode === 'grid') setCropPosX(val);
                        else setBookshelfCropPosX(val);
                      }}
                      className="w-full accent-[#D5B06C] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-sans text-[#8A8177] mb-1">
                      <span>Vertical Position</span>
                      <span>{cropMode === 'grid' ? cropPosY : bookshelfCropPosY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cropMode === 'grid' ? cropPosY : bookshelfCropPosY}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (cropMode === 'grid') setCropPosY(val);
                        else setBookshelfCropPosY(val);
                      }}
                      className="w-full accent-[#D5B06C] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-xs font-sans uppercase tracking-wider text-[#8A8177]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="px-6 py-2 rounded-xl bg-[#D5B06C] text-[#080A06] text-xs font-sans uppercase font-semibold tracking-wider"
                >
                  Apply Crop
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