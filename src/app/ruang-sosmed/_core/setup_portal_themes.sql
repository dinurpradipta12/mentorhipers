-- Migration: Create Portal Themes table for dynamic UI configuration
CREATE TABLE IF NOT EXISTS v2_portal_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    theme_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    
    -- Visual Customization
    primary_color TEXT DEFAULT 'from-blue-600 to-indigo-700', -- Tailwind gradient classes
    secondary_color TEXT DEFAULT 'text-blue-400',
    background_css TEXT DEFAULT 'bg-[radial-gradient(circle_at_30%_20%,_#1e1b4b_0%,_transparent_50%),radial-gradient(circle_at_70%_80%,_#0f172a_0%,_transparent_50%)]',
    background_base_color TEXT DEFAULT 'bg-slate-950',
    
    -- Content Customization
    hero_title TEXT DEFAULT 'Elevate your Creative Career.',
    hero_subtitle TEXT DEFAULT 'Satu portal terpadu untuk murid Akademi dan tim Agensi B2B. Masuk untuk mengelola tugas, nilai, dan roadmap konten Anda.',
    footer_text TEXT DEFAULT 'V2 Portal Environment (BETA)',
    logo_url TEXT, -- Optional custom logo for moments
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Extra dynamic components (JSON)
    -- e.g., {"show_snow": true, "show_ketupat": false, "custom_cards": [...]}
    config JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies
ALTER TABLE v2_portal_themes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active themes (anonymous users need this to see the login page theme)
CREATE POLICY "Public read for active portal themes" 
ON v2_portal_themes FOR SELECT 
USING (true);

-- Allow admins to manage themes
CREATE POLICY "Admins can manage portal themes" 
ON v2_portal_themes FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM v2_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Insert Default Theme
INSERT INTO v2_portal_themes (
    theme_name, 
    is_active, 
    primary_color, 
    secondary_color, 
    background_css, 
    background_base_color,
    hero_title, 
    hero_subtitle, 
    footer_text
) VALUES (
    'Default Dark Modern',
    true,
    'from-blue-600 to-indigo-700',
    'text-blue-400',
    'bg-[radial-gradient(circle_at_30%_20%,_#1e1b4b_0%,_transparent_50%),radial-gradient(circle_at_70%_80%,_#0f172a_0%,_transparent_50%)]',
    'bg-slate-950',
    'Elevate your Creative Career.',
    'Satu portal terpadu untuk murid Akademi dan tim Agensi B2B. Masuk untuk mengelola tugas, nilai, dan roadmap konten Anda.',
    'V2 Portal Environment (BETA)'
) ON CONFLICT DO NOTHING;
