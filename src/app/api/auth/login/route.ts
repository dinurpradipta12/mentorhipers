import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createRouteSupabaseClient } from '@/lib/supabase/server';

function safeNextPath(value: FormDataEntryValue | null): string {
  const candidate = typeof value === 'string' ? value : '';
  return candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/ruang-sosmed';
}

function loginFailure(request: Request, nextPath: string, reason: 'invalid' | 'configuration') {
  const url = new URL('/ruang-sosmed/login', request.url);
  url.searchParams.set('error', reason);
  if (nextPath !== '/ruang-sosmed') url.searchParams.set('next', nextPath);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const identifier = String(form.get('identifier') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const nextPath = safeNextPath(form.get('next'));

  // Existing Supabase Auth accounts may have been created under an older
  // password policy. Require a non-empty password here and let Auth remain
  // the authority that validates the actual credential.
  if (identifier.length < 2 || password.length < 1) {
    return loginFailure(request, nextPath, 'invalid');
  }

  try {
    let email = identifier;
    if (!identifier.includes('@')) {
      const { data: profile, error } = await getSupabaseAdminClient()
        .from('v2_profiles')
        .select('email')
        .eq('username', identifier)
        .maybeSingle();

      if (error || !profile?.email) {
        return loginFailure(request, nextPath, 'invalid');
      }
      email = profile.email;
    }

    const destination = new URL(nextPath, request.url);
    const response = NextResponse.redirect(destination, { status: 303 });
    const supabase = await createRouteSupabaseClient(response);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return loginFailure(request, nextPath, 'invalid');
    }

    return response;
  } catch {
    return loginFailure(request, nextPath, 'configuration');
  }
}
