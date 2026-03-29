import { createClient } from '@supabase/supabase-js';

// Helper to check if a string is a valid URL
const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// ================================
// V1 CLIENT (Legacy Admin System)
// ================================
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Use placeholder if URL is missing or invalid to prevent build crash
const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co';
const supabaseKey = (rawUrl && rawKey) ? rawKey : 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ================================
// V2 CLIENT (LMS / Batch System)
// ================================
const rawV2Url = process.env.NEXT_PUBLIC_SUPABASE_V2_URL || '';
const rawV2Key = process.env.NEXT_PUBLIC_SUPABASE_V2_ANON_KEY || '';

const supabaseV2Url = isValidUrl(rawV2Url) ? rawV2Url : supabaseUrl;
const supabaseV2Key = (rawV2Url && rawV2Key) ? rawV2Key : supabaseKey;

export const supabaseV2 = createClient(supabaseV2Url, supabaseV2Key);
