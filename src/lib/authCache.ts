/**
 * Auth Session Cache
 * 
 * Problem: supabase.auth.getSession() makes a network request to Supabase Auth server
 * every single time it's called. With 7+ components each calling it on mount, this
 * generates dozens of auth requests per page load — exhausting the free plan limit.
 * 
 * Solution: Cache the session in module memory. getSession() is only called ONCE
 * per browser session. All components read from the cache instead.
 * 
 * Cache TTL: 4 minutes (Supabase JWT expires every 60 min, so 4 min is safe)
 */

import { supabaseV2 as supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

interface CachedSession {
  session: Session | null;
  timestamp: number;
}

const CACHE_TTL_MS = 4 * 60 * 1000; // 4 minutes

let cache: CachedSession | null = null;
let pendingPromise: Promise<Session | null> | null = null;

/**
 * Get the current V2 session — cached for 4 minutes.
 * Multiple simultaneous callers share a single in-flight request.
 */
export async function getCachedSession(): Promise<Session | null> {
  // Return from cache if still valid
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.session;
  }

  // If a request is already in-flight, reuse it (prevents parallel duplicate calls)
  if (pendingPromise) {
    return pendingPromise;
  }

  // Make the actual network call — only once
  pendingPromise = supabase.auth.getSession().then(({ data: { session } }) => {
    cache = { session, timestamp: Date.now() };
    pendingPromise = null;
    return session;
  }).catch(() => {
    pendingPromise = null;
    return null;
  });

  return pendingPromise;
}

/**
 * Invalidate the cache — call this after signIn or signOut.
 */
export function invalidateSessionCache(): void {
  cache = null;
  pendingPromise = null;
}

export interface BootcampAccess {
  user: User | null;
  isStaff: boolean;
  error: string | null;
}

/**
 * Verifies the V2 access token with Supabase Auth, then asks the database for
 * the Bootcamp staff role used by the live RLS policies. This only controls
 * client navigation; RLS remains the authority for every data request.
 */
export async function getBootcampAccess(): Promise<BootcampAccess> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return {
      user: null,
      isStaff: false,
      error: userError?.message ?? 'Sesi V2 tidak ditemukan.',
    };
  }

  const { data: isStaff, error: roleError } = await supabase.rpc('has_bootcamp_staff_role');

  return {
    user,
    isStaff: !roleError && isStaff === true,
    error: roleError?.message ?? null,
  };
}

/**
 * Kept as a compatibility export for legacy components. Browser storage is
 * never an authority for administrative access.
 */
export function isLegacyAdmin(): boolean {
  return false;
}
