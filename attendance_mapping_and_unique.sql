-- 1. Ensure students can only join a batch once
ALTER TABLE v2_memberships DROP CONSTRAINT IF EXISTS unique_student_batch;
ALTER TABLE v2_memberships ADD CONSTRAINT unique_student_batch UNIQUE (workspace_id, profile_id);

-- 2. Optional: Add labels to attendance if we want to store them in DB, 
-- but we are doing it dynamically in UI for now to stay flexible.
