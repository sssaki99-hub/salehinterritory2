// FIX: Converted to a comment block to prevent TypeScript parsing errors.
/*
-- =================================================================================
-- SUPABASE COMPLETE SETUP SCRIPT
-- This script is now idempotent, meaning it is SAFE TO RUN MULTIPLE TIMES.
-- It will only create tables or policies if they don't already exist.
-- =================================================================================

-- Run this entire script in your Supabase project's SQL Editor to set up your database.

-- =================================================================================
-- 1. TABLE CREATION
-- =================================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  images TEXT[] NOT NULL,
  description TEXT NOT NULL,
  demo_video_url TEXT,
  pdf_url TEXT
);

CREATE TABLE IF NOT EXISTS writings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image_url TEXT,
  summary TEXT,
  genre TEXT,
  youtube_audiobook_url TEXT,
  content JSONB
);

CREATE TABLE IF NOT EXISTS work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT[]
);

CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  period TEXT NOT NULL,
  details TEXT
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT,
  credential_url TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  writing_id UUID REFERENCES writings(id) ON DELETE CASCADE,
  CONSTRAINT chk_post_id CHECK (num_nonnulls(project_id, writing_id) = 1)
);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  value INT NOT NULL CHECK (value >= 1 AND value <= 5),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  writing_id UUID REFERENCES writings(id) ON DELETE CASCADE,
  CONSTRAINT chk_post_id CHECK (num_nonnulls(project_id, writing_id) = 1)
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  comments_enabled BOOLEAN DEFAULT true,
  ratings_enabled BOOLEAN DEFAULT true,
  hero_section JSONB,
  footer_content JSONB,
  about_me JSONB,
  contact_details JSONB,
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Insert the initial settings row only if it doesn't exist.
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- =================================================================================
-- 2. TABLE RLS POLICIES (Enables public read access)
-- =================================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on projects" ON projects; CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
ALTER TABLE writings ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on writings" ON writings; CREATE POLICY "Allow public read access on writings" ON writings FOR SELECT USING (true);
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on work_experience" ON work_experience; CREATE POLICY "Allow public read access on work_experience" ON work_experience FOR SELECT USING (true);
ALTER TABLE education ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on education" ON education; CREATE POLICY "Allow public read access on education" ON education FOR SELECT USING (true);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on certificates" ON certificates; CREATE POLICY "Allow public read access on certificates" ON certificates FOR SELECT USING (true);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on comments" ON comments; CREATE POLICY "Allow public read access on comments" ON comments FOR SELECT USING (true);
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on ratings" ON ratings; CREATE POLICY "Allow public read access on ratings" ON ratings FOR SELECT USING (true);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on settings" ON settings; CREATE POLICY "Allow public read access on settings" ON settings FOR SELECT USING (true);

-- =================================================================================
-- 3. STORAGE RLS POLICIES (Fixes "File upload failed" errors)
-- =================================================================================

DROP POLICY IF EXISTS "Allow authenticated uploads in buckets" ON storage.objects; CREATE POLICY "Allow authenticated uploads in buckets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('project-images', 'writing-covers', 'profile-photos'));
DROP POLICY IF EXISTS "Allow authenticated access to files" ON storage.objects; CREATE POLICY "Allow authenticated access to files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id IN ('project-images', 'writing-covers', 'profile-photos'));
DROP POLICY IF EXISTS "Allow authenticated updates in buckets" ON storage.objects; CREATE POLICY "Allow authenticated updates in buckets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('project-images', 'writing-covers', 'profile-photos'));
DROP POLICY IF EXISTS "Allow authenticated deletes from buckets" ON storage.objects; CREATE POLICY "Allow authenticated deletes from buckets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('project-images', 'writing-covers', 'profile-photos'));
*/