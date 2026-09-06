'use client';

import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

/**
 * Transitional exports for legacy components while routes are rebuilt. They
 * point to one confirmed project and never fall back to another project.
 */
export const supabase = createBrowserSupabaseClient();
export const supabaseV2 = supabase;
