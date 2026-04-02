import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin client for V1 (Legacy)
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

// Admin client for V2 (LMS / Batch System)
const supabaseV2Url = process.env.NEXT_PUBLIC_SUPABASE_V2_URL || '';
const supabaseV2ServiceKey = process.env.SUPABASE_V2_SERVICE_ROLE_KEY || '';

export const supabaseAdminV2 = (supabaseV2Url && supabaseV2ServiceKey)
  ? createClient(supabaseV2Url, supabaseV2ServiceKey, {
      auth: {
        persistSession: false
      }
    })
  : null;
