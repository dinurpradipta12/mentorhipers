-- Ruang Campus: database-backed platform roles.
--
-- This migration is additive. It intentionally grants no user any role. Run the
-- documented bootstrap step only after an operator explicitly identifies the
-- existing Supabase Auth account that should administer Ruang Campus.

create table if not exists public.platform_role_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.v2_profiles(id) on delete restrict,
  role text not null,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  note text
);

-- A normal migration is transactional, but this protects a previously created
-- table from an interrupted/manual deployment as well. PostgreSQL has no
-- `add constraint if not exists`, so inspect the catalog first.
do $platform_roles_foreign_keys$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'platform_role_assignments_profile_id_fkey'
      and conrelid = 'public.platform_role_assignments'::regclass
  ) then
    alter table public.platform_role_assignments
      add constraint platform_role_assignments_profile_id_fkey
      foreign key (profile_id) references public.v2_profiles(id) on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'platform_role_assignments_granted_by_fkey'
      and conrelid = 'public.platform_role_assignments'::regclass
  ) then
    alter table public.platform_role_assignments
      add constraint platform_role_assignments_granted_by_fkey
      foreign key (granted_by) references auth.users(id) on delete set null;
  end if;
end
$platform_roles_foreign_keys$;

do $platform_roles_constraints$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'platform_role_assignments_role_check'
      and conrelid = 'public.platform_role_assignments'::regclass
  ) then
    alter table public.platform_role_assignments
      add constraint platform_role_assignments_role_check
      check (role in ('admin', 'mentor'));
  end if;
end
$platform_roles_constraints$;

create unique index if not exists platform_role_assignments_active_role_key
  on public.platform_role_assignments (profile_id, role)
  where revoked_at is null;

-- These non-partial indexes support foreign-key maintenance as well as role
-- checks. The partial index above remains the fast path for active roles.
create index if not exists platform_role_assignments_profile_id_idx
  on public.platform_role_assignments (profile_id);
create index if not exists platform_role_assignments_granted_by_idx
  on public.platform_role_assignments (granted_by)
  where granted_by is not null;
create index if not exists platform_role_assignments_active_profile_idx
  on public.platform_role_assignments (profile_id)
  where revoked_at is null;

alter table public.platform_role_assignments enable row level security;

-- There are deliberately no direct browser policies. Admin role management is
-- served through validated server code, and service-role access remains server-only.

create or replace function public.has_platform_role(allowed_roles text[] default array['admin']::text[])
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $has_platform_role$
  select exists (
    select 1
    from public.platform_role_assignments assignment
    where assignment.profile_id = (select auth.uid())
      and assignment.revoked_at is null
      and assignment.role = any (allowed_roles)
  );
$has_platform_role$;

revoke all on function public.has_platform_role(text[]) from public;
grant execute on function public.has_platform_role(text[]) to authenticated;
