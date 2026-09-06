import 'server-only';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';

// Transitional server-only aliases for legacy Server Actions. No client module
// may import this file.
export const supabaseAdmin = getSupabaseAdminClient();
export const supabaseAdminV2 = supabaseAdmin;
