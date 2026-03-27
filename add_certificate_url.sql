-- Run this in Supabase SQL Editor
ALTER TABLE "public"."v2_memberships"
ADD COLUMN IF NOT EXISTS "certificate_url" TEXT DEFAULT NULL;
