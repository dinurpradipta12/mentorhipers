import 'server-only';

import { cache } from 'react';
import { hasPlatformAdminRole } from '@/lib/auth/roles';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export type Viewer = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  legacyProfileRole: string | null;
  platformRoles: string[];
  isAdmin: boolean;
};

function isMissingRoleTable(error: { code?: string } | null): boolean {
  // `42P01` is returned by PostgreSQL and `PGRST205` by PostgREST when the
  // additive role migration has not reached the target project yet.
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

/**
 * `auth.getUser()` validates the access token against Supabase Auth. Do not
 * replace it with `getSession()` for server-side authorization decisions.
 */
export const getCurrentViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const admin = getSupabaseAdminClient();
  const { data: profile } = await admin
    .from('v2_profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle();

  const { data: assignments, error: roleError } = await admin
    .from('platform_role_assignments')
    .select('role')
    .eq('profile_id', user.id)
    .is('revoked_at', null);

  const platformRoles = isMissingRoleTable(roleError)
    ? []
    : (assignments ?? []).map((assignment) => assignment.role);
  const legacyProfileRole = profile?.role ?? null;
  // `v2_profiles.role` is retained as historical/profile data only. The live
  // legacy schema has broad access concerns, so it must never grant access to
  // a server-side administrator capability. Only the additive role-assignment
  // table is authoritative once an operator explicitly bootstraps it.
  const isAdmin = hasPlatformAdminRole(platformRoles);

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    legacyProfileRole,
    platformRoles,
    isAdmin,
  };
});

export async function assertCurrentAdmin(): Promise<Viewer> {
  const viewer = await getCurrentViewer();
  if (!viewer || !viewer.isAdmin) {
    throw new Error('FORBIDDEN');
  }

  return viewer;
}
