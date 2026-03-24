-- RUN THIS IN SUPABASE SQL EDITOR
-- To fix the dashboard stats being zero

ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Aktif';

-- Optional: Update some existing clients if you want to see it in action
-- UPDATE clients SET status = 'Completed' WHERE id = 'some-uuid';
