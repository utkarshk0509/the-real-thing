const KEYS = {
  LAST_READ: 'real_thing_last_read',
  LAST_READ_POEM: 'real_thing_last_read_poem',
  LAST_READ_STORY: 'real_thing_last_read_story',
  LIBRARY_STATUS: 'real_thing_library_status',
  PARAGRAPH_BOOKMARKS: 'real_thing_paragraph_bookmarks',
  FAVORITE_QUOTES: 'real_thing_favorite_quotes',
  READER_STATS: 'real_thing_reader_stats',
  EMOJI_REACTIONS: 'real_thing_emoji_reactions',
  CURATOR_DRAFT: 'real_thing_curator_draft',
  VIEW_PREFERENCE: 'real_thing_view_preference',
  READER_SETTINGS: 'real_thing_reader_settings',
  ALL_PROGRESS: 'real_thing_all_progress',
};

export const readerProgressService = {
  getViewPreference: () => {
    try {
      return localStorage.getItem(KEYS.VIEW_PREFERENCE) || 'grid';
    } catch (e) {
      return 'grid';
    }
  },

  saveViewPreference: (mode) => {
    try {
      localStorage.setItem(KEYS.VIEW_PREFERENCE, mode);
    } catch (e) {}
  },

  getAllProgress: () => {
    try {
      const data = localStorage.getItem(KEYS.ALL_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  getWorkProgress: (slug) => {
    try {
      const all = readerProgressService.getAllProgress();
      return all[slug] || 0;
    } catch (e) {
      return 0;
    }
  },

  getLastRead: (category = null) => {
    try {
      let key = KEYS.LAST_READ;
      if (category === 'poem') key = KEYS.LAST_READ_POEM;
      if (category === 'story') key = KEYS.LAST_READ_STORY;

      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveLastRead: (workData) => {
    try {
      const category = workData.category || 'poem';
      const categoryKey = category === 'story' ? KEYS.LAST_READ_STORY : KEYS.LAST_READ_POEM;

      const newPercentage = Math.min(100, Math.max(0, Math.round(workData.scrollPercentage || 0)));

      if (workData.slug) {
        const allProgress = readerProgressService.getAllProgress();
        const currentWorkMax = allProgress[workData.slug] || 0;
        const updatedMax = Math.max(currentWorkMax, newPercentage);
        allProgress[workData.slug] = updatedMax;
        localStorage.setItem(KEYS.ALL_PROGRESS, JSON.stringify(allProgress));
      }

      const existingOverall = readerProgressService.getLastRead();
      const existingCategory = readerProgressService.getLastRead(category);

      const isSameOverall = existingOverall && existingOverall.slug === workData.slug;
      const isSameCategory = existingCategory && existingCategory.slug === workData.slug;

      const maxOverallPercentage = isSameOverall
        ? Math.max(existingOverall.scrollPercentage || 0, newPercentage)
        : newPercentage;

      const maxCategoryPercentage = isSameCategory
        ? Math.max(existingCategory.scrollPercentage || 0, newPercentage)
        : newPercentage;

      const payload = {
        slug: workData.slug,
        title: workData.title,
        author: workData.author || 'Anonymous',
        category: category,
        scrollPercentage: maxOverallPercentage,
        paragraphIndex: workData.paragraphIndex || 0,
        timestamp: Date.now(),
      };

      const categoryPayload = {
        ...payload,
        scrollPercentage: maxCategoryPercentage,
      };

      localStorage.setItem(KEYS.LAST_READ, JSON.stringify(payload));
      localStorage.setItem(categoryKey, JSON.stringify(categoryPayload));
      readerProgressService.updateStreak();
    } catch (e) {
      console.warn('Progress save fallback:', e);
    }
  },

  getLibraryStatuses: () => {
    try {
      const data = localStorage.getItem(KEYS.LIBRARY_STATUS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  setWorkLibraryStatus: (slug, status) => {
    try {
      const current = readerProgressService.getLibraryStatuses();
      if (!status) {
        delete current[slug];
      } else {
        current[slug] = status;
      }
      localStorage.setItem(KEYS.LIBRARY_STATUS, JSON.stringify(current));

      if (status === 'Completed') {
        readerProgressService.incrementFinishedCount();
      }
      return current;
    } catch (e) {
      return {};
    }
  },

  getParagraphBookmarks: () => {
    try {
      const data = localStorage.getItem(KEYS.PARAGRAPH_BOOKMARKS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  toggleParagraphBookmark: (slug, paragraphIndex) => {
    try {
      const current = readerProgressService.getParagraphBookmarks();
      if (current[slug] === paragraphIndex) {
        delete current[slug];
      } else {
        current[slug] = paragraphIndex;
      }
      localStorage.setItem(KEYS.PARAGRAPH_BOOKMARKS, JSON.stringify(current));
      return current;
    } catch (e) {
      return {};
    }
  },

  getFavoriteQuotes: () => {
    try {
      const data = localStorage.getItem(KEYS.FAVORITE_QUOTES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveFavoriteQuote: ({ quote, author, workTitle, workSlug }) => {
    try {
      const quotes = readerProgressService.getFavoriteQuotes();
      const newQuote = {
        id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        quote: quote.trim(),
        author: author || 'Anonymous',
        workTitle: workTitle || 'Untitled Work',
        workSlug: workSlug || '',
        timestamp: Date.now(),
      };

      if (quotes.some((q) => q.quote === newQuote.quote)) return quotes;

      const updated = [newQuote, ...quotes];
      localStorage.setItem(KEYS.FAVORITE_QUOTES, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  removeFavoriteQuote: (quoteId) => {
    try {
      const quotes = readerProgressService.getFavoriteQuotes();
      const updated = quotes.filter((q) => q.id !== quoteId);
      localStorage.setItem(KEYS.FAVORITE_QUOTES, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  getReaderStats: () => {
    try {
      const data = localStorage.getItem(KEYS.READER_STATS);
      return data
        ? JSON.parse(data)
        : { worksFinished: 0, commentsCount: 0, streakDays: 1, lastActiveDate: new Date().toDateString() };
    } catch (e) {
      return { worksFinished: 0, commentsCount: 0, streakDays: 1, lastActiveDate: new Date().toDateString() };
    }
  },

  incrementFinishedCount: () => {
    try {
      const stats = readerProgressService.getReaderStats();
      stats.worksFinished = (stats.worksFinished || 0) + 1;
      localStorage.setItem(KEYS.READER_STATS, JSON.stringify(stats));
    } catch (e) {}
  },

  incrementCommentCount: () => {
    try {
      const stats = readerProgressService.getReaderStats();
      stats.commentsCount = (stats.commentsCount || 0) + 1;
      localStorage.setItem(KEYS.READER_STATS, JSON.stringify(stats));
    } catch (e) {}
  },

  updateStreak: () => {
    try {
      const stats = readerProgressService.getReaderStats();
      const today = new Date().toDateString();
      if (stats.lastActiveDate === today) return;

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (stats.lastActiveDate === yesterday) {
        stats.streakDays = (stats.streakDays || 0) + 1;
      } else {
        stats.streakDays = 1;
      }
      stats.lastActiveDate = today;
      localStorage.setItem(KEYS.READER_STATS, JSON.stringify(stats));
    } catch (e) {}
  },

  getEmojiReactions: (workIdOrSlug) => {
    try {
      const data = localStorage.getItem(KEYS.EMOJI_REACTIONS);
      const all = data ? JSON.parse(data) : {};
      return all[workIdOrSlug] || {};
    } catch (e) {
      return {};
    }
  },

  toggleEmojiReaction: (workIdOrSlug, emoji) => {
    try {
      const data = localStorage.getItem(KEYS.EMOJI_REACTIONS);
      const all = data ? JSON.parse(data) : {};
      const workReactions = all[workIdOrSlug] || {};
      const userClicksKey = `user_reacted_${workIdOrSlug}_${emoji}`;

      const hasReacted = localStorage.getItem(userClicksKey) === 'true';

      if (hasReacted) {
        workReactions[emoji] = Math.max(0, (workReactions[emoji] || 1) - 1);
        if (workReactions[emoji] === 0) delete workReactions[emoji];
        localStorage.removeItem(userClicksKey);
      } else {
        workReactions[emoji] = (workReactions[emoji] || 0) + 1;
        localStorage.setItem(userClicksKey, 'true');
      }

      all[workIdOrSlug] = workReactions;
      localStorage.setItem(KEYS.EMOJI_REACTIONS, JSON.stringify(all));
      return { reactions: workReactions, hasReacted: !hasReacted };
    } catch (e) {
      return { reactions: {}, hasReacted: false };
    }
  },

  hasUserReacted: (workIdOrSlug, emoji) => {
    try {
      return localStorage.getItem(`user_reacted_${workIdOrSlug}_${emoji}`) === 'true';
    } catch (e) {
      return false;
    }
  },

  getCuratorDraft: () => {
    try {
      const data = localStorage.getItem(KEYS.CURATOR_DRAFT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCuratorDraft: (draftData) => {
    try {
      localStorage.setItem(KEYS.CURATOR_DRAFT, JSON.stringify({ ...draftData, updatedAt: Date.now() }));
    } catch (e) {}
  },

  clearCuratorDraft: () => {
    try {
      localStorage.removeItem(KEYS.CURATOR_DRAFT);
    } catch (e) {}
  },

  getReaderSettings: () => {
    try {
      const data = localStorage.getItem(KEYS.READER_SETTINGS);
      return data
        ? JSON.parse(data)
        : { theme: 'midnight', fontSize: 'md', fontFamily: 'serif' };
    } catch (e) {
      return { theme: 'midnight', fontSize: 'md', fontFamily: 'serif' };
    }
  },

  saveReaderSettings: (settings) => {
    try {
      localStorage.setItem(KEYS.READER_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  },
};

export default readerProgressService;
