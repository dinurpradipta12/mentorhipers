-- MENTORHIPERS V2.1 AGENCY WORKSPACE EXPANSION
-- Adding tables for collaborative B2B workflow

-- 1. AGENCY CONTENT PLANS (Collaborative Content Workflow)
CREATE TABLE IF NOT EXISTS v2_agency_content_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    headline TEXT,
    description TEXT,
    platform TEXT, -- 'tiktok', 'instagram', 'linkedin', 'short', 'reel', 'others'
    content_pillar TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'review', 'approved', 'scheduled', 'published'
    content_url TEXT,
    script_url TEXT,
    result_url TEXT,
    published_url TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES v2_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AGENCY ROADMAPS (Strategic Strategic Goals / KPIs)
CREATE TABLE IF NOT EXISTS v2_agency_roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    progress INTEGER DEFAULT 0, -- 0 to 100
    status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AGENCY ACTIVITIES (Centralized Activity Log)
CREATE TABLE IF NOT EXISTS v2_agency_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL, -- e.g., 'created a new content draft', 'updated the monthly roadmap'
    target_id UUID, -- Optional: ID of the related content/roadmap
    target_type TEXT, -- Optional: 'content', 'roadmap'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE v2_agency_content_plans, v2_agency_roadmaps, v2_agency_activities;

-- 5. AGENCY ROADMAP MILESTONES (Sub-tasks for Strategic Phases)
CREATE TABLE IF NOT EXISTS v2_agency_roadmap_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID REFERENCES v2_agency_roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE v2_agency_roadmap_milestones;
