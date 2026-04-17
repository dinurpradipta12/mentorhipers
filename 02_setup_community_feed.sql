-- Create Table for Community Feed (Announcements & Articles)
CREATE TABLE IF NOT EXISTS v2_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE, -- Target Batch
    creator_id UUID REFERENCES v2_profiles(id),
    category TEXT DEFAULT 'Umum', -- 'Pengumuman', 'Artikel', 'Tips', 'Update'
    title TEXT NOT NULL,
    summary TEXT, -- Short description for feed card
    content TEXT, -- Long article content
    image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb, -- Additional images for gallery
    reactions JSONB DEFAULT '[]'::jsonb, -- Array of profile_ids who liked
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Announcements
ALTER TABLE v2_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for authenticated users" ON v2_announcements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for admins" ON v2_announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM v2_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'mentor')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM v2_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'mentor')
        )
    );

-- Add column to v2_curriculums if missing (just in case for transition)
-- ALTER TABLE v2_curriculums ADD COLUMN IF NOT EXISTS module_category TEXT;
-- Storage Bucket for Community Board Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lms', 'lms', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'lms');
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lms' AND auth.uid() IN (SELECT id FROM v2_profiles WHERE role IN ('admin', 'mentor')));
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'lms' AND auth.uid() IN (SELECT id FROM v2_profiles WHERE role IN ('admin', 'mentor')));
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'lms' AND auth.uid() IN (SELECT id FROM v2_profiles WHERE role IN ('admin', 'mentor')));
