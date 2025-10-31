// FIX: Replace incorrect 'AuthSubscription' with the correct 'Subscription' type.
import { createClient, Session, Subscription } from '@supabase/supabase-js';
import { Project, Writing, WorkExperience, Education, Certificate, Message, Comment, Rating, AdminSettings, Skill } from './types';

// =================================================================================
// SUPABASE SQL SCHEMA & POLICIES
// This script is now idempotent, meaning it is SAFE TO RUN MULTIPLE TIMES.
// It will only create tables or policies if they don't already exist.
// =================================================================================
/*
-- Run this SQL in your Supabase project's SQL Editor to set up your database.

-- 1. TABLES
CREATE TABLE IF NOT EXISTS projects ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), title TEXT NOT NULL, images TEXT[] NOT NULL, description TEXT NOT NULL, demo_video_url TEXT, pdf_url TEXT );
CREATE TABLE IF NOT EXISTS writings ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), title TEXT NOT NULL, category TEXT NOT NULL, cover_image_url TEXT, summary TEXT, genre TEXT, youtube_audiobook_url TEXT, content JSONB );
CREATE TABLE IF NOT EXISTS work_experience ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), role TEXT NOT NULL, company TEXT NOT NULL, period TEXT NOT NULL, description TEXT[] );
CREATE TABLE IF NOT EXISTS education ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), degree TEXT NOT NULL, institution TEXT NOT NULL, period TEXT NOT NULL, details TEXT );
CREATE TABLE IF NOT EXISTS certificates ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), name TEXT NOT NULL, issuer TEXT NOT NULL, date TEXT, credential_url TEXT );
CREATE TABLE IF NOT EXISTS skills ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), name TEXT NOT NULL, category TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS messages ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, read BOOLEAN DEFAULT false );
CREATE TABLE IF NOT EXISTS comments ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), author TEXT NOT NULL, text TEXT NOT NULL, project_id UUID REFERENCES projects(id) ON DELETE CASCADE, writing_id UUID REFERENCES writings(id) ON DELETE CASCADE, CONSTRAINT chk_post_id CHECK (num_nonnulls(project_id, writing_id) = 1) );
CREATE TABLE IF NOT EXISTS ratings ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), value INT NOT NULL CHECK (value >= 1 AND value <= 5), project_id UUID REFERENCES projects(id) ON DELETE CASCADE, writing_id UUID REFERENCES writings(id) ON DELETE CASCADE, CONSTRAINT chk_post_id CHECK (num_nonnulls(project_id, writing_id) = 1) );
CREATE TABLE IF NOT EXISTS settings ( id INT PRIMARY KEY DEFAULT 1, comments_enabled BOOLEAN DEFAULT true, ratings_enabled BOOLEAN DEFAULT true, hero_section JSONB, footer_content JSONB, about_me JSONB, contact_details JSONB, cv_settings JSONB, CONSTRAINT single_row_constraint CHECK (id = 1) );


-- Insert the initial settings row only if it doesn't exist.
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 2. TABLE RLS POLICIES (Enables public read access)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on projects" ON projects; CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
ALTER TABLE writings ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on writings" ON writings; CREATE POLICY "Allow public read access on writings" ON writings FOR SELECT USING (true);
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on work_experience" ON work_experience; CREATE POLICY "Allow public read access on work_experience" ON work_experience FOR SELECT USING (true);
ALTER TABLE education ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on education" ON education; CREATE POLICY "Allow public read access on education" ON education FOR SELECT USING (true);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on certificates" ON certificates; CREATE POLICY "Allow public read access on certificates" ON certificates FOR SELECT USING (true);
ALTER TABLE skills ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on skills" ON skills; CREATE POLICY "Allow public read access on skills" ON skills FOR SELECT USING (true);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on comments" ON comments; CREATE POLICY "Allow public read access on comments" ON comments FOR SELECT USING (true);
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on ratings" ON ratings; CREATE POLICY "Allow public read access on ratings" ON ratings FOR SELECT USING (true);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS "Allow public read access on settings" ON settings; CREATE POLICY "Allow public read access on settings" ON settings FOR SELECT USING (true);

-- 3. STORAGE RLS POLICIES (Fixes "File upload failed" errors)
DROP POLICY IF EXISTS "Allow authenticated uploads in buckets" ON storage.objects; CREATE POLICY "Allow authenticated uploads in buckets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('project-images', 'writing-covers', 'profile-photos'));
DROP POLICY IF EXISTS "Allow authenticated access to files" ON storage.objects; CREATE POLICY "Allow authenticated access to files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id IN ('project-images', 'writing-covers', 'profile-photos'));
DROP POLICY IF EXISTS "Allow authenticated updates in buckets" ON storage.objects; CREATE POLICY "Allow authenticated updates in buckets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('project-images', 'writing-covers', 'profile-photos'));
DROP POLICY IF EXISTS "Allow authenticated deletes from buckets" ON storage.objects; CREATE POLICY "Allow authenticated deletes from buckets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('project-images', 'writing-covers', 'profile-photos'));

*/
// =================================================================================

// --- 1. UTILITIES for case conversion ---
const toCamel = (s: string) => s.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
const toSnake = (s: string) => s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const isObject = (o: any) => o === Object(o) && !Array.isArray(o) && typeof o !== 'function';

