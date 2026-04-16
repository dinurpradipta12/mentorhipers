-- ======================================================================================
-- MIGRATION SCRIPT (Untuk V2): Fitur Group Assignments & Custom Grading Matrix
-- ======================================================================================

-- Mohon maaf sebelumnya, ternyata kamu menggunakan arsitektur V2 LMS (Ruang Sosmed), 
-- di mana tabel tugas bernama `v2_curriculums` dan penilaiannya di `v2_submissions`.

-- 1. Membuat Tabel v2_assignment_groups (Untuk grup custom/kelompok penugasan)
CREATE TABLE IF NOT EXISTS public.v2_assignment_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.v2_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) -- ID Mentor/Admin
);

-- 2. Membuat Tabel Relasi v2_assignment_group_members (Anggota grup custom)
CREATE TABLE IF NOT EXISTS public.v2_assignment_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.v2_assignment_groups(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.v2_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, profile_id)
);

-- 3. Modifikasi tabel Tugas/Kurikulum (v2_curriculums)
ALTER TABLE public.v2_curriculums
ADD COLUMN IF NOT EXISTS assignment_group_id UUID REFERENCES public.v2_assignment_groups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS grading_mode VARCHAR(20) DEFAULT 'auto'; -- 'auto' atau 'manual'

-- 4. Modifikasi tabel Pengumpulan/Penilaian (v2_submissions)
-- Gunanya: mencatat apakah submission ini di-clone dari ketua, dan siapa ketuanya
ALTER TABLE public.v2_submissions
ADD COLUMN IF NOT EXISTS is_cloned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cloned_from_submission_id UUID REFERENCES public.v2_submissions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS submitted_by_profile_id UUID REFERENCES public.v2_profiles(id) ON DELETE SET NULL;


-- ======================================================================================
-- RLS (Row Level Security)
-- ======================================================================================
ALTER TABLE public.v2_assignment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_assignment_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON public.v2_assignment_groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.v2_assignment_group_members FOR ALL USING (auth.role() = 'authenticated');
