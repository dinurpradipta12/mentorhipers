-- 🔔 RUANG SOSMED NOTIFICATION SYSTEM SCHEMA
-- Run this in your Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS public.v2_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.v2_profiles(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES public.v2_workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('material', 'assignment', 'grade', 'feedback', 'announcement')) NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.v2_notifications ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own notifications" 
ON public.v2_notifications FOR SELECT 
USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own notification read status" 
ON public.v2_notifications FOR UPDATE 
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can insert notifications" 
ON public.v2_notifications FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.v2_profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.v2_notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.v2_notifications(is_read);
