import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_V2_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_V2_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'SUPABASE_V2_SERVICE_ROLE_KEY is missing.' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    const { fullName, username, password, workspaceId } = await req.json();

    if (!fullName || !username || !password || !workspaceId) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Create Auth User
    const syntheticEmail = `${username.toLowerCase().trim()}@mentorhipers.local`;
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        display_name: fullName, // Added for Supabase Auth Dashboard visibility
        username: username.toLowerCase().trim()
      }
    });

    if (authError) return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
    if (!authUser.user) return NextResponse.json({ success: false, error: 'Failed to create auth user.' }, { status: 500 });

    // 2. Create Profile
    const { error: profileError } = await supabaseAdmin.from('v2_profiles').upsert({
      id: authUser.user.id,
      full_name: fullName,
      username: username.toLowerCase().trim(),
      role: 'student'
    });

    if (profileError) return NextResponse.json({ success: false, error: `DB Error: ${profileError.message}` }, { status: 500 });

    // 3. Create Membership
    const { error: memberError } = await supabaseAdmin.from('v2_memberships').insert({
      profile_id: authUser.user.id,
      workspace_id: workspaceId,
      role: 'student'
    });

    if (memberError) return NextResponse.json({ success: false, error: memberError.message }, { status: 500 });

    return NextResponse.json({ success: true, userId: authUser.user.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unknown error.' }, { status: 500 });
  }
}
