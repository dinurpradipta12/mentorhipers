-- MENTORHIPERS V2.2 — KPI SHARED OBJECTIVE MIGRATION
-- Model A: Shared Objective (Gotong Royong)

-- 1. ROADMAP MEMBER ASSIGNMENTS
-- Links workspace members to a specific KPI/Roadmap
CREATE TABLE IF NOT EXISTS v2_agency_roadmap_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID REFERENCES v2_agency_roadmaps(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(roadmap_id, profile_id) -- Prevent duplicate assignments
);

-- 2. ADD assigned_to COLUMN to Milestones
-- Each milestone can be delegated to a specific team member
ALTER TABLE v2_agency_roadmap_milestones 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES v2_profiles(id) ON DELETE SET NULL;

-- 3. ENABLE REALTIME for new table
ALTER PUBLICATION supabase_realtime ADD TABLE v2_agency_roadmap_members;

-- 4. ROW LEVEL SECURITY
ALTER TABLE v2_agency_roadmap_members ENABLE ROW LEVEL SECURITY;

-- Policy: members of the workspace can view roadmap member assignments
CREATE POLICY "Workspace members can view roadmap members"
ON v2_agency_roadmap_members FOR SELECT
USING (
    roadmap_id IN (
        SELECT id FROM v2_agency_roadmaps
        WHERE workspace_id IN (
            SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
        )
    )
);

-- Policy: only admins/owners can manage roadmap member assignments
CREATE POLICY "Admins can manage roadmap members"
ON v2_agency_roadmap_members FOR ALL
USING (
    roadmap_id IN (
        SELECT r.id FROM v2_agency_roadmaps r
        JOIN v2_memberships m ON m.workspace_id = r.workspace_id
        WHERE m.profile_id = auth.uid() AND m.role IN ('owner', 'admin')
    )
);
