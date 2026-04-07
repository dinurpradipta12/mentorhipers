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
import type { Session } from '@supabase/supabase-js';

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

/**
 * Check if user is a legacy admin (no auth request needed).
 */
export function isLegacyAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('v2_legacy_admin') === 'true';
}
