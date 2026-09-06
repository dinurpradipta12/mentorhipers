import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/ruang-sosmed/login', request.url), { status: 303 });
  const supabase = await createRouteSupabaseClient(response);
  await supabase.auth.signOut();
  return response;
}
