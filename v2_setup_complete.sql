-- ============================================================
-- MENTORHIPERS V2.0 - COMPLETE DATABASE SETUP
-- Jalankan di SQL Editor project Supabase V2 yang baru.
-- URUTAN PENTING: jalankan dari atas ke bawah.
-- ============================================================

-- 1. WORKSPACES (Batch LMS atau Agency B2B)
CREATE TABLE IF NOT EXISTS v2_workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'batch',
    description TEXT,
    logo_url TEXT,
    max_members INTEGER DEFAULT 50,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',      -- Grading weights, custom config
    schedules JSONB DEFAULT '[]',     -- Array of schedule sessions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES (User V2 - linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS v2_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,          -- Can store URL or base64; prefer URL for performance
    role TEXT DEFAULT 'student',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MEMBERSHIPS (Siapa masuk Batch/Agency mana)
CREATE TABLE IF NOT EXISTS v2_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    group_name TEXT,
    group_wa_link TEXT,
    is_leader BOOLEAN DEFAULT false,
    attendance JSONB DEFAULT '{}',    -- { "session_id": "P/A/E" }
    plus_points JSONB DEFAULT '{}',   -- { "session_id": points }
    grades JSONB DEFAULT '{}',        -- Legacy grade cache
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CURRICULUMS (Materi & Tugas per Batch)
CREATE TABLE IF NOT EXISTS v2_curriculums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_rich TEXT,               -- Rich text / markdown content
    type TEXT NOT NULL DEFAULT 'material',
    module_name TEXT,               -- e.g. "Pertemuan 1"
    due_date TIMESTAMP WITH TIME ZONE,
    video_url TEXT,                 -- YouTube or Zoom link
    quiz_data JSONB DEFAULT '{}',   -- { questions: [...] }
    assets_json JSONB DEFAULT '[]', -- Array of asset links
    is_published BOOLEAN DEFAULT true,
    points_weight INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUBMISSIONS (Tugas & Nilai)
CREATE TABLE IF NOT EXISTS v2_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curriculum_id UUID REFERENCES v2_curriculums(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    file_link TEXT,
    status TEXT DEFAULT 'pending',
    grade INTEGER,
    mentor_feedback TEXT,
    is_feedback_read BOOLEAN DEFAULT false,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. QUIZ RESULTS
CREATE TABLE IF NOT EXISTS v2_quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curriculum_id UUID REFERENCES v2_curriculums(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    answers_json JSONB DEFAULT '{}',
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ATTENDANCE (Opsional - jika ingin tabel terpisah)
CREATE TABLE IF NOT EXISTS v2_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    session_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PERFORMANCE INDEXES (wajib untuk Nano plan)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_v2_memberships_workspace ON v2_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_v2_memberships_profile ON v2_memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_v2_memberships_ws_profile ON v2_memberships(workspace_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_v2_curriculums_workspace ON v2_curriculums(workspace_id);
CREATE INDEX IF NOT EXISTS idx_v2_workspaces_type ON v2_workspaces(type);
CREATE INDEX IF NOT EXISTS idx_v2_submissions_workspace ON v2_submissions(workspace_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_v2_quiz_results_workspace ON v2_quiz_results(workspace_id, profile_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - WAJIB agar query tidak hang
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE v2_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_attendance ENABLE ROW LEVEL SECURITY;

-- POLICIES: Allow authenticated users to read/write
-- (Admin controls are handled at application level)

CREATE POLICY "Authenticated users can read workspaces"
  ON v2_workspaces FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert workspaces"
  ON v2_workspaces FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update workspaces"
  ON v2_workspaces FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete workspaces"
  ON v2_workspaces FOR DELETE
  TO authenticated USING (true);

-- Profiles
CREATE POLICY "Authenticated users can read profiles"
  ON v2_profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON v2_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON v2_profiles FOR UPDATE
  TO authenticated USING (true);

-- Memberships
CREATE POLICY "Authenticated users can read memberships"
  ON v2_memberships FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert memberships"
  ON v2_memberships FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update memberships"
  ON v2_memberships FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete memberships"
  ON v2_memberships FOR DELETE
  TO authenticated USING (true);

-- Curriculums
CREATE POLICY "Authenticated users can read curriculums"
  ON v2_curriculums FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert curriculums"
  ON v2_curriculums FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update curriculums"
  ON v2_curriculums FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete curriculums"
  ON v2_curriculums FOR DELETE
  TO authenticated USING (true);

-- Submissions
CREATE POLICY "Authenticated users can read submissions"
  ON v2_submissions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert submissions"
  ON v2_submissions FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update submissions"
  ON v2_submissions FOR UPDATE
  TO authenticated USING (true);

-- Quiz Results
CREATE POLICY "Authenticated users can read quiz results"
  ON v2_quiz_results FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert quiz results"
  ON v2_quiz_results FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_v2_workspaces_updated_at
    BEFORE UPDATE ON v2_workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DONE! All tables, indexes, RLS policies, and triggers created.
-- ============================================================
