ALTER TABLE v2_submissions ADD COLUMN IF NOT EXISTS criteria_scores JSONB DEFAULT '{}'::jsonb;
ALTER TABLE v2_memberships ADD COLUMN IF NOT EXISTS plus_points JSONB DEFAULT '{}'::jsonb;
