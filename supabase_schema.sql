-- ============================================================================
-- THE REAL THING - SUPABASE MUMBAI PRODUCTION SCHEMA & RLS SCRIPT
-- Copy and execute this script directly in the Supabase SQL Editor.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP TABLES IF RE-INITIALIZING (CAUTION: RUN ONLY ON NEW INSTANCE)
-- DROP TABLE IF EXISTS user_likes CASCADE;
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS works CASCADE;
-- DROP TABLE IF EXISTS site_settings CASCADE;

-- 3. CREATE WORKS TABLE
CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  category TEXT NOT NULL DEFAULT 'poem', -- 'poem', 'story', 'essay'
  status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published'
  excerpt TEXT,
  body TEXT NOT NULL,
  image_url TEXT,
  read_time_minutes INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  crop_scale NUMERIC DEFAULT 1.0,
  crop_pos_x INT DEFAULT 50,
  crop_pos_y INT DEFAULT 50,
  sort_order INT DEFAULT 0,
  gilded_likes_count INT DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  author_alias TEXT NOT NULL DEFAULT 'Anonymous Reader',
  avatar_seed TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE SITE_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value)
VALUES ('author_bio', '"The Real Thing" is an open-access literary sanctuary designed for poetry, prose, and quiet contemplation.')
ON CONFLICT (key) DO NOTHING;

-- 6. CREATE USER_LIKES TABLE (For activity tracking)
CREATE TABLE IF NOT EXISTS user_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_work_like UNIQUE (user_id, work_id)
);

-- 7. STRICT INDEXES FOR OPTIMIZED QUERYING
CREATE INDEX IF NOT EXISTS idx_works_slug ON works(slug);
CREATE INDEX IF NOT EXISTS idx_works_category ON works(category);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(status);
CREATE INDEX IF NOT EXISTS idx_works_sort_order ON works(sort_order);
CREATE INDEX IF NOT EXISTS idx_comments_work_id ON comments(work_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);

-- 8. ATOMIC RPC FUNCTION FOR LIKE INCREMENT
CREATE OR REPLACE FUNCTION increment_work_likes(work_id_param UUID, increment_by INT DEFAULT 1)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE works
  SET gilded_likes_count = GREATEST(0, COALESCE(gilded_likes_count, 0) + increment_by)
  WHERE id = work_id_param
  RETURNING gilded_likes_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- CRITICAL: Grant EXECUTE to anon and authenticated roles so anonymous visitors can call the RPC.
-- Without this, Supabase blocks the call for unauthenticated users → intermittent like failures.
GRANT EXECUTE ON FUNCTION increment_work_likes(UUID, INT) TO anon;
GRANT EXECUTE ON FUNCTION increment_work_likes(UUID, INT) TO authenticated;

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for WORKS
DROP POLICY IF EXISTS "Public read published works" ON works;
CREATE POLICY "Public read published works" ON works
  FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin write works" ON works;
CREATE POLICY "Admin write works" ON works
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for COMMENTS
DROP POLICY IF EXISTS "Public read approved comments" ON comments;
CREATE POLICY "Public read approved comments" ON comments
  FOR SELECT USING (is_approved = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public insert comments" ON comments;
CREATE POLICY "Public insert comments" ON comments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write comments" ON comments;
CREATE POLICY "Admin write comments" ON comments
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for SITE_SETTINGS
DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write site_settings" ON site_settings;
CREATE POLICY "Admin write site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for USER_LIKES
DROP POLICY IF EXISTS "Users read own likes" ON user_likes;
CREATE POLICY "Users read own likes" ON user_likes
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users insert own likes" ON user_likes;
CREATE POLICY "Users insert own likes" ON user_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own likes" ON user_likes;
CREATE POLICY "Users delete own likes" ON user_likes
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- 10. STORAGE BUCKET CONFIGURATION FOR 'covers'
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access Covers" ON storage.objects;
CREATE POLICY "Public Access Covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Admin Insert Covers" ON storage.objects;
CREATE POLICY "Admin Insert Covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update Covers" ON storage.objects;
CREATE POLICY "Admin Update Covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Covers" ON storage.objects;
CREATE POLICY "Admin Delete Covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- 11. CREATE READER_WHISPERS TABLE & PUBLIC INSERT RLS POLICY
CREATE TABLE IF NOT EXISTS reader_whispers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL DEFAULT 'A Quiet Reader',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reader_whispers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert whispers" ON reader_whispers;
CREATE POLICY "Public insert whispers" ON reader_whispers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select whispers" ON reader_whispers;
CREATE POLICY "Public select whispers" ON reader_whispers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin delete whispers" ON reader_whispers;
CREATE POLICY "Admin delete whispers" ON reader_whispers
  FOR DELETE USING (auth.role() = 'authenticated');
