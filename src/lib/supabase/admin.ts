import 'server-only';

/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase types are generated only after the additive live schema migration. */

import { createClient } from '@supabase/supabase-js';
import { getPublicSupabaseConfig, getServiceRoleKey } from './config';

type ServerSupabaseClient = ReturnType<typeof createClient<any>>;

let adminClient: ServerSupabaseClient | undefined;

/**
 * Service-role access is intentionally centralized here. It may only be
 * imported by server code after the caller has validated identity and role.
 */
export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  const { url } = getPublicSupabaseConfig();
  adminClient = createClient<any>(url, getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
}
