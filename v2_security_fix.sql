-- MENTORHIPERS SECURITY LOCKDOWN (RLS POLICIES)
-- Jalankan ini di SQL Editor Supabase untuk mengunci data Anda dari akses publik.

-- ---------------------------------------------------------
-- 1. AKTIFKAN ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentee_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_attendance ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- 2. HAPUS SEMUA POLICY LAMA (Jika ada)
-- ---------------------------------------------------------
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'v2_%' OR table_name IN ('app_settings', 'mentee_tasks'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admin full access" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public read access" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Student read own" ON %I', t);
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 3. POLICY UNTUK ADMIN (AKSES PENUH)
-- Ganti 'student' dengan 'admin' di table v2_profiles untuk akun Anda.
-- ---------------------------------------------------------
CREATE POLICY "Admin full access" ON v2_profiles FOR ALL USING (auth.uid() IN (SELECT id FROM v2_profiles WHERE role = 'admin'));
CREATE POLICY "Admin full access" ON v2_workspaces FOR ALL USING (auth.uid() IN (SELECT id FROM v2_profiles WHERE role = 'admin'));
CREATE POLICY "Admin full access" ON v2_memberships FOR ALL USING (auth.uid() IN (SELECT id FROM v2_profiles WHERE role = 'admin'));
CREATE POLICY "Admin full access" ON v2_curriculums FOR ALL USING (auth.uid() IN (SELECT id FROM v2_profiles WHERE role = 'admin'));
CREATE POLICY "Admin full access" ON v2_submissions FOR ALL USING (auth.uid() IN (SELECT id FROM v2_profiles WHERE role = 'admin'));
CREATE POLICY "Admin full access" ON v2_attendance FOR ALL USING (auth.uid() IN (SELECT id FROM v2_profiles WHERE role = 'admin'));
CREATE POLICY "Admin full access" ON app_settings FOR ALL USING (auth.uid() IN (SELECT id FROM v2_profiles WHERE role = 'admin'));
CREATE POLICY "Admin full access" ON mentee_tasks FOR ALL USING (auth.uid() IN (SELECT id FROM v2_profiles WHERE role = 'admin'));

-- ---------------------------------------------------------
-- 4. POLICY UNTUK MURID (READ-ONLY AKSES TERBATAS)
-- ---------------------------------------------------------

-- Murid bisa lihat profil mereka sendiri dan profil mentor/admin
CREATE POLICY "Student read profiles" ON v2_profiles FOR SELECT USING (true);

-- Murid bisa lihat workspace di mana mereka terdaftar
CREATE POLICY "Student read workspace" ON v2_workspaces FOR SELECT USING (
    id IN (SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid())
);

-- Murid bisa lihat kurikulum di workspace mereka
CREATE POLICY "Student read curriculum" ON v2_curriculums FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid())
);

-- Murid bisa lihat pengumpulan tugas mereka sendiri
CREATE POLICY "Student handle own submissions" ON v2_submissions FOR ALL USING (
    profile_id = auth.uid()
);

-- Untuk app_settings V1 (Tampilan logo/nama app) biarkan bisa dibaca publik/auth
CREATE POLICY "Public read settings" ON app_settings FOR SELECT USING (true);
