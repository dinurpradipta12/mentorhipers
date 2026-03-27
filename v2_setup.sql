-- MENTORHIPERS V2.0 DATABASE ARCHITECTURE (PARALLEL TABLES)
-- Jalankan ini di SQL Editor Supabase untuk mengaktifkan fitur Cohort/Batch & B2B Team.

-- 1. RUANGAN KERJA (BATCH ATAU AGENCY)
CREATE TABLE IF NOT EXISTS v2_workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'batch', -- 'batch' (LMS) atau 'agency' (B2B Workspace)
    description TEXT,
    logo_url TEXT,
    max_members INTEGER DEFAULT 50, -- Untuk batch, misal max 50
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MANAGEMENT USER V2 (Terintegrasi ke Auth atau dikelola Admin)
-- Menggunakan table baru agar tidak merusak auth user V1 yang nempel di profile
CREATE TABLE IF NOT EXISTS v2_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'student', -- 'student', 'team_member', 'admin', 'moderator'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MEMBERSHIP & GROUPING (Siapa masuk Batch mana, dan dapet kelompok apa)
CREATE TABLE IF NOT EXISTS v2_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    group_name TEXT, -- Nama Kelompok (Misal: 'Kelompok A') khusus Batch
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. KURIKULUM (Tugas per Batch/Workspace)
-- Satu batch punya tugas yang sama.
CREATE TABLE IF NOT EXISTS v2_curriculums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'post_test', 'individual_assignment', 'group_assignment', 'challenge', 'presentation'
    due_date TIMESTAMP WITH TIME ZONE,
    points_weight INTEGER DEFAULT 10, -- Bobot nilai (opsional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUBMISSIONS & PENILAIAN (Pusat Nilai Skema A)
CREATE TABLE IF NOT EXISTS v2_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curriculum_id UUID REFERENCES v2_curriculums(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE, 
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    file_link TEXT, -- Link tugas atau jawaban post-test
    status TEXT DEFAULT 'pending', -- 'pending', 'graded', 'revision'
    grade INTEGER, -- 0-100
    mentor_feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ABSENSI / KEHADIRAN
CREATE TABLE IF NOT EXISTS v2_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    session_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'present', -- 'present', 'absent', 'excused'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AKTIFKAN REALTIME UNTUK SEMUA TABEL V2
ALTER PUBLICATION supabase_realtime ADD TABLE v2_workspaces, v2_profiles, v2_memberships, v2_curriculums, v2_submissions, v2_attendance;
