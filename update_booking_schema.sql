-- Add booking settings to mentor profile
ALTER TABLE mentor_profile 
ADD COLUMN IF NOT EXISTS booking_settings JSONB DEFAULT '{"start_hour": 9, "end_hour": 21, "working_days": [1, 2, 3, 4, 5]}'::jsonb;
