import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url) => {
  try {
    return Boolean(url && url.startsWith('http') && !url.includes('your-project-id'));
  } catch (e) {
    return false;
  }
};

export const isSupabaseConfigured = isValidUrl(rawUrl) && Boolean(rawAnonKey && !rawAnonKey.includes('your-supabase-anon-key'));

// Initialize client with fallback placeholder to prevent Vite / runtime crash if env vars are unset
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey)
  : createClient('https://placeholder-domain-for-safeboot.supabase.co', 'placeholder-anon-key-prevent-crash');