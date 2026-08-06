/**
 * Application Constants and Supabase Projections
 * Enforces strict lightweight field projections to minimize egress bandwidth.
 */

// Supabase Projections
export const PROJECTIONS = {
  // Lightweight projection for lists/cards (Excludes heavy 'body' column)
  CARD_LIST: 'id, slug, title, category, author, image_url, published_at, read_time_minutes, status, sort_order',
  
  // Full projection for Reader view
  WORK_FULL: 'id, slug, title, category, author, excerpt, body, image_url, published_at, read_time_minutes, status, sort_order, gilded_likes_count, crop_scale, crop_pos_x, crop_pos_y',
  
  // Comments projection
  COMMENT_LIST: 'id, work_id, author_alias, avatar_seed, content, created_at, is_approved'
};

// Local Storage Cache Keys
export const CACHE_KEYS = {
  HUB_WORKS: 'real_thing_cached_hub_works',
  AUTHOR_BIO: 'real_thing_author_bio',
  CUSTOM_WORKS: 'real_thing_custom_works',
  AUTHOR_AUTH: 'real_thing_author_auth'
};

// Storage Buckets
export const BUCKETS = {
  COVERS: 'covers'
};

// Default Values
export const DEFAULT_AUTHOR_BIO = '"The Real Thing" is an open-access literary sanctuary designed for poetry, prose, and quiet contemplation.';
export const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop';
export const CURATOR_EMAIL = import.meta.env.VITE_CURATOR_EMAIL || '';
