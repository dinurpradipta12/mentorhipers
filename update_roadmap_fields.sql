-- TAMBAH KOLOM UNTUK KUSTOMISASI ROADMAP PER MENTEE
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS vision_statement TEXT DEFAULT 'Membangun personal brand yang Berpengaruh.',
ADD COLUMN IF NOT EXISTS roadmap_focus JSONB DEFAULT '["Market Authority", "Consistent Value Rendering", "Monetization Readiness"]'::jsonb,
ADD COLUMN IF NOT EXISTS roadmap_color TEXT DEFAULT '#0F172A';
