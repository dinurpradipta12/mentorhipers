ALTER TABLE public.v2_workspaces ADD COLUMN IF NOT EXISTS schedules JSONB DEFAULT '[]'::jsonb;