const keysToCamel = (o: any): any => {
    if (isObject(o)) {
        const n: {[key: string]: any} = {};
        Object.keys(o).forEach((k) => {
            n[toCamel(k)] = keysToCamel(o[k]);
        });
        return n;
    } else if (Array.isArray(o)) {
        return o.map((i) => keysToCamel(i));
    }
    return o;
};

const keysToSnake = (o: any): any => {
    if (isObject(o)) {
        const n: {[key:string]: any} = {};
        Object.keys(o).forEach((k) => {
            n[toSnake(k)] = keysToSnake(o[k]);
        });
        return n;
    } else if (Array.isArray(o)) {
        return o.map((i) => keysToSnake(i));
    }
    return o;
};

// --- 2. SETUP CLIENT ---
const supabaseUrl = 'https://yqdhrcoznwvwniotkrdl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZGhyY296bnd2d25pb3RrcmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjM2MTQsImV4cCI6MjA3NzQ5OTYxNH0.DybouxggzS4shwXozDl7Niop0dIkL5HCc92-NAytEIg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- 3. AUTHENTICATION ---
export const signInAdmin = async (password: string) => {
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
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
};

export const updateUserPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
};

// --- 4. FILE STORAGE ---
export const uploadFile = async (bucket: string, file: File): Promise<string> => {
    const filePath = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) {
       let message = `File upload failed: ${error.message}`;
       if (error.message.includes('security policy')) {
         message += "\n\nHint: Have you run the STORAGE RLS POLICIES script from supabaseClient.ts in your Supabase SQL Editor?";
       }
       throw new Error(message);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
};

// --- 5. DATA FETCHING (Wrapped with keysToCamel) ---
const fetchData = async (query: any) => {
    const { data, error } = await query;
    if (error) throw error;
    return keysToCamel(data);
};

export const getProjects = async (): Promise<Project[]> => fetchData(supabase.from('projects').select('*, comments(*), ratings(value)').order('created_at', { ascending: false }));
export const getWritings = async (): Promise<Writing[]> => fetchData(supabase.from('writings').select('*, comments(*), ratings(value)').order('created_at', { ascending: false }));
export const getWorkExperience = async (): Promise<WorkExperience[]> => fetchData(supabase.from('work_experience').select('*').order('created_at'));
export const getEducation = async (): Promise<Education[]> => fetchData(supabase.from('education').select('*').order('created_at'));
export const getCertificates = async (): Promise<Certificate[]> => fetchData(supabase.from('certificates').select('*').order('created_at'));
export const getSkills = async (): Promise<Skill[]> => fetchData(supabase.from('skills').select('*').order('category'));
export const getMessages = async (): Promise<Message[]> => fetchData(supabase.from('messages').select('*').order('created_at', { ascending: false }));
export const getSettings = async (): Promise<AdminSettings | null> => fetchData(supabase.from('settings').select('*').eq('id', 1).single());

// --- 6. DATA MUTATION (Wrapped with keysToSnake) ---
const addItem = async (table: string, item: object) => { const { error } = await supabase.from(table).insert([keysToSnake(item)]); if (error) throw error; };
const updateItem = async (table: string, id: string, updates: object) => { const { error } = await supabase.from(table).update(keysToSnake(updates)).eq('id', id); if (error) throw error; };
const deleteItem = async (table: string, id: string) => { const { error } = await supabase.from(table).delete().eq('id', id); if (error) throw error; };

// Helper to strip read-only joined data before updating
const cleanForUpdate = (item: any) => {
    const { comments, ratings, ...cleanedItem } = item;
    return cleanedItem;
};

export const addProject = (p: Omit<Project, 'id'|'comments'|'ratings'>) => addItem('projects', p);
export const updateProject = (id: string, u: Partial<Project>) => updateItem('projects', id, cleanForUpdate(u));
export const deleteProject = (id: string) => deleteItem('projects', id);

export const addWriting = (w: Omit<Writing, 'id'|'comments'|'ratings'>) => addItem('writings', w);
export const updateWriting = (id: string, u: Partial<Writing>) => updateItem('writings', id, cleanForUpdate(u));
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

export const addSkill = (s: Omit<Skill, 'id'>) => addItem('skills', s);
export const updateSkill = (id: string, u: Partial<Skill>) => updateItem('skills', id, u);
export const deleteSkill = (id: string) => deleteItem('skills', id);

export const addMessage = (m: Omit<Message, 'id'|'timestamp'|'read'>) => addItem('messages', m);
export const deleteMessage = (id: string) => deleteItem('messages', id);
export const markMessageAsRead = (id: string) => updateItem('messages', id, { read: true });

export const addComment = (c: Omit<Comment, 'id'|'timestamp'>, postId: string, type: 'project'|'writing') => {
    const payload = { ...c, projectId: type === 'project' ? postId : null, writingId: type === 'writing' ? postId : null };
    return addItem('comments', payload);
};
export const addRating = (r: Rating, postId: string, type: 'project'|'writing') => {
    const payload = { ...r, projectId: type === 'project' ? postId : null, writingId: type === 'writing' ? postId : null };
    return addItem('ratings', payload);
};

export const updateSettings = async (s: Partial<AdminSettings>) => updateItem('settings', '1', s);