import { createClient } from '@supabase/supabase-js';

// ================================
// V1 CLIENT (Legacy Admin System)
// ================================
// Use dummy URL as fallback during build phase to prevent crash
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ================================
// V2 CLIENT (LMS / Batch System)
// ================================
const supabaseV2Url = process.env.NEXT_PUBLIC_SUPABASE_V2_URL || supabaseUrl;
const supabaseV2Key = process.env.NEXT_PUBLIC_SUPABASE_V2_ANON_KEY || supabaseKey;

export const supabaseV2 = createClient(supabaseV2Url, supabaseV2Key);
