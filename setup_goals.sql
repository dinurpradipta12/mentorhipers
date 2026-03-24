-- TABEL GOALS & TASKS UNTUK MENTEE
-- Jalankan ini di SQL Editor Supabase Mas

CREATE TABLE IF NOT EXISTS mentee_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Action', -- 'Vision', 'Action', 'Learning', 'Personal Brand'
    status TEXT DEFAULT 'To Do', -- 'To Do', 'In Progress', 'Under Review', 'Completed', 'Needs Revision'
    priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    deadline TIMESTAMP WITH TIME ZONE,
    evidence_link TEXT, -- Link bukti pengerjaan dari mentee
    mentor_feedback TEXT, -- Catatan dari Mas/Admin
    milestones JSONB DEFAULT '[]'::jsonb, -- Sub-tasks list: [{"label": "Step 1", "done": false}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AKTIFKAN REALTIME UNTUK TABEL INI
-- Catatan: Jika error, pastikan tabel disertakan di publication 'supabase_realtime' lewat Dashboard Dashboard Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE mentee_tasks;
