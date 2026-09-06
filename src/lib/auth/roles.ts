export type PlatformRole = 'admin' | 'mentor';

/**
 * Keep the authorization predicate independent from legacy profile fields.
 * Callers must pass role assignments that were read server-side from
 * `platform_role_assignments` for the authenticated user.
 */
export function hasPlatformAdminRole(roles: readonly string[]): boolean {
  return roles.some((role) => role === 'admin' || role === 'mentor');
}
