-- RUN THIS IN SUPABASE SQL EDITOR
-- Add tablet_zoom column to app_settings if it doesn't already exist.

ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS tablet_zoom TEXT DEFAULT '0.8';
