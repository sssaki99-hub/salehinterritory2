import { createClient, Session } from '@supabase/supabase-js';
import { Project, Writing, WorkExperience, Education, Certificate, Message, Comment, Rating, AdminSettings } from './types';

// =================================================================================
// SUPABASE SQL SCHEMA
// =================================================================================
/*
-- Run this SQL in your Supabase project's SQL Editor to create the necessary tables.
-- Make sure to enable Row Level Security (RLS) on all tables and define policies.

-- PROJECTS TABLE
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  images TEXT[] NOT NULL,
  description TEXT NOT NULL,
  demo_video_url TEXT,
  pdf_url TEXT
);

-- WRITINGS TABLE
CREATE TABLE writings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  summary TEXT,
  genre TEXT,
  youtube_audiobook_url TEXT,
  content JSONB
);

-- WORK EXPERIENCE TABLE
CREATE TABLE work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT[]
);

-- EDUCATION TABLE
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  period TEXT NOT NULL,
  details TEXT
);

-- CERTIFICATES TABLE
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT,
  credential_url TEXT
);

-- MESSAGES TABLE
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false
);

-- COMMENTS TABLE
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  writing_id UUID REFERENCES writings(id) ON DELETE CASCADE,
  CONSTRAINT chk_post_id CHECK (num_nonnulls(project_id, writing_id) = 1)
);

-- RATINGS TABLE
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  value INT NOT NULL CHECK (value >= 1 AND value <= 5),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  writing_id UUID REFERENCES writings(id) ON DELETE CASCADE,
  CONSTRAINT chk_post_id CHECK (num_nonnulls(project_id, writing_id) = 1)
);

-- SETTINGS TABLE
CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1,
  comments_enabled BOOLEAN DEFAULT true,
  ratings_enabled BOOLEAN DEFAULT true,
  hero_section JSONB,
  footer_content JSONB,
  about_me JSONB,
  contact_details JSONB,
  CONSTRAINT single_row_constraint CHECK (id = 1)
);
-- Initialize the settings row
INSERT INTO settings (id) VALUES (1);


-- STORAGE BUCKETS
-- In the Supabase dashboard, create the following storage buckets and set them to public:
-- 1. 'project-images'
-- 2. 'writing-covers'
-- 3. 'profile-photos'
*/
// =================================================================================

// --- 1. SETUP CLIENT ---
const supabaseUrl = 'https://yqdhrcoznwvwniotkrdl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZGhyY296bnd2d25pb3RrcmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjM2MTQsImV4cCI6MjA3NzQ5OTYxNH0.DybouxggzS4shwXozDl7Niop0dIkL5HCc92-NAytEIg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- 2. AUTHENTICATION ---
export const signInAdmin = async (password: string) => {
    // Using a hardcoded email for password-only login
    const email = 'admin@territory.local';
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Authentication failed: ${error.message}`);
    return data;
};

export const signOutAdmin = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Sign out failed: ${error.message}`);
};

export const onAuthChange = (callback: (session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
    return subscription;
};

export const updateUserPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
};

// --- 3. FILE STORAGE ---
export const uploadFile = async (bucket: string, file: File): Promise<string> => {
    const filePath = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw new Error(`File upload failed: ${error.message}`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
};

// --- 4. DATA FETCHING ---
export const getProjects = async (): Promise<Project[]> => (await supabase.from('projects').select('*, comments(*), ratings(value)').order('created_at', { ascending: false })).data || [];
export const getWritings = async (): Promise<Writing[]> => (await supabase.from('writings').select('*, comments(*), ratings(value)').order('created_at', { ascending: false })).data || [];
export const getWorkExperience = async (): Promise<WorkExperience[]> => (await supabase.from('work_experience').select('*').order('created_at')).data || [];
export const getEducation = async (): Promise<Education[]> => (await supabase.from('education').select('*').order('created_at')).data || [];
export const getCertificates = async (): Promise<Certificate[]> => (await supabase.from('certificates').select('*').order('created_at')).data || [];
export const getMessages = async (): Promise<Message[]> => (await supabase.from('messages').select('*').order('created_at', { ascending: false })).data || [];
export const getSettings = async (): Promise<AdminSettings | null> => (await supabase.from('settings').select('*').eq('id', 1).single()).data;

// --- 5. DATA MUTATION ---
const addItem = async (table: string, item: object) => { const { error } = await supabase.from(table).insert([item]); if (error) throw error; };
const updateItem = async (table: string, id: string, updates: object) => { const { error } = await supabase.from(table).update(updates).eq('id', id); if (error) throw error; };
const deleteItem = async (table: string, id: string) => { const { error } = await supabase.from(table).delete().eq('id', id); if (error) throw error; };

export const addProject = (p: Omit<Project, 'id'|'comments'|'ratings'>) => addItem('projects', p);
export const updateProject = (id: string, u: Partial<Project>) => updateItem('projects', id, u);
export const deleteProject = (id: string) => deleteItem('projects', id);

export const addWriting = (w: Omit<Writing, 'id'|'comments'|'ratings'>) => addItem('writings', w);
export const updateWriting = (id: string, u: Partial<Writing>) => updateItem('writings', id, u);
export const deleteWriting = (id: string) => deleteItem('writings', id);

export const addWorkExperience = (e: Omit<WorkExperience, 'id'>) => addItem('work_experience', e);
export const updateWorkExperience = (id: string, u: Partial<WorkExperience>) => updateItem('work_experience', id, u);
export const deleteWorkExperience = (id: string) => deleteItem('work_experience', id);

export const addEducation = (e: Omit<Education, 'id'>) => addItem('education', e);
export const updateEducation = (id: string, u: Partial<Education>) => updateItem('education', id, u);
export const deleteEducation = (id: string) => deleteItem('education', id);

export const addCertificate = (c: Omit<Certificate, 'id'>) => addItem('certificates', c);
export const updateCertificate = (id: string, u: Partial<Certificate>) => updateItem('certificates', id, u);
export const deleteCertificate = (id: string) => deleteItem('certificates', id);

export const addMessage = (m: Omit<Message, 'id'|'timestamp'|'read'>) => addItem('messages', m);
export const deleteMessage = (id: string) => deleteItem('messages', id);
export const markMessageAsRead = (id: string) => updateItem('messages', id, { read: true });

export const addComment = (c: Omit<Comment, 'id'|'timestamp'>, postId: string, type: 'project'|'writing') => addItem('comments', { ...c, project_id: type === 'project' ? postId : null, writing_id: type === 'writing' ? postId : null });
export const addRating = (r: Rating, postId: string, type: 'project'|'writing') => addItem('ratings', { ...r, project_id: type === 'project' ? postId : null, writing_id: type === 'writing' ? postId : null });

export const updateSettings = async (s: Partial<AdminSettings>) => { const { error } = await supabase.from('settings').update(s).eq('id', 1); if (error) throw error; };