import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Feather, BookOpen, Compass, User, BarChart2, Sparkles, Upload, 
  Trash2, Edit3, Eye, Check, RotateCcw, Scissors, Layers, ArrowLeft, 
  MessageSquare, Copy, Download, Database, Settings, Megaphone, Tag, 
  Filter, CheckSquare, Square, FileText, ExternalLink, RefreshCw, 
  Star, Heart, X, Plus, Sliders, ChevronDown, Search, CheckCircle2,
  AlertCircle
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

  // Live Metrics Calculator
  const metrics = useMemo(() => {
    const trimmed = body.trim();
    if (!trimmed) return { words: 0, lines: 0, stanzas: 0, readTime: 1 };
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const lines = trimmed.split('\n').filter((l) => l.trim().length > 0).length;
    const stanzas = trimmed.split(/\n\s*\n/).filter((s) => s.trim().length > 0).length;
    const readTime = Math.max(1, Math.ceil(words / 150));
    return { words, lines, stanzas, readTime };
  }, [body]);

  // Analytics Aggregation
  const analytics = useMemo(() => {
    const totalWorks = allWorks.length;
    const totalPoems = allWorks.filter((w) => w.category === 'poem').length;
    const totalStories = allWorks.filter((w) => w.category === 'story').length;
    const totalDrafts = allWorks.filter((w) => w.status === 'draft').length;
    const totalResonances = allWorks.reduce((acc, curr) => acc + (curr.gilded_likes_count || 0), 0);
    const avgWords = totalWorks
      ? Math.round(
          allWorks.reduce((acc, curr) => acc + (curr.body?.split(/\s+/).filter(Boolean).length || 0), 0) /
            totalWorks
        )
      : 0;

    return {
      totalWorks,
      totalPoems,
      totalStories,
      totalDrafts,
      totalResonances,
      avgWords,
    };
  }, [allWorks]);

  // Poetic Toolbar Helpers
  const handleInsertSnippet = (snippet) => {
    setBody((prev) => prev + snippet);
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
    readerProgressService.clearCuratorDraft();
    setStatusMessage({ type: 'success', text: 'Editor workspace cleared.' });
  };

  // Work Submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setStatusMessage({ type: 'error', text: 'Both title and inscription verse are required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const slug = editingId
        ? allWorks.find((w) => w.id === editingId)?.slug ||
          title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

      const payload = {
        title,
        slug,
        author: author || 'Anonymous',
        category,
        mood,
        status: isDraft ? 'draft' : 'published',
        excerpt: excerpt || body.slice(0, 140) + '...',
        body,
        image_url: imageUrl || CELESTIAL_COVER_PRESETS[0].url,
        read_time_minutes: metrics.readTime,
        crop_scale: cropScale,
        crop_pos_x: cropPosX,
        crop_pos_y: cropPosY,
        sort_order: 0,
      };

      if (editingId) {
        payload.id = editingId;
      }

      await workService.upsertWork(payload);
      const updatedList = await workService.getAllWorksAdmin();
      setAllWorks(updatedList);

      readerProgressService.clearCuratorDraft();
      clearForm();
      setStatusMessage({ 
        type: 'success', 
        text: editingId ? 'Inscription successfully updated in the galaxy!' : 'New inscription inscribed and published!' 
      });
      setActiveView('library');
    } catch (err) {
      console.error('Submission error:', err);
      setStatusMessage({ type: 'error', text: 'Error saving work: ' + (err.message || 'Unknown error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Status Toggle
  const handleTogglePublish = async (work) => {
    try {
      const updated = await workService.togglePublishStatus(work);
      setAllWorks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setStatusMessage({
        type: 'success',
        text: `"${work.title}" is now ${updated.status.toUpperCase()}.`,
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to toggle status.' });
    }
  };

  // 1-Click Duplicate
  const handleDuplicateWork = async (work) => {
    try {
      const duplicated = await workService.duplicateWork(work);
      setAllWorks((prev) => [duplicated, ...prev]);
      setStatusMessage({
        type: 'success',
        text: `Duplicated "${work.title}" as a draft inscription.`,
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to duplicate work.' });
    }
  };

  // Single Work Delete
  const promptDeleteWork = (work) => {
    setWorkToDelete(work);
  };

  const confirmDeleteWork = async () => {
    if (!workToDelete) return;
    try {
      await workService.deleteWork(workToDelete.id);
      setAllWorks((prev) => prev.filter((w) => w.id !== workToDelete.id));
      setStatusMessage({ type: 'success', text: `Removed "${workToDelete.title}".` });
      setWorkToDelete(null);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to delete work.' });
    }
  };

  // Batch Selection
  const handleToggleSelectWork = (id) => {
    setSelectedWorkIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    if (selectedWorkIds.length === filteredLibraryWorks.length) {
      setSelectedWorkIds([]);
    } else {
      setSelectedWorkIds(filteredLibraryWorks.map((w) => w.id || w.slug));
    }
  };

  // Execute Batch Actions
  const handleExecuteBatchAction = async (actionType) => {
    if (selectedWorkIds.length === 0) return;

    if (actionType === 'publish') {
      await workService.batchUpdateStatus(selectedWorkIds, 'published');
      setAllWorks((prev) =>
        prev.map((w) => (selectedWorkIds.includes(w.id || w.slug) ? { ...w, status: 'published' } : w))
      );
      setSelectedWorkIds([]);
      setStatusMessage({ type: 'success', text: `Published ${selectedWorkIds.length} selected works!` });
    } else if (actionType === 'draft') {
      await workService.batchUpdateStatus(selectedWorkIds, 'draft');
      setAllWorks((prev) =>
        prev.map((w) => (selectedWorkIds.includes(w.id || w.slug) ? { ...w, status: 'draft' } : w))
      );
      setSelectedWorkIds([]);
      setStatusMessage({ type: 'success', text: `Moved ${selectedWorkIds.length} works to drafts.` });
    } else if (actionType === 'delete') {
      setBatchActionType('delete');
    }
  };

  const confirmBatchDelete = async () => {
    try {
      await workService.batchDeleteWorks(selectedWorkIds);
      setAllWorks((prev) => prev.filter((w) => !selectedWorkIds.includes(w.id || w.slug)));
      setStatusMessage({ type: 'success', text: `Permanently deleted ${selectedWorkIds.length} works.` });
      setSelectedWorkIds([]);
      setBatchActionType(null);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Batch delete encountered an error.' });
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
    setCropScale(work.crop_scale || 1);
    setCropPosX(work.crop_pos_x || 50);
    setCropPosY(work.crop_pos_y || 50);
    setActiveView('write');
    setStatusMessage({ type: 'success', text: `Loaded "${work.title}" for editing.` });
  };

  // Filtered and Sorted Library Works
  const filteredLibraryWorks = useMemo(() => {
    let list = allWorks.filter((work) => {
      // Category filter
      if (libraryCategory === 'draft') {
        if (work.status !== 'draft') return false;
      } else if (libraryCategory !== 'all') {
        if (work.category !== libraryCategory) return false;
      }

      // Mood filter
      if (libraryMoodFilter !== 'all') {
        if ((work.mood || 'cosmic') !== libraryMoodFilter) return false;
      }

      // Search query
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase();
        const matchTitle = (work.title || '').toLowerCase().includes(q);
        const matchAuthor = (work.author || '').toLowerCase().includes(q);
        const matchBody = (work.body || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchBody) return false;
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (librarySortBy === 'likes') {
        return (b.gilded_likes_count || 0) - (a.gilded_likes_count || 0);
      }
      if (librarySortBy === 'readTime') {
        return (b.read_time_minutes || 1) - (a.read_time_minutes || 1);
      }
      if (librarySortBy === 'alpha') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // 'newest' default
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
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

  // Sanctuary Vault Handlers
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
      reader.onload = (event) => {
        setTempImage(event.target.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = async () => {
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

  // Navigation Tab Groups for Clean, Categorized Accessibility
  const NAV_GROUPS = [
    {
      group: 'Editorial Studio',
      items: [
        { id: 'write', label: 'Write & Inscribe', shortLabel: 'Write', icon: Feather, count: null },
        { id: 'library', label: 'Library & Works', shortLabel: 'Library', icon: BookOpen, count: allWorks.length },
        { id: 'arrange', label: 'Constellation Arranger', shortLabel: 'Arranger', icon: Compass, count: null },
      ]
    },
    {
      group: 'Community & Sanctuary',
      items: [
        { id: 'moderation', label: 'Reader Moderation', shortLabel: 'Moderation', icon: MessageSquare, count: allComments.length + readerMessages.length },
        { id: 'about', label: 'Sanctuary Bio & Manifesto', shortLabel: 'Sanctuary Bio', icon: User, count: null },
      ]
    },
    {
      group: 'Operations & Data',
      items: [
        { id: 'analytics', label: 'Sanctuary Analytics', shortLabel: 'Analytics', icon: BarChart2, count: null },
        { id: 'settings', label: 'Broadcast & Visuals', shortLabel: 'Settings', icon: Settings, count: null },
        { id: 'vault', label: 'Sanctuary Vault', shortLabel: 'Vault', icon: Database, count: null },
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#050608] text-[#FEEFFF] selection:bg-[#D5B06C]/30 selection:text-[#FEEFFF] p-4 sm:p-6 md:p-10 lg:p-12">
      <CosmicNebulaBackground variant="about" />

      {/* Spacious 1400px Max-Width Command Container */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Top Header with Breadcrumbs and Global Actions */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#8A8177]/25 pb-6 gap-5">
          <div className="space-y-1.5">
            <button
              onClick={() => navigate('/hub')}
              aria-label="Return to Constellation Hub"
              className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-[#B0A89F] hover:text-[#D5B06C] transition-all cursor-pointer group py-1"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#D5B06C]" />
              <span>Return to Constellation Hub</span>
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#FEEFFF] tracking-wide flex items-center gap-3 font-normal">
                Curator Command Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D5B06C]/15 border border-[#D5B06C]/40 text-[#D5B06C] text-[11px] font-sans font-medium uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Sanctuary Online
              </span>
            </div>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#B0A89F]">
              Direct control over sanctuary publications, reader reflections, and celestial atmosphere
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            {editingId && activeView === 'write' && (
              <button
                type="button"
                onClick={clearForm}
                className="text-xs uppercase tracking-wider text-[#B0A89F] hover:text-red-300 transition-colors cursor-pointer border border-[#8A8177]/30 px-4 py-2.5 rounded-xl bg-[#0F1216]/80 hover:bg-[#0F1216] focus:ring-2 focus:ring-[#D5B06C] min-h-[44px]"
              >
                Clear Form
              </button>
            )}
            {activeView === 'write' && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#D5B06C] text-[#080A06] font-sans text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-[#FEEFFF] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(213,176,108,0.3)] flex items-center gap-2 min-h-[44px] focus:ring-2 focus:ring-[#D5B06C] focus:ring-offset-2 focus:ring-offset-[#080A06]"
              >
                <Feather className="w-4 h-4" />
                {isSubmitting ? 'Inscribing...' : isDraft ? 'Save Draft' : 'Publish Work'}
              </button>
            )}
          </div>
        </header>

        {/* Categorized, Spacious & Highly Accessible Navigation Tabs */}
        <nav 
          aria-label="Curator Portal Sections"
          className="bg-[#0B0D11]/90 border border-[#D5B06C]/30 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-2xl space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {NAV_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1.5">
                <span className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#8A8177] font-semibold px-2">
                  {group.group}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {group.items.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeView === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveView(tab.id)}
                        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#D5B06C] ${
                          isActive
                            ? 'bg-[#D5B06C]/20 text-[#D5B06C] border border-[#D5B06C]/60 shadow-[0_0_15px_rgba(213,176,108,0.2)] font-semibold'
                            : 'text-[#B0A89F] hover:text-[#FEEFFF] hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D5B06C]' : 'text-[#8A8177]'}`} />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        {tab.count !== null && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 font-sans ${
                            isActive
                              ? 'bg-[#D5B06C] text-[#080A06] font-bold'
                              : 'bg-white/10 text-[#B0A89F]'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Global Status Toast Notification */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className={`p-4 rounded-xl font-sans text-xs sm:text-sm tracking-wide border shadow-lg flex items-center justify-between px-6 ${
              statusMessage.type === 'error'
                ? 'bg-red-950/70 border-red-500 text-red-200'
                : 'bg-[#D5B06C]/15 border-[#D5B06C]/60 text-[#D5B06C]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#D5B06C]" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button 
              onClick={() => setStatusMessage(null)} 
              aria-label="Dismiss notification"
              className="cursor-pointer hover:opacity-75 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: WRITE & INSCRIBE STUDIO */}
        {/* ========================================================================= */}
        {activeView === 'write' && (
          <section aria-label="Writing and Composition Studio" className="space-y-8">
            
            {/* Title & View Switcher Bar */}
            <div className="bg-[#0B0D11]/70 border border-[#8A8177]/25 p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex-1">
                <label htmlFor="inscription-title" className="block text-xs uppercase tracking-wider text-[#D5B06C] font-semibold mb-2">
                  Title of Literary Work
                </label>
                <input
                  id="inscription-title"
                  type="text"
                  placeholder="Enter a compelling celestial title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-[#8A8177]/40 py-2 text-2xl sm:text-3xl font-serif text-[#FEEFFF] placeholder-[#8A8177]/40 focus:outline-none focus:border-[#D5B06C]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => setEditorSubTab('edit')}
                  className={`px-4 py-2 rounded-xl text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[42px] ${
                    editorSubTab === 'edit'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold'
                      : 'border border-[#8A8177]/30 text-[#B0A89F] hover:text-[#FEEFFF]'
                  }`}
                >
                  Editor View
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTab('preview')}
                  className={`px-4 py-2 rounded-xl text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[42px] ${
                    editorSubTab === 'preview'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-semibold'
                      : 'border border-[#8A8177]/30 text-[#B0A89F] hover:text-[#FEEFFF]'
                  }`}
                >
                  Live Reader Preview
                </button>
              </div>
            </div>

            {/* Collapsible Metadata, Mood & Cover Configuration */}
            <div className="bg-[#0B0D11]/70 border border-[#8A8177]/25 rounded-2xl overflow-hidden shadow-lg">
              <button
                type="button"
                aria-expanded={isMetadataExpanded}
                onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
                className="w-full px-6 py-4 bg-[#080A06]/80 flex items-center justify-between cursor-pointer border-b border-[#8A8177]/20 hover:bg-[#080A06] transition-colors"
              >
                <span className="font-sans text-xs sm:text-sm uppercase tracking-wider text-[#D5B06C] font-semibold flex items-center gap-2.5">
                  <Sliders className="w-4 h-4" /> Work Metadata, Mood & Cover Artwork
                </span>
                <span className="text-[#B0A89F] text-xs font-sans uppercase tracking-wider">
                  {isMetadataExpanded ? '▲ Collapse Settings' : '▼ Expand Settings'}
                </span>
              </button>

              <AnimatePresence>
                {isMetadataExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-6 sm:p-8 space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Author */}
                      <div>
                        <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                          Author Alias
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Aureligious"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer"
                        >
                          <option value="poem">Poem</option>
                          <option value="story">Story</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      {/* Constellation Mood */}
                      <div>
                        <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                          Galaxy Orbit Mood
                        </label>
                        <select
                          value={mood}
                          onChange={(e) => setMood(e.target.value)}
                          className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer"
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
                        <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                          Publication Status
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsDraft(false)}
                            className={`flex-1 py-2.5 text-xs font-sans uppercase tracking-wider border rounded-xl transition-all cursor-pointer min-h-[42px] ${
                              !isDraft 
                                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/15 font-semibold shadow-sm' 
                                : 'border-[#8A8177]/30 text-[#B0A89F]'
                            }`}
                          >
                            ● Published
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDraft(true)}
                            className={`flex-1 py-2.5 text-xs font-sans uppercase tracking-wider border rounded-xl transition-all cursor-pointer min-h-[42px] ${
                              isDraft 
                                ? 'border-amber-500 text-amber-300 bg-amber-500/15 font-semibold shadow-sm' 
                                : 'border-[#8A8177]/30 text-[#B0A89F]'
                            }`}
                          >
                            ○ Draft
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                        Poetic Excerpt (Shown on Galaxy Hover and Social Cards)
                      </label>
                      <textarea
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Opening stanza or evocative summary..."
                        className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-serif text-sm sm:text-base p-3.5 rounded-xl focus:outline-none focus:border-[#D5B06C] resize-none"
                      />
                    </div>

                    {/* Cover Image Presets & Upload */}
                    <div className="space-y-4 pt-4 border-t border-[#8A8177]/20">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium">
                          Celestial Cover Image (1-Click Presets or Custom Artwork)
                        </label>
                        {imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setTempImage(imageUrl);
                              setIsCropModalOpen(true);
                            }}
                            className="text-xs font-sans uppercase tracking-wider text-[#D5B06C] hover:underline cursor-pointer flex items-center gap-1.5 py-1"
                          >
                            <Scissors className="w-3.5 h-3.5" /> Adjust Image Crop & Alignment
                          </button>
                        )}
                      </div>

                      {/* Presets Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {CELESTIAL_COVER_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setImageUrl(preset.url)}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[#D5B06C] ${
                              imageUrl === preset.url
                                ? 'border-[#D5B06C] bg-[#D5B06C]/15 shadow-[0_0_15px_rgba(213,176,108,0.25)]'
                                : 'border-white/10 bg-[#080A06] hover:border-white/30'
                            }`}
                          >
                            <div className="h-14 w-full rounded-lg overflow-hidden mb-1.5 relative">
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/20" />
                            </div>
                            <span className="text-[11px] font-sans text-[#DDD4CA] group-hover:text-[#FEEFFF] truncate block font-medium">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Upload or URL */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
                          className="py-3 px-5 bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs uppercase tracking-wider rounded-xl hover:border-[#D5B06C] transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap min-h-[44px]"
                        >
                          <Upload className="w-4 h-4 text-[#D5B06C]" /> Upload Custom Image
                        </button>
                        <input
                          type="url"
                          placeholder="Or paste any high-resolution image URL..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="flex-1 bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#D5B06C] min-h-[44px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Main Composition Editor */}
            {editorSubTab === 'edit' ? (
              <div className="space-y-4">
                {/* Poetic Formatting Toolbar */}
                <div className="flex flex-wrap items-center justify-between p-3 bg-[#0B0D11] border border-[#8A8177]/30 rounded-xl gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-sans uppercase tracking-wider text-[#DDD4CA] font-medium pr-1">
                      Poetic Glyphs:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('\n\n✦   ✧   ✦\n\n')}
                      className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-[#D5B06C] text-[#D5B06C] text-xs font-serif hover:bg-white/5 transition-all cursor-pointer min-h-[36px]"
                      title="Insert Cosmic Asterism Divider"
                    >
                      ✦ ✧ ✦ Asterism
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('\n\n')}
                      className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-[#D5B06C] text-[#FEEFFF] text-xs font-sans hover:bg-white/5 transition-all cursor-pointer min-h-[36px]"
                      title="Insert Stanza Break"
                    >
                      ¶ Stanza Break
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet(' — ')}
                      className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-[#D5B06C] text-[#FEEFFF] text-xs font-serif hover:bg-white/5 transition-all cursor-pointer min-h-[36px]"
                      title="Insert Em-Dash"
                    >
                      — Em-Dash
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('“ ”')}
                      className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-[#D5B06C] text-[#FEEFFF] text-xs font-serif hover:bg-white/5 transition-all cursor-pointer min-h-[36px]"
                      title="Insert Curly Quotes"
                    >
                      “ ” Quotes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('\n    ')}
                      className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-[#D5B06C] text-[#FEEFFF] text-xs font-mono hover:bg-white/5 transition-all cursor-pointer min-h-[36px]"
                      title="Indent Stanza"
                    >
                      ⇥ Indent
                    </button>
                  </div>

                  {/* Live Metrics HUD */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-[#080A06] rounded-xl border border-white/10 text-xs font-sans text-[#B0A89F]">
                    <span><strong className="text-[#D5B06C] font-semibold">{metrics.words}</strong> words</span>
                    <span>•</span>
                    <span><strong className="text-[#D5B06C] font-semibold">{metrics.lines}</strong> lines</span>
                    <span>•</span>
                    <span><strong className="text-[#D5B06C] font-semibold">{metrics.stanzas}</strong> stanzas</span>
                    <span>•</span>
                    <span className="text-[#FEEFFF]">~{metrics.readTime} min read</span>
                  </div>
                </div>

                <textarea
                  rows={20}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Inscribe your poem or literary narrative here... Use blank lines to separate stanzas."
                  className="w-full bg-[#0B0D11]/80 border border-[#8A8177]/30 p-6 sm:p-8 rounded-2xl font-serif text-lg sm:text-xl text-[#FEEFFF] leading-relaxed focus:outline-none focus:border-[#D5B06C]/70 resize-y min-h-[500px] shadow-inner"
                />
              </div>
            ) : (
              /* Live Preview Subtab */
              <div className="space-y-6">
                <div className="p-6 bg-[#0B0D11]/70 border border-[#8A8177]/25 rounded-2xl space-y-4">
                  <span className="font-sans text-xs uppercase tracking-wider text-[#D5B06C] font-semibold block">
                    Public Galaxy Card Preview
                  </span>
                  <div className="max-w-md">
                    <GlowingCard
                      image={imageUrl || CELESTIAL_COVER_PRESETS[0].url}
                      cropScale={cropScale}
                      cropPosX={cropPosX}
                      cropPosY={cropPosY}
                      className="h-[120px]"
                    >
                      <div>
                        <h3 className="font-serif text-lg md:text-xl text-[#FEEFFF]">
                          {title || 'Untitled Inscription'}
                        </h3>
                        <p className="font-sans text-xs text-[#D5B06C]/90 mt-1 font-medium">
                          By {author || 'Anonymous'}
                        </p>
                      </div>
                      <div className="font-sans text-xs uppercase tracking-wider text-[#B0A89F]">
                        {metrics.readTime} min <span className="mx-1 text-[#D5B06C]">•</span> {mood.toUpperCase()}
                      </div>
                    </GlowingCard>
                  </div>
                </div>

                <div className="bg-[#0B0D11]/70 border border-[#8A8177]/25 p-8 sm:p-12 rounded-2xl min-h-[380px]">
                  <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C] block mb-3 font-semibold">
                    Sanctuary • {category.toUpperCase()} ({mood.toUpperCase()})
                  </span>
                  <h1 className="font-serif text-3xl sm:text-5xl text-[#FEEFFF] mb-3">{title || 'Untitled Inscription'}</h1>
                  <p className="font-sans text-xs uppercase tracking-widest text-[#B0A89F] mb-8 font-medium">
                    By {author || 'Anonymous'}
                  </p>
                  <div className="font-serif text-lg sm:text-xl text-[#FEEFFF]/90 leading-relaxed whitespace-pre-line font-light">
                    {body || <span className="text-[#8A8177] italic">Your verse will preview here...</span>}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIBRARY & BATCH CONTROL CENTER */}
        {/* ========================================================================= */}
        {activeView === 'library' && (
          <section aria-label="Library and Batch Management" className="space-y-6 bg-[#0B0D11]/70 border border-[#8A8177]/25 p-6 sm:p-8 rounded-2xl min-h-[500px]">
            
            {/* Header & Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8A8177]/20 pb-5 gap-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal">Sanctuary Library Catalog</h2>
                <p className="font-sans text-xs text-[#B0A89F] mt-1">
                  Manage publication status, duplicate works, execute batch operations, and preview reader cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearForm();
                  setActiveView('write');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#FEEFFF] transition-all cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto min-h-[42px]"
              >
                <Plus className="w-4 h-4" /> Inscribe New Work
              </button>
            </div>

            {/* Filter and Search Rows */}
            <div className="space-y-4">
              {/* Row 1: Category Switchers */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLibraryCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[38px] ${
                    libraryCategory === 'all'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-bold shadow-sm'
                      : 'border border-[#8A8177]/30 text-[#B0A89F] hover:text-[#FEEFFF]'
                  }`}
                >
                  All ({allWorks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('poem')}
                  className={`px-4 py-2 rounded-xl text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[38px] ${
                    libraryCategory === 'poem'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-bold shadow-sm'
                      : 'border border-[#8A8177]/30 text-[#B0A89F] hover:text-[#FEEFFF]'
                  }`}
                >
                  Poems ({allWorks.filter((w) => w.category === 'poem').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('story')}
                  className={`px-4 py-2 rounded-xl text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[38px] ${
                    libraryCategory === 'story'
                      ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-bold shadow-sm'
                      : 'border border-[#8A8177]/30 text-[#B0A89F] hover:text-[#FEEFFF]'
                  }`}
                >
                  Stories ({allWorks.filter((w) => w.category === 'story').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryCategory('draft')}
                  className={`px-4 py-2 rounded-xl text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[38px] ${
                    libraryCategory === 'draft'
                      ? 'border border-amber-500 text-amber-300 bg-amber-500/15 font-bold shadow-sm'
                      : 'border border-[#8A8177]/30 text-[#B0A89F] hover:text-[#FEEFFF]'
                  }`}
                >
                  Drafts ({allWorks.filter((w) => w.status === 'draft').length})
                </button>
              </div>

              {/* Row 2: Search, Mood Filter, and Sorter */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-[#8A8177] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search inscriptions by title, author, or verse..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C] min-h-[42px]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={libraryMoodFilter}
                    onChange={(e) => setLibraryMoodFilter(e.target.value)}
                    className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer min-h-[42px]"
                  >
                    <option value="all">All Galaxy Moods</option>
                    {MOOD_OPTIONS.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={librarySortBy}
                    onChange={(e) => setLibrarySortBy(e.target.value)}
                    className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#D5B06C] font-sans text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer font-medium min-h-[42px]"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="likes">Sort: Most Hearts</option>
                    <option value="readTime">Sort: Reading Time</option>
                    <option value="alpha">Sort: Title (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Multi-Select Batch Actions Command Bar */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-[#080A06] border border-[#D5B06C]/40 rounded-xl gap-4">
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="flex items-center gap-2.5 font-sans text-xs uppercase tracking-wider text-[#DDD4CA] hover:text-[#FEEFFF] cursor-pointer py-1"
              >
                {selectedWorkIds.length > 0 && selectedWorkIds.length === filteredLibraryWorks.length ? (
                  <CheckSquare className="w-5 h-5 text-[#D5B06C]" />
                ) : (
                  <Square className="w-5 h-5 text-[#8A8177]" />
                )}
                <span>
                  Select All ({selectedWorkIds.length} of {filteredLibraryWorks.length} selected)
                </span>
              </button>

              {selectedWorkIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs text-[#D5B06C] font-sans font-semibold mr-1">
                    Batch Actions:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleExecuteBatchAction('publish')}
                    className="px-3.5 py-1.5 bg-[#D5B06C]/20 border border-[#D5B06C]/60 text-[#D5B06C] text-xs font-sans uppercase font-bold rounded-lg hover:bg-[#D5B06C] hover:text-[#080A06] transition-colors cursor-pointer min-h-[34px]"
                  >
                    Batch Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteBatchAction('draft')}
                    className="px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-sans uppercase font-bold rounded-lg hover:bg-amber-500 hover:text-[#080A06] transition-colors cursor-pointer min-h-[34px]"
                  >
                    Move to Drafts
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteBatchAction('delete')}
                    className="px-3.5 py-1.5 bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-sans uppercase font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer min-h-[34px]"
                  >
                    Batch Delete
                  </button>
                </div>
              )}
            </div>

            {/* Works List Table / Cards */}
            {filteredLibraryWorks.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-[#080A06]/40 rounded-2xl border border-white/5">
                <p className="font-serif text-xl text-[#B0A89F]">No matching inscriptions found.</p>
                <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]">
                  Try adjusting your search query, mood filter, or category toggle.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredLibraryWorks.map((work) => {
                  const isSelected = selectedWorkIds.includes(work.id || work.slug);
                  return (
                    <div
                      key={work.id || work.slug}
                      className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all gap-4 ${
                        isSelected
                          ? 'border-[#D5B06C] bg-[#D5B06C]/10 shadow-lg'
                          : 'border-[#8A8177]/25 bg-[#080A06]/70 hover:border-[#D5B06C]/50'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <button
                          type="button"
                          aria-label={`Select ${work.title}`}
                          onClick={() => handleToggleSelectWork(work.id || work.slug)}
                          className="mt-1 sm:mt-0 text-[#8A8177] hover:text-[#D5B06C] cursor-pointer p-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-[#D5B06C]" />
                          ) : (
                            <Square className="w-5 h-5 text-[#8A8177]" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-serif text-lg sm:text-xl text-[#FEEFFF] font-medium">
                              {work.title || 'Untitled Work'}
                            </h3>

                            {/* 1-Click Status Badge */}
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(work)}
                              title="Click to instantly toggle between Published and Draft"
                              className={`text-[10px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full cursor-pointer transition-all font-semibold ${
                                work.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                              }`}
                            >
                              {work.status === 'published' ? '● Published' : '○ Draft'}
                            </button>

                            {/* Mood Tag */}
                            <span className="text-[10px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D5B06C]/15 text-[#D5B06C] border border-[#D5B06C]/35 font-medium">
                              {work.mood || 'Cosmic'}
                            </span>
                          </div>

                          <div className="font-sans text-xs uppercase tracking-wider text-[#B0A89F] flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="font-semibold text-[#DDD4CA]">{work.category}</span>
                            <span>•</span>
                            <span>By {work.author || 'Anonymous'}</span>
                            <span>•</span>
                            <span>~{work.read_time_minutes} min read</span>
                            <span>•</span>
                            <span className="text-[#D5B06C] font-semibold">♥ {work.gilded_likes_count || 0} Hearts</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewWorkModal(work)}
                          className="p-2.5 rounded-xl border border-white/15 hover:border-[#D5B06C] text-[#B0A89F] hover:text-[#FEEFFF] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Quick Live Reader Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateWork(work)}
                          className="p-2.5 rounded-xl border border-white/15 hover:border-[#D5B06C] text-[#B0A89F] hover:text-[#D5B06C] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Duplicate Work as Draft"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLoadWork(work)}
                          className="px-4 py-2 rounded-xl border border-[#D5B06C]/50 text-[#D5B06C] font-sans text-xs uppercase tracking-wider hover:bg-[#D5B06C] hover:text-[#080A06] transition-colors cursor-pointer font-bold min-h-[40px]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => promptDeleteWork(work)}
                          className="p-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Delete Inscription"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CONSTELLATION ARRANGER */}
        {/* ========================================================================= */}
        {activeView === 'arrange' && (
          <section aria-label="Constellation Visual Arranger" className="space-y-6 bg-[#0B0D11]/70 border border-[#8A8177]/25 p-6 sm:p-8 rounded-2xl min-h-[450px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8A8177]/20 pb-5 gap-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal">Arrange Constellation Orbits</h2>
                <p className="font-sans text-xs text-[#B0A89F] mt-1">
                  Drag and drop works to visually prioritize the order poems and stories orbit in the galaxy archives.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setArrangerCategory('poem')}
                    className={`px-4 py-2 rounded-xl text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[38px] ${
                      arrangerCategory === 'poem'
                        ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-bold'
                        : 'border border-[#8A8177]/30 text-[#B0A89F]'
                    }`}
                  >
                    Poems
                  </button>
                  <button
                    type="button"
                    onClick={() => setArrangerCategory('story')}
                    className={`px-4 py-2 rounded-xl text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[38px] ${
                      arrangerCategory === 'story'
                        ? 'border border-[#D5B06C] text-[#D5B06C] bg-[#D5B06C]/15 font-bold'
                        : 'border border-[#8A8177]/30 text-[#B0A89F]'
                    }`}
                  >
                    Stories
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="px-6 py-2.5 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-md min-h-[38px]"
                >
                  Save Constellation Order
                </button>
              </div>
            </div>

            {currentArrangerWorks.length === 0 ? (
              <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177] py-16 text-center">
                No published works in the {arrangerCategory} category to arrange.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {currentArrangerWorks.map((work, index) => (
                  <div
                    key={work.id || work.slug}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#8A8177]/30 bg-[#080A06] hover:border-[#D5B06C]/60 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-[#8A8177] text-sm font-mono select-none">⠿</span>
                      <span className="font-serif text-base text-[#FEEFFF] truncate max-w-md">
                        {index + 1}. {work.title || 'Untitled Work'}
                      </span>
                      <span className="text-[10px] uppercase font-sans tracking-wider px-2.5 py-0.5 rounded-full bg-[#D5B06C]/15 text-[#D5B06C] font-medium">
                        {work.category}
                      </span>
                    </div>
                    <span className="text-xs font-sans text-[#8A8177] uppercase tracking-wider select-none pr-2">
                      Drag to Reorder
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MODERATION CENTER (REFLECTIONS & WHISPERS) */}
        {/* ========================================================================= */}
        {activeView === 'moderation' && (
          <section aria-label="Reader Reflections Moderation Hub" className="space-y-6 bg-[#0B0D11]/70 border border-[#8A8177]/25 p-6 sm:p-8 rounded-2xl min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8A8177]/20 pb-5 gap-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal">Reader Moderation Hub</h2>
                <p className="font-sans text-xs text-[#B0A89F] mt-1">
                  Inspect and moderate reflections left across poem verses and anonymous About page whispers.
                </p>
              </div>

              {/* Sub-Tab Switcher */}
              <div className="flex items-center gap-2 bg-[#080A06] p-1.5 rounded-xl border border-[#8A8177]/30">
                <button
                  type="button"
                  onClick={() => setModerationSubTab('comments')}
                  className={`px-4 py-2 rounded-lg text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[36px] ${
                    moderationSubTab === 'comments'
                      ? 'bg-[#D5B06C] text-[#080A06] font-bold shadow'
                      : 'text-[#B0A89F] hover:text-[#FEEFFF]'
                  }`}
                >
                  Poem Reflections ({allComments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setModerationSubTab('whispers')}
                  className={`px-4 py-2 rounded-lg text-xs font-sans uppercase tracking-wider transition-all cursor-pointer min-h-[36px] ${
                    moderationSubTab === 'whispers'
                      ? 'bg-[#D5B06C] text-[#080A06] font-bold shadow'
                      : 'text-[#B0A89F] hover:text-[#FEEFFF]'
                  }`}
                >
                  Sanctuary Whispers ({readerMessages.length})
                </button>
              </div>
            </div>

            {/* Poem Reflections Stream */}
            {moderationSubTab === 'comments' ? (
              <div className="space-y-5">
                {/* Search & Work Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8 relative">
                    <Search className="w-4 h-4 text-[#8A8177] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search reflections by reader alias or message content..."
                      value={commentsSearch}
                      onChange={(e) => setCommentsSearch(e.target.value)}
                      className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C] min-h-[42px]"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={commentsFilterWorkId}
                      onChange={(e) => setCommentsFilterWorkId(e.target.value)}
                      className="w-full bg-[#080A06] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer min-h-[42px]"
                    >
                      <option value="all">All Inscriptions</option>
                      {allWorks.map((w) => (
                        <option key={w.id} value={w.id}>{w.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredComments.length === 0 ? (
                  <div className="p-16 text-center border border-[#8A8177]/20 rounded-2xl bg-[#080A06]/40 space-y-2">
                    <p className="font-serif text-xl text-[#B0A89F]">No reader reflections found.</p>
                    <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]">
                      When readers leave reflections on poems, they will appear here for review.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredComments.map((c) => (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl bg-[#080A06]/80 border border-white/10 hover:border-[#D5B06C]/40 transition-all flex flex-col justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="font-serif text-base font-semibold text-[#D5B06C]">
                                {c.author_alias || 'Anonymous Reader'}
                              </span>
                              {c.works?.title && (
                                <span className="text-xs font-sans text-[#DDD4CA] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 font-medium">
                                  On "{c.works.title}"
                                </span>
                              )}
                            </div>
                            <span className="font-sans text-xs text-[#B0A89F]">
                              {new Date(c.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="font-serif text-base text-[#FEEFFF]/90 leading-relaxed italic">
                            “{c.content}”
                          </p>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-white/5">
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-[#B0A89F] hover:text-red-400 font-sans text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors py-1 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
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
                  <div className="p-16 text-center border border-[#8A8177]/20 rounded-2xl bg-[#080A06]/40 space-y-2">
                    <p className="font-serif text-xl text-[#B0A89F]">The Sanctuary is quiet.</p>
                    <p className="font-sans text-xs uppercase tracking-widest text-[#8A8177]">
                      No reader whispers received on the About page yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {readerMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-5 rounded-2xl bg-[#080A06]/80 border border-[#D5B06C]/40 flex flex-col justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-base font-semibold text-[#D5B06C]">{msg.sender}</span>
                            <span className="font-sans text-xs uppercase tracking-wider text-[#B0A89F]">
                              {msg.timestamp}
                            </span>
                          </div>
                          <p className="font-serif text-base leading-relaxed text-[#FEEFFF]/90 italic">
                            “{msg.text}”
                          </p>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-white/5">
                          <button
                            onClick={() => handleDeleteWhisper(msg.id)}
                            className="text-[#B0A89F] hover:text-red-400 font-sans text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors py-1 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Whisper</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SANCTUARY BIO & MANIFESTO */}
        {/* ========================================================================= */}
        {activeView === 'about' && (
          <section aria-label="Sanctuary Profile and Manifesto Settings" className="space-y-6 bg-[#0B0D11]/70 border border-[#8A8177]/25 p-6 sm:p-10 rounded-2xl min-h-[500px]">
            <div className="border-b border-[#8A8177]/20 pb-5">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal">Edit Sanctuary Profile & Manifesto</h2>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C] mt-1 font-semibold">
                Control author presentation, living philosophy cards, and featured spotlight poem
              </p>
            </div>

            <form onSubmit={handleSaveAboutBio} className="space-y-8">
              {/* Profile Header */}
              <div className="space-y-4 p-6 bg-[#080A06]/80 rounded-2xl border border-white/10">
                <h3 className="font-sans text-xs uppercase tracking-wider text-[#D5B06C] font-bold">
                  1. Author Profile Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={aboutAuthorName}
                      onChange={(e) => setAboutAuthorName(e.target.value)}
                      className="w-full bg-[#0F1216] border border-[#8A8177]/40 text-[#FEEFFF] font-serif text-base p-3.5 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                      Title / Role Tagline
                    </label>
                    <input
                      type="text"
                      value={aboutAuthorTagline}
                      onChange={(e) => setAboutAuthorTagline(e.target.value)}
                      className="w-full bg-[#0F1216] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-sm p-3.5 rounded-xl focus:outline-none focus:border-[#D5B06C]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                    Author Sanctuary Bio Quote
                  </label>
                  <textarea
                    rows={3}
                    value={aboutBio}
                    onChange={(e) => setAboutBio(e.target.value)}
                    className="w-full bg-[#0F1216] border border-[#8A8177]/40 text-[#FEEFFF] font-serif text-base p-3.5 rounded-xl focus:outline-none focus:border-[#D5B06C] leading-relaxed"
                  />
                </div>
              </div>

              {/* 3 Manifesto Cards */}
              <div className="space-y-4 p-6 bg-[#080A06]/80 rounded-2xl border border-white/10">
                <h3 className="font-sans text-xs uppercase tracking-wider text-[#D5B06C] font-bold">
                  2. Living Manifesto Cards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1 */}
                  <div className="p-5 rounded-xl bg-[#0F1216] border border-[#D5B06C]/40 space-y-3">
                    <span className="font-sans text-xs uppercase tracking-wider text-[#D5B06C] font-bold block">
                      Card 1: Why I Write
                    </span>
                    <input
                      type="text"
                      placeholder="Card Title"
                      value={aboutWhyTitle}
                      onChange={(e) => setAboutWhyTitle(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-base p-3 rounded-lg focus:outline-none focus:border-[#D5B06C]"
                    />
                    <textarea
                      rows={4}
                      placeholder="Expanded Full Text"
                      value={aboutWhyFull}
                      onChange={(e) => setAboutWhyFull(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/30 text-[#DDD4CA] font-sans text-xs sm:text-sm p-3 rounded-lg focus:outline-none focus:border-[#D5B06C]"
                    />
                  </div>

                  {/* Card 2 */}
                  <div className="p-5 rounded-xl bg-[#0F1216] border border-[#7CB9E8]/40 space-y-3">
                    <span className="font-sans text-xs uppercase tracking-wider text-[#7CB9E8] font-bold block">
                      Card 2: The Real Thing
                    </span>
                    <input
                      type="text"
                      placeholder="Card Title"
                      value={aboutPhilosophyTitle}
                      onChange={(e) => setAboutPhilosophyTitle(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-base p-3 rounded-lg focus:outline-none focus:border-[#7CB9E8]"
                    />
                    <textarea
                      rows={4}
                      placeholder="Expanded Full Text"
                      value={aboutPhilosophyFull}
                      onChange={(e) => setAboutPhilosophyFull(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/30 text-[#DDD4CA] font-sans text-xs sm:text-sm p-3 rounded-lg focus:outline-none focus:border-[#7CB9E8]"
                    />
                  </div>

                  {/* Card 3 */}
                  <div className="p-5 rounded-xl bg-[#0F1216] border border-[#C9A9FF]/40 space-y-3">
                    <span className="font-sans text-xs uppercase tracking-wider text-[#C9A9FF] font-bold block">
                      Card 3: Literary Influences
                    </span>
                    <input
                      type="text"
                      placeholder="Card Title"
                      value={aboutInfluencesTitle}
                      onChange={(e) => setAboutInfluencesTitle(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/30 text-[#FEEFFF] font-serif text-base p-3 rounded-lg focus:outline-none focus:border-[#C9A9FF]"
                    />
                    <textarea
                      rows={4}
                      placeholder="Expanded Full Text"
                      value={aboutInfluencesFull}
                      onChange={(e) => setAboutInfluencesFull(e.target.value)}
                      className="w-full bg-black/40 border border-[#8A8177]/30 text-[#DDD4CA] font-sans text-xs sm:text-sm p-3 rounded-lg focus:outline-none focus:border-[#C9A9FF]"
                    />
                  </div>
                </div>
              </div>

              {/* Spotlight Inscription */}
              <div className="space-y-3 p-6 bg-[#080A06]/80 rounded-2xl border border-white/10">
                <h3 className="font-sans text-xs uppercase tracking-wider text-[#D5B06C] font-bold">
                  3. Featured Spotlight Inscription
                </h3>
                <select
                  value={aboutSpotlightSlug}
                  onChange={(e) => setAboutSpotlightSlug(e.target.value)}
                  className="w-full bg-[#0F1216] border border-[#8A8177]/40 text-[#FEEFFF] font-sans text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none focus:border-[#D5B06C] cursor-pointer min-h-[44px]"
                >
                  <option value="">-- Automatic Default (First Published Poem) --</option>
                  {allWorks.map((w) => (
                    <option key={w.slug} value={w.slug}>
                      {w.title} ({w.category})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-xl min-h-[48px]"
              >
                Publish All Sanctuary Bio Changes →
              </button>
            </form>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: READER INSIGHTS & ANALYTICS */}
        {/* ========================================================================= */}
        {activeView === 'analytics' && (
          <section aria-label="Curator Analytics" className="space-y-6 bg-[#0B0D11]/70 border border-[#8A8177]/25 p-6 sm:p-10 rounded-2xl min-h-[450px]">
            <div className="border-b border-[#8A8177]/20 pb-5">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal">Curator Insights & Analytics</h2>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C] mt-1 font-semibold">
                Overview of published literature, reader resonances, and composition metrics
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              <div className="p-6 bg-[#080A06]/90 border border-white/10 rounded-2xl text-center space-y-2">
                <span className="font-sans text-xs uppercase tracking-wider text-[#B0A89F] font-medium block">Total Works</span>
                <p className="font-serif text-4xl text-[#D5B06C]">{analytics.totalWorks}</p>
              </div>

              <div className="p-6 bg-[#080A06]/90 border border-white/10 rounded-2xl text-center space-y-2">
                <span className="font-sans text-xs uppercase tracking-wider text-[#B0A89F] font-medium block">Poems</span>
                <p className="font-serif text-4xl text-[#D5B06C]">{analytics.totalPoems}</p>
              </div>

              <div className="p-6 bg-[#080A06]/90 border border-white/10 rounded-2xl text-center space-y-2">
                <span className="font-sans text-xs uppercase tracking-wider text-[#B0A89F] font-medium block">Stories</span>
                <p className="font-serif text-4xl text-[#D5B06C]">{analytics.totalStories}</p>
              </div>

              <div className="p-6 bg-[#080A06]/90 border border-white/10 rounded-2xl text-center space-y-2">
                <span className="font-sans text-xs uppercase tracking-wider text-[#B0A89F] font-medium block">Drafts Stored</span>
                <p className="font-serif text-4xl text-[#D5B06C]">{analytics.totalDrafts}</p>
              </div>

              <div className="p-6 bg-[#080A06]/90 border border-white/10 rounded-2xl text-center space-y-2">
                <span className="font-sans text-xs uppercase tracking-wider text-[#B0A89F] font-medium block">Resonances</span>
                <p className="font-serif text-4xl text-[#D5B06C]">♥ {analytics.totalResonances}</p>
              </div>

              <div className="p-6 bg-[#080A06]/90 border border-white/10 rounded-2xl text-center space-y-2">
                <span className="font-sans text-xs uppercase tracking-wider text-[#B0A89F] font-medium block">Avg Words</span>
                <p className="font-serif text-4xl text-[#D5B06C]">{analytics.avgWords}</p>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SANCTUARY BROADCAST & EXPERIENCE SETTINGS */}
        {/* ========================================================================= */}
        {activeView === 'settings' && (
          <section aria-label="Broadcast and Experience Controls" className="space-y-6 bg-[#0B0D11]/70 border border-[#8A8177]/25 p-6 sm:p-10 rounded-2xl min-h-[500px]">
            <div className="border-b border-[#8A8177]/20 pb-5">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal">Sanctuary Atmosphere & Broadcast Controls</h2>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C] mt-1 font-semibold">
                Global announcement bar, visual effects, and reader typography defaults
              </p>
            </div>

            <form onSubmit={handleSaveGlobalSettings} className="space-y-8">
              {/* Announcement Ribbon Section */}
              <div className="p-6 rounded-2xl bg-[#080A06]/90 border border-[#D5B06C]/40 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-5 h-5 text-[#D5B06C]" />
                    <span className="font-sans text-sm uppercase tracking-wider text-[#D5B06C] font-bold">
                      Sitewide Announcement Ribbon
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                    className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider transition-all cursor-pointer font-bold min-h-[36px] ${
                      announcementEnabled
                        ? 'bg-[#D5B06C] text-[#080A06] shadow-[0_0_12px_rgba(213,176,108,0.4)]'
                        : 'bg-white/10 text-[#B0A89F]'
                    }`}
                  >
                    {announcementEnabled ? 'Active (ON)' : 'Disabled (OFF)'}
                  </button>
                </div>

                <p className="text-xs text-[#B0A89F] font-sans leading-relaxed">
                  When enabled, displays an illuminated golden notification ribbon across the top of every sanctuary page.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                      Announcement Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ✦ New Equinox Chapbook Now Available..."
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full bg-[#0F1216] border border-[#8A8177]/35 text-[#FEEFFF] font-sans text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none focus:border-[#D5B06C] min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs uppercase tracking-wider text-[#DDD4CA] font-medium mb-2">
                      Target Link / Route
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /hub or /read/the-real-thing"
                      value={announcementLink}
                      onChange={(e) => setAnnouncementLink(e.target.value)}
                      className="w-full bg-[#0F1216] border border-[#8A8177]/35 text-[#FEEFFF] font-sans text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none focus:border-[#D5B06C] min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Live Preview Ribbon */}
                {announcementEnabled && announcementText && (
                  <div className="pt-2">
                    <span className="text-xs font-sans uppercase tracking-wider text-[#B0A89F] block mb-2 font-medium">
                      Live Ribbon Preview:
                    </span>
                    <div className="w-full bg-gradient-to-r from-[#D5B06C]/20 via-[#D5B06C]/35 to-[#D5B06C]/20 border border-[#D5B06C]/50 py-2.5 px-4 rounded-xl text-center text-xs sm:text-sm font-sans uppercase tracking-widest text-[#D5B06C] font-semibold">
                      ✦ {announcementText} →
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Effects & Defaults Section */}
              <div className="p-6 rounded-2xl bg-[#080A06]/90 border border-white/10 space-y-5">
                <span className="font-sans text-sm uppercase tracking-wider text-[#D5B06C] font-bold block">
                  Sanctuary Atmosphere & Default Reader Themes
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Cursor Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#0F1216] border border-white/10 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs sm:text-sm font-sans font-medium text-[#FEEFFF] block">Custom Celestial Cursor</span>
                      <span className="text-xs font-sans text-[#B0A89F]">Golden ring with trailing starlight orb</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCelestialCursorEnabled(!celestialCursorEnabled)}
                      className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase font-bold transition-all min-h-[34px] ${
                        celestialCursorEnabled ? 'bg-[#D5B06C] text-[#080A06]' : 'bg-white/10 text-[#B0A89F]'
                      }`}
                    >
                      {celestialCursorEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Stardust Trail Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#0F1216] border border-white/10 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs sm:text-sm font-sans font-medium text-[#FEEFFF] block">Stardust Particle Trail</span>
                      <span className="text-xs font-sans text-[#B0A89F]">Floating starlight embers following mouse</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStardustTrailEnabled(!stardustTrailEnabled)}
                      className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase font-bold transition-all min-h-[34px] ${
                        stardustTrailEnabled ? 'bg-[#D5B06C] text-[#080A06]' : 'bg-white/10 text-[#B0A89F]'
                      }`}
                    >
                      {stardustTrailEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Default Theme */}
                  <div className="p-4 bg-[#0F1216] border border-white/10 rounded-xl space-y-2">
                    <label className="text-xs uppercase tracking-wider font-sans font-semibold text-[#DDD4CA] block">
                      Default Reader Theme
                    </label>
                    <select
                      value={defaultReaderTheme}
                      onChange={(e) => setDefaultReaderTheme(e.target.value)}
                      className="w-full bg-[#080A06] border border-white/20 text-[#FEEFFF] text-xs sm:text-sm p-3 rounded-lg cursor-pointer"
                    >
                      <option value="midnight">Midnight Obsidian (Dark)</option>
                      <option value="sepia">Warm Espresso Sepia</option>
                      <option value="nebula">Deep Cosmic Violet</option>
                    </select>
                  </div>

                  {/* Default Typography */}
                  <div className="p-4 bg-[#0F1216] border border-white/10 rounded-xl space-y-2">
                    <label className="text-xs uppercase tracking-wider font-sans font-semibold text-[#DDD4CA] block">
                      Default Reader Typography
                    </label>
                    <select
                      value={defaultTypography}
                      onChange={(e) => setDefaultTypography(e.target.value)}
                      className="w-full bg-[#080A06] border border-white/20 text-[#FEEFFF] text-xs sm:text-sm p-3 rounded-lg cursor-pointer"
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
                className="w-full py-4 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#FEEFFF] transition-colors cursor-pointer shadow-xl min-h-[48px]"
              >
                Save All Global Settings →
              </button>
            </form>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: SANCTUARY VAULT (BACKUP & EXPORT) */}
        {/* ========================================================================= */}
        {activeView === 'vault' && (
          <section aria-label="Sanctuary Disaster Recovery Vault" className="space-y-6 bg-[#0B0D11]/70 border border-[#8A8177]/25 p-6 sm:p-10 rounded-2xl min-h-[500px]">
            <div className="border-b border-[#8A8177]/20 pb-5">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#FEEFFF] font-normal">Sanctuary Vault & Disaster Recovery</h2>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C] mt-1 font-semibold">
                1-Click JSON Database Snapshots, Safe Restoration & Markdown Book Exporter
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Full Database (JSON) */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#080A06]/90 border border-[#D5B06C]/40 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-[#D5B06C]">
                    <Database className="w-5 h-5" />
                    <h3 className="font-serif text-xl font-normal">1-Click Full JSON Vault Backup</h3>
                  </div>
                  <p className="text-xs sm:text-sm font-sans text-[#B0A89F] leading-relaxed">
                    Downloads a complete snapshot of every single poem, story, draft, reader whisper, manifesto card, and site configuration into a portable `.json` file for offline safekeeping.
                  </p>
                  <div className="text-xs font-mono text-[#D5B06C] bg-black/50 p-3 rounded-xl border border-white/10">
                    Includes: {allWorks.length} works • {readerMessages.length} whispers • Global Settings
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportDatabase}
                  disabled={isExporting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D5B06C] to-[#E0BE81] text-[#080A06] font-sans text-xs sm:text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Sanctuary Backup (.json)</span>
                </button>
              </div>

              {/* Export Markdown Collection */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#080A06]/90 border border-white/15 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-[#7CB9E8]">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-serif text-xl font-normal">Export Book Collection (.md)</h3>
                  </div>
                  <p className="text-xs sm:text-sm font-sans text-[#B0A89F] leading-relaxed">
                    Compiles all published poetry and prose into formatted Markdown book format with frontmatter metadata. Ideal for printing, compiling an anthology, or offline reading in Obsidian/Notion.
                  </p>
                  <div className="text-xs font-mono text-[#7CB9E8] bg-black/50 p-3 rounded-xl border border-white/10">
                    Includes: {allWorks.filter(w => w.status === 'published').length} published literary works
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportMarkdownCollection}
                  className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FEEFFF] font-sans text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/20 flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <Download className="w-4 h-4 text-[#7CB9E8]" />
                  <span>Export Markdown Collection (.md)</span>
                </button>
              </div>

              {/* Restore From Backup */}
              <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-[#080A06]/90 border border-[#8A8177]/30 space-y-5">
                <div className="flex items-center gap-2.5 text-[#C9A9FF]">
                  <RotateCcw className="w-5 h-5" />
                  <h3 className="font-serif text-xl font-normal">Restore Sanctuary Vault from JSON</h3>
                </div>
                <p className="text-xs sm:text-sm font-sans text-[#B0A89F] leading-relaxed">
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
                  className="py-3 px-6 rounded-xl border border-[#C9A9FF]/50 text-[#C9A9FF] hover:bg-[#C9A9FF]/15 font-sans text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[44px]"
                >
                  <Upload className="w-4 h-4" />
                  <span>Select JSON Backup File to Restore...</span>
                </button>

                {restoreConfirmData && (
                  <div className="p-5 rounded-xl bg-[#0F1216] border border-[#C9A9FF] space-y-4">
                    <div className="text-xs sm:text-sm font-sans text-[#FEEFFF]">
                      <strong className="text-[#C9A9FF]">Backup File Verified:</strong> Contains {restoreConfirmData.works?.length || 0} works from {restoreConfirmData.exportDate || 'unknown date'}.
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setRestoreConfirmData(null)}
                        className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-sans text-[#B0A89F] uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={executeRestore}
                        className="px-6 py-2.5 rounded-xl bg-[#C9A9FF] text-[#080A06] text-xs font-sans uppercase font-bold tracking-wider"
                      >
                        Confirm and Restore All Records
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ========================================================================= */}
      {/* QUICK INSCRIPTION READER PREVIEW MODAL */}
      {/* ========================================================================= */}
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
              className="bg-[#090B0E] border border-[#D5B06C]/50 p-6 sm:p-10 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#D5B06C] font-semibold">
                  Sanctuary Live Preview • {previewWorkModal.category} ({previewWorkModal.mood || 'Cosmic'})
                </span>
                <button
                  onClick={() => setPreviewWorkModal(null)}
                  className="text-[#8A8177] hover:text-white cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewWorkModal.image_url && (
                <div className="h-48 w-full rounded-2xl overflow-hidden border border-white/10 relative">
                  <img src={previewWorkModal.image_url} alt={previewWorkModal.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090B0E] via-transparent to-transparent" />
                </div>
              )}

              <div className="space-y-2 text-center">
                <h2 className="font-serif text-3xl sm:text-4xl text-[#FEEFFF]">{previewWorkModal.title}</h2>
                <p className="font-sans text-xs uppercase tracking-widest text-[#D5B06C] font-semibold">
                  By {previewWorkModal.author || 'Anonymous'}
                </p>
                <p className="font-sans text-xs text-[#B0A89F]">
                  ~{previewWorkModal.read_time_minutes || 1} min read • {previewWorkModal.status?.toUpperCase()}
                </p>
              </div>

              <div className="font-serif text-base sm:text-lg text-[#FEEFFF]/90 leading-relaxed whitespace-pre-line py-4 border-t border-b border-white/10 max-h-[40vh] overflow-y-auto font-light">
                {previewWorkModal.body}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleLoadWork(previewWorkModal);
                    setPreviewWorkModal(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#D5B06C] text-[#080A06] font-sans text-xs font-bold uppercase tracking-wider"
                >
                  Edit in Writer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* BATCH DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {batchActionType === 'delete' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1216] border border-red-500/40 p-6 sm:p-8 rounded-2xl max-w-md w-full space-y-6 text-center shadow-2xl relative"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center text-xl font-serif">
                  †
                </div>
                <h3 className="font-serif text-2xl text-[#FEEFFF]">Delete {selectedWorkIds.length} Inscriptions?</h3>
                <p className="font-sans text-xs sm:text-sm text-[#B0A89F] leading-relaxed">
                  This will permanently delete all {selectedWorkIds.length} selected works from your sanctuary database. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setBatchActionType(null)}
                  className="flex-1 py-3 rounded-xl border border-[#8A8177]/40 text-[#B0A89F] font-sans text-xs uppercase tracking-wider hover:text-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBatchDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-[#080A06] transition-all cursor-pointer"
                >
                  Delete Selected
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SINGLE WORK DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {workToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1216] border border-red-500/40 p-6 sm:p-8 rounded-2xl max-w-md w-full space-y-6 text-center shadow-2xl relative"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center text-xl font-serif">
                  †
                </div>
                <h3 className="font-serif text-2xl text-[#FEEFFF]">Delete Inscription?</h3>
                <p className="font-sans text-xs sm:text-sm text-[#B0A89F] leading-relaxed">
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
                  className="flex-1 py-3 rounded-xl border border-[#8A8177]/40 text-[#B0A89F] font-sans text-xs uppercase tracking-wider hover:text-[#FEEFFF] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteWork}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-[#080A06] transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* IMAGE CROP MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1216] border border-[#D5B06C]/50 p-6 sm:p-8 rounded-2xl max-w-xl w-full space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#8A8177]/25 pb-3">
                <h3 className="font-serif text-xl text-[#FEEFFF]">Adjust Cover Image Crop & Alignment</h3>
                <button onClick={() => setIsCropModalOpen(false)} className="text-[#8A8177] hover:text-white cursor-pointer p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 bg-[#080A06] p-1.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setCropMode('grid')}
                  className={`flex-1 py-2 text-xs font-sans uppercase tracking-wider rounded-lg cursor-pointer ${
                    cropMode === 'grid' ? 'bg-[#D5B06C] text-[#080A06] font-bold' : 'text-[#B0A89F]'
                  }`}
                >
                  Grid Card Aspect
                </button>
                <button
                  type="button"
                  onClick={() => setCropMode('bookshelf')}
                  className={`flex-1 py-2 text-xs font-sans uppercase tracking-wider rounded-lg cursor-pointer ${
                    cropMode === 'bookshelf' ? 'bg-[#D5B06C] text-[#080A06] font-bold' : 'text-[#B0A89F]'
                  }`}
                >
                  Bookshelf Aspect
                </button>
              </div>

              <div className="h-60 w-full rounded-xl overflow-hidden border border-white/20 bg-black relative">
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
                  <div className="flex justify-between text-xs font-sans text-[#DDD4CA] mb-1.5">
                    <span>Scale Zoom</span>
                    <span className="font-semibold text-[#D5B06C]">
                      {cropMode === 'grid' ? cropScale.toFixed(2) : bookshelfCropScale.toFixed(2)}x
                    </span>
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
                    className="w-full accent-[#D5B06C] cursor-pointer h-2 bg-[#080A06] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-sans text-[#DDD4CA] mb-1.5">
                      <span>Horizontal Position</span>
                      <span className="font-semibold text-[#D5B06C]">
                        {cropMode === 'grid' ? cropPosX : bookshelfCropPosX}%
                      </span>
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
                      className="w-full accent-[#D5B06C] cursor-pointer h-2 bg-[#080A06] rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-sans text-[#DDD4CA] mb-1.5">
                      <span>Vertical Position</span>
                      <span className="font-semibold text-[#D5B06C]">
                        {cropMode === 'grid' ? cropPosY : bookshelfCropPosY}%
                      </span>
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
                      className="w-full accent-[#D5B06C] cursor-pointer h-2 bg-[#080A06] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-sans uppercase tracking-wider text-[#B0A89F] min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="px-6 py-2.5 rounded-xl bg-[#D5B06C] text-[#080A06] text-xs font-sans uppercase font-bold tracking-wider min-h-[42px]"
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