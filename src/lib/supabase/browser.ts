'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getPublicSupabaseConfig } from './config';

let browserClient: SupabaseClient | undefined;

/**
 * Browser client deliberately uses only the public anon key. Authorization is
 * enforced by server-side checks and database RLS; the service-role key never
 * reaches this module or a browser bundle.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const { url, anonKey } = getPublicSupabaseConfig();
  browserClient = createBrowserClient(url, anonKey, {
    auth: {
      flowType: 'pkce',
    },
  });

  return browserClient;
}
