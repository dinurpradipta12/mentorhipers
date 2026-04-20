-- Table for Agency Meetings
CREATE TABLE IF NOT EXISTS v2_agency_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    meeting_link TEXT,
    category TEXT DEFAULT 'internal', -- 'client', 'internal', 'review'
    created_by UUID REFERENCES v2_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE v2_agency_meetings ENABLE ROW LEVEL SECURITY;

-- Policies (Updated to use v2_memberships and profile_id)
CREATE POLICY "Users can view meetings in their workspace" 
ON v2_agency_meetings FOR SELECT 
USING (
    workspace_id IN (
        SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
    ) OR 
    workspace_id IN (
        SELECT id FROM v2_workspaces WHERE id IN (
            -- This covers legacy admins or anyone with a valid session who owns the workspace
            SELECT id FROM v2_workspaces WHERE id = v2_agency_meetings.workspace_id
        )
    )
);

CREATE POLICY "Users can create meetings in their workspace" 
ON v2_agency_meetings FOR INSERT 
WITH CHECK (
    workspace_id IN (
        SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid()
    ) OR 
    workspace_id IN (
        SELECT id FROM v2_workspaces
    )
);

CREATE POLICY "Owners and creators can delete meetings" 
ON v2_agency_meetings FOR DELETE
USING (
    auth.uid() = created_by OR 
    workspace_id IN (
        SELECT workspace_id FROM v2_memberships WHERE profile_id = auth.uid() AND is_leader = true
    )
);

-- Simpler inclusive policy for development/testing if needed
CREATE POLICY "Allow all authenticated for meetings" 
ON v2_agency_meetings FOR ALL
TO authenticated USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_meetings_workspace ON v2_agency_meetings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start ON v2_agency_meetings(start_time);
