import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { getPublicSupabaseConfig } from './config';

type SupabaseCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function createClientWithCookies(
  getAll: () => { name: string; value: string }[],
  setAll: (cookiesToSet: SupabaseCookie[]) => void,
) {
  const { url, anonKey } = getPublicSupabaseConfig();

  return createServerClient(url, anonKey, {
    auth: {
      flowType: 'pkce',
    },
    cookies: { getAll, setAll },
  });
}

/** Use this in Server Components and Server Actions. */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createClientWithCookies(
    () => cookieStore.getAll(),
    (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Server Components cannot mutate cookies. Route handlers and server
        // actions can; this still allows validated reads during rendering.
      }
    },
  );
}

/** Use this in a Route Handler when an auth operation must set response cookies. */
export async function createRouteSupabaseClient(response: NextResponse) {
  const cookieStore = await cookies();

  return createClientWithCookies(
    () => cookieStore.getAll(),
    (cookiesToSet) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    },
  );
}
