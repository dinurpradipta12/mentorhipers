import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getPublicSupabaseConfig } from '@/lib/supabase/config';

/**
 * Refreshes Supabase cookies for authenticated application routes. Route-level
 * authorization still calls `auth.getUser()` server-side; Proxy is not trusted
 * as the authorization boundary. Public Webinar routes are deliberately not
 * matched so they never show an authentication loading state.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getPublicSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/ruang-sosmed/:path*', '/admin/:path*', '/api/auth/:path*'],
};
