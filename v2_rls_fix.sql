-- MENTORHIPERS V2.4 — RLS & PERMISSION FIX
-- Resolving 401 Unauthorized for KPI and Meeting bridge tables

-- 1. Ensure the authenticated role has permissions on the new tables
GRANT ALL ON v2_agency_roadmap_members TO authenticated;
GRANT ALL ON v2_agency_roadmap_members TO service_role;
GRANT ALL ON v2_agency_meeting_attendees TO authenticated;
GRANT ALL ON v2_agency_meeting_attendees TO service_role;

-- 2. Drop existing restrictive policies and replace with workspace-based access
DROP POLICY IF EXISTS "Admins can manage roadmap members" ON v2_agency_roadmap_members;
DROP POLICY IF EXISTS "Admins can manage meeting attendees" ON v2_agency_meeting_attendees;

-- Policy: Any member of the workspace can manage KPI members
-- (Consistent with a collaborative Agency environment, can be restricted later if needed)
CREATE POLICY "Workspace members can manage roadmap members"
ON v2_agency_roadmap_members FOR ALL
USING (
    roadmap_id IN (
        SELECT id FROM v2_agency_roadmaps
        WHERE workspace_id IN (
            SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
        )
    )
)
WITH CHECK (
    roadmap_id IN (
        SELECT id FROM v2_agency_roadmaps
        WHERE workspace_id IN (
            SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
        )
    )
);

-- Policy: Any member of the workspace can manage meeting attendees
CREATE POLICY "Workspace members can manage meeting attendees"
ON v2_agency_meeting_attendees FOR ALL
USING (
    meeting_id IN (
        SELECT id FROM v2_agency_meetings
        WHERE workspace_id IN (
            SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
        )
    )
)
WITH CHECK (
    meeting_id IN (
        SELECT id FROM v2_agency_meetings
        WHERE workspace_id IN (
            SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
        )
    )
);

-- 3. Add explicit INSERT policies for milestones as well just in case
DROP POLICY IF EXISTS "Admins can manage milestones" ON v2_agency_roadmap_milestones;
CREATE POLICY "Workspace members can manage milestones"
ON v2_agency_roadmap_milestones FOR ALL
USING (
    roadmap_id IN (
        SELECT id FROM v2_agency_roadmaps
        WHERE workspace_id IN (
            SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
        )
    )
)
WITH CHECK (
    roadmap_id IN (
        SELECT id FROM v2_agency_roadmaps
        WHERE workspace_id IN (
            SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
        )
    )
);
