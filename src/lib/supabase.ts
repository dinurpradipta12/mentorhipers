import { createClient } from '@supabase/supabase-js';

// ================================
// V1 CLIENT (Legacy Admin System)
// ================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ================================
// V2 CLIENT (LMS / Batch System)
// ================================
const supabaseV2Url = process.env.NEXT_PUBLIC_SUPABASE_V2_URL || supabaseUrl;
const supabaseV2Key = process.env.NEXT_PUBLIC_SUPABASE_V2_ANON_KEY || supabaseKey;

export const supabaseV2 = createClient(supabaseV2Url, supabaseV2Key);
