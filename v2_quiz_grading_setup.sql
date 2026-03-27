-- V2.1 QUIZ ENGINE & DYNAMIC GRADING MATRIX
-- Menyiapkan pilar penilaian yang fleksibel sesuai permintaan User.

-- 1. Tambah kolom quiz_data ke curriculums untuk menyimpan struktur soal
ALTER TABLE v2_curriculums ADD COLUMN IF NOT EXISTS quiz_data JSONB;

-- 2. Tambah kolom pendukung LMS ke curriculums
ALTER TABLE v2_curriculums ADD COLUMN IF NOT EXISTS module_name TEXT;
ALTER TABLE v2_curriculums ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE v2_curriculums ADD COLUMN IF NOT EXISTS content_rich TEXT;
ALTER TABLE v2_curriculums ADD COLUMN IF NOT EXISTS assets_json JSONB DEFAULT '[]'::jsonb;

-- 3. Tambah kolom grades ke memberships untuk simpan nilai per individu
ALTER TABLE v2_memberships ADD COLUMN IF NOT EXISTS grades JSONB DEFAULT '{}'::jsonb;

-- 4. Tambah kolom matrix_config ke workspaces untuk atur pilar penilaian yang dinamis
ALTER TABLE v2_workspaces ADD COLUMN IF NOT EXISTS matrix_config JSONB DEFAULT '{
  "post_test_count": 6,
  "assignment_count": 3,
  "group_challenge_count": 4,
  "weights": { "post_test": 0.2, "assignment": 0.3, "group_challenge": 0.4, "keaktifan": 0.1 }
}'::jsonb;

-- 5. Tabel Quiz Results untuk track jawaban murid per attempt (Audit Trail)
CREATE TABLE IF NOT EXISTS v2_quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curriculum_id UUID REFERENCES v2_curriculums(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    answers_json JSONB,
    score INTEGER,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AKTIFKAN REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE v2_quiz_results;
