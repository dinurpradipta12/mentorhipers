-- ADD COLUMN FOR FEATURE TOGGLES PER MENTEE
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS enabled_features JSONB DEFAULT '{"dashboard": true, "content_plan": true, "timeline": true, "reports": true}'::jsonb;
