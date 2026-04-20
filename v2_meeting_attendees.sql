-- MENTORHIPERS V2.3 — MEETING ATTENDEES MIGRATION
-- Tracks which workspace members are invited to a specific sync/meeting

CREATE TABLE IF NOT EXISTS v2_agency_meeting_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES v2_agency_meetings(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES v2_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, profile_id)
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE v2_agency_meeting_attendees;

-- Enable RLS
ALTER TABLE v2_agency_meeting_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: members of the workspace can view roadmap member assignments
CREATE POLICY "Workspace members can view meeting attendees"
ON v2_agency_meeting_attendees FOR SELECT
USING (
    meeting_id IN (
        SELECT id FROM v2_agency_meetings
        WHERE workspace_id IN (
            SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
        )
    )
);

-- Policy: creators or workspace admins can manage attendees
CREATE POLICY "Admins can manage meeting attendees"
ON v2_agency_meeting_attendees FOR ALL
USING (
    meeting_id IN (
        SELECT m.id FROM v2_agency_meetings m
        JOIN v2_memberships mem ON mem.workspace_id = m.workspace_id
        WHERE mem.profile_id = auth.uid() AND mem.role IN ('owner', 'admin')
    )
);
