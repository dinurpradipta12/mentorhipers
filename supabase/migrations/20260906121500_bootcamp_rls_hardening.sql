-- Ruang Campus: Bootcamp RLS hardening.
--
-- Preconditions:
-- 1. A full backup and immutable grade/attendance snapshot have been verified.
-- 2. 20260906120000_platform_roles.sql has been applied.
-- 3. Anonymous, student, and approved admin/mentor smoke tests have been
--    rehearsed on a safe copy of the live schema.
--
-- This migration changes only authorization policies, supporting indexes, and
-- write-guard triggers on the existing Bootcamp tables. It does not rename,
-- truncate, copy, or delete any historical row. Apply it only with an approved
-- change window because enabling RLS replaces the ineffective legacy policy
-- behavior for direct browser/database clients.

-- The role-assignment helper is the only source of platform authorization.
-- It is created by the preceding additive migration and uses a pinned path.
create or replace function public.has_bootcamp_staff_role()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $has_bootcamp_staff_role$
  select public.has_platform_role(array['admin', 'mentor']::text[])
$has_bootcamp_staff_role$;

create or replace function public.has_bootcamp_admin_role()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $has_bootcamp_admin_role$
  select public.has_platform_role(array['admin']::text[])
$has_bootcamp_admin_role$;

create or replace function public.is_bootcamp_member(
  p_workspace_id uuid,
  p_profile_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $is_bootcamp_member$
  select exists (
    select 1
    from public.v2_memberships membership
    where membership.workspace_id = p_workspace_id
      and membership.profile_id = coalesce(p_profile_id, (select auth.uid()))
      and coalesce(membership.role, 'member') <> 'removed'
  )
$is_bootcamp_member$;

create or replace function public.can_submit_bootcamp_curriculum(
  p_workspace_id uuid,
  p_curriculum_id uuid,
  p_profile_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $can_submit_bootcamp_curriculum$
  select exists (
    select 1
    from public.v2_memberships membership
    join public.v2_curriculums curriculum
      on curriculum.id = p_curriculum_id
     and curriculum.workspace_id = membership.workspace_id
    where membership.workspace_id = p_workspace_id
      and membership.profile_id = coalesce(p_profile_id, (select auth.uid()))
      and lower(coalesce(curriculum.type, '')) in ('post_test', 'quiz')
      and lower(coalesce(curriculum.is_published, '')) in ('true', 't', '1', 'yes')
  )
$can_submit_bootcamp_curriculum$;

revoke all on function public.has_bootcamp_staff_role() from public;
revoke all on function public.has_bootcamp_admin_role() from public;
revoke all on function public.is_bootcamp_member(uuid, uuid) from public;
revoke all on function public.can_submit_bootcamp_curriculum(uuid, uuid, uuid) from public;
grant execute on function public.has_bootcamp_staff_role() to authenticated;
grant execute on function public.has_bootcamp_admin_role() to authenticated;
grant execute on function public.is_bootcamp_member(uuid, uuid) to authenticated;
grant execute on function public.can_submit_bootcamp_curriculum(uuid, uuid, uuid) to authenticated;

-- These indexes support the membership checks used by RLS and reduce the
-- chance of a policy rollout causing sequential scans on larger batches.
create index if not exists v2_memberships_workspace_profile_idx
  on public.v2_memberships (workspace_id, profile_id);
create index if not exists v2_memberships_profile_workspace_idx
  on public.v2_memberships (profile_id, workspace_id);
create index if not exists v2_curriculums_workspace_published_idx
  on public.v2_curriculums (workspace_id, is_published);
create index if not exists v2_submissions_workspace_profile_idx
  on public.v2_submissions (workspace_id, profile_id, created_at desc);
create index if not exists v2_submissions_curriculum_profile_idx
  on public.v2_submissions (curriculum_id, profile_id, created_at desc);
create index if not exists v2_quiz_results_workspace_profile_idx
  on public.v2_quiz_results (workspace_id, profile_id, created_at desc);
create index if not exists v2_quiz_results_curriculum_profile_unique
  on public.v2_quiz_results (curriculum_id, profile_id)
  where curriculum_id is not null and profile_id is not null;
create index if not exists v2_assignment_groups_workspace_idx
  on public.v2_assignment_groups (workspace_id, created_at desc);
create index if not exists v2_assignment_group_members_profile_group_idx
  on public.v2_assignment_group_members (profile_id, group_id);
create index if not exists v2_announcements_workspace_created_idx
  on public.v2_announcements (workspace_id, created_at desc);
create index if not exists v2_notifications_profile_workspace_idx
  on public.v2_notifications (profile_id, workspace_id, created_at desc);

-- Legacy policies are not safe once RLS is enabled. Drop only policies on the
-- listed Bootcamp tables; Webinar and Agency policies are intentionally not
-- touched by this migration.
do $drop_bootcamp_policies$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'v2_profiles',
        'v2_memberships',
        'v2_workspaces',
        'v2_curriculums',
        'v2_submissions',
        'v2_quiz_results',
        'v2_quiz_templates',
        'v2_assignment_groups',
        'v2_assignment_group_members',
        'v2_announcements',
        'v2_notifications'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$drop_bootcamp_policies$;

alter table public.v2_profiles enable row level security;
alter table public.v2_memberships enable row level security;
alter table public.v2_workspaces enable row level security;
alter table public.v2_curriculums enable row level security;
alter table public.v2_submissions enable row level security;
alter table public.v2_quiz_results enable row level security;
alter table public.v2_quiz_templates enable row level security;
alter table public.v2_assignment_groups enable row level security;
alter table public.v2_assignment_group_members enable row level security;
alter table public.v2_announcements enable row level security;
alter table public.v2_notifications enable row level security;

-- Profiles: a student may see and edit only their safe display fields. Staff
-- can review the batch roster. Auth identity and the historical role column are
-- protected by the trigger below and by the server-side Auth workflow.
create policy v2_profiles_select_self_or_staff on public.v2_profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.has_bootcamp_staff_role()));

create policy v2_profiles_insert_admin on public.v2_profiles
  for insert to authenticated
  with check ((select public.has_bootcamp_admin_role()));

create policy v2_profiles_update_self_or_staff on public.v2_profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.has_bootcamp_staff_role()))
  with check (id = (select auth.uid()) or (select public.has_bootcamp_staff_role()));

-- Membership rows contain grades, attendance, plus points, certificates, and
-- group credentials. They are never directly writable by students.
create policy v2_memberships_select_self_or_staff on public.v2_memberships
  for select to authenticated
  using ((profile_id = (select auth.uid()) and coalesce(role, 'member') <> 'removed') or (select public.has_bootcamp_staff_role()));

create policy v2_memberships_insert_admin on public.v2_memberships
  for insert to authenticated
  with check ((select public.has_bootcamp_admin_role()));

create policy v2_memberships_update_admin on public.v2_memberships
  for update to authenticated
  using ((select public.has_bootcamp_admin_role()))
  with check ((select public.has_bootcamp_admin_role()));

create policy v2_memberships_delete_admin on public.v2_memberships
  for delete to authenticated
  using ((select public.has_bootcamp_admin_role()));

-- Only batch workspaces are exposed through the Bootcamp contract. There is no
-- policy that makes Agency workspaces visible to anonymous or student users.
create policy v2_workspaces_select_batch_scope on public.v2_workspaces
  for select to authenticated
  using (
    type = 'batch'
    and (
      (select public.has_bootcamp_staff_role())
      or (select public.is_bootcamp_member(id))
    )
  );

create policy v2_workspaces_insert_admin on public.v2_workspaces
  for insert to authenticated
  with check (type = 'batch' and (select public.has_bootcamp_admin_role()));

create policy v2_workspaces_update_admin on public.v2_workspaces
  for update to authenticated
  using (type = 'batch' and (select public.has_bootcamp_admin_role()))
  with check (type = 'batch' and (select public.has_bootcamp_admin_role()));

-- Deliberately no DELETE policy: archival is an update to status and historical
-- Bootcamp batches must not be removed by a direct browser request.

create policy v2_curriculums_select_scope on public.v2_curriculums
  for select to authenticated
  using (
    (select public.has_bootcamp_staff_role())
    or (
      lower(coalesce(is_published, '')) in ('true', 't', '1', 'yes')
      and (select public.is_bootcamp_member(workspace_id))
    )
  );

create policy v2_curriculums_insert_admin on public.v2_curriculums
  for insert to authenticated
  with check (
    (select public.has_bootcamp_admin_role())
    and exists (
      select 1 from public.v2_workspaces workspace
      where workspace.id = workspace_id and workspace.type = 'batch'
    )
  );

create policy v2_curriculums_update_admin on public.v2_curriculums
  for update to authenticated
  using ((select public.has_bootcamp_admin_role()))
  with check (
    (select public.has_bootcamp_admin_role())
    and exists (
      select 1 from public.v2_workspaces workspace
      where workspace.id = workspace_id and workspace.type = 'batch'
    )
  );

create policy v2_curriculums_delete_admin on public.v2_curriculums
  for delete to authenticated
  using ((select public.has_bootcamp_admin_role()));

-- Curriculum rows with student work are historical parents. Keep them in place
-- and require an administrator to unpublish instead of deleting the row.
create or replace function public.guard_v2_curriculum_delete()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $guard_v2_curriculum_delete$
begin
  if exists (select 1 from public.v2_submissions where curriculum_id = old.id)
    or exists (select 1 from public.v2_quiz_results where curriculum_id = old.id) then
    raise exception 'Curriculum with student history cannot be deleted';
  end if;
  return old;
end;
$guard_v2_curriculum_delete$;

drop trigger if exists guard_v2_curriculum_delete on public.v2_curriculums;
create trigger guard_v2_curriculum_delete
before delete on public.v2_curriculums
for each row execute function public.guard_v2_curriculum_delete();

create policy v2_submissions_select_scope on public.v2_submissions
  for select to authenticated
  using (
    (select public.has_bootcamp_staff_role())
    or (
      profile_id = (select auth.uid())
      and (select public.is_bootcamp_member(workspace_id))
    )
  );

create policy v2_submissions_insert_member on public.v2_submissions
  for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and (select public.can_submit_bootcamp_curriculum(workspace_id, curriculum_id))
  );

-- Students can update a draft/file link and feedback-read marker; the trigger
-- below blocks ownership, status, grade, and mentor fields for every JWT user.
create policy v2_submissions_update_owner_or_staff on public.v2_submissions
  for update to authenticated
  using (
    (select public.has_bootcamp_staff_role())
    or (
      profile_id = (select auth.uid())
      and (select public.is_bootcamp_member(workspace_id))
    )
  )
  with check (
    (select public.has_bootcamp_staff_role())
    or (
      profile_id = (select auth.uid())
      and (select public.is_bootcamp_member(workspace_id))
    )
  );

create policy v2_submissions_delete_admin on public.v2_submissions
  for delete to authenticated
  using ((select public.has_bootcamp_admin_role()));

create policy v2_quiz_results_select_scope on public.v2_quiz_results
  for select to authenticated
  using (
    (select public.has_bootcamp_staff_role())
    or (
      profile_id = (select auth.uid())
      and (select public.is_bootcamp_member(workspace_id))
    )
  );

-- Quiz scores are assigned by the secure submission RPC below. Students may
-- submit answers only for a published curriculum in their own batch.
create policy v2_quiz_results_insert_member on public.v2_quiz_results
  for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and (select public.can_submit_bootcamp_curriculum(workspace_id, curriculum_id))
  );

create policy v2_quiz_results_update_admin on public.v2_quiz_results
  for update to authenticated
  using ((select public.has_bootcamp_admin_role()))
  with check ((select public.has_bootcamp_admin_role()));

create policy v2_quiz_results_delete_admin on public.v2_quiz_results
  for delete to authenticated
  using ((select public.has_bootcamp_admin_role()));

create policy v2_quiz_templates_select_staff on public.v2_quiz_templates
  for select to authenticated
  using ((select public.has_bootcamp_staff_role()));

create policy v2_quiz_templates_insert_admin on public.v2_quiz_templates
  for insert to authenticated
  with check ((select public.has_bootcamp_admin_role()));

create policy v2_quiz_templates_update_admin on public.v2_quiz_templates
  for update to authenticated
  using ((select public.has_bootcamp_admin_role()))
  with check ((select public.has_bootcamp_admin_role()));

create policy v2_quiz_templates_delete_admin on public.v2_quiz_templates
  for delete to authenticated
  using ((select public.has_bootcamp_admin_role()));

create policy v2_assignment_groups_select_scope on public.v2_assignment_groups
  for select to authenticated
  using (
    (select public.has_bootcamp_staff_role())
    or (select public.is_bootcamp_member(workspace_id))
  );

create policy v2_assignment_groups_insert_admin on public.v2_assignment_groups
  for insert to authenticated
  with check (
    (select public.has_bootcamp_admin_role())
    and exists (
      select 1 from public.v2_workspaces workspace
      where workspace.id = workspace_id and workspace.type = 'batch'
    )
  );

create policy v2_assignment_groups_update_admin on public.v2_assignment_groups
  for update to authenticated
  using ((select public.has_bootcamp_admin_role()))
  with check (
    (select public.has_bootcamp_admin_role())
    and exists (
      select 1 from public.v2_workspaces workspace
      where workspace.id = workspace_id and workspace.type = 'batch'
    )
  );

create policy v2_assignment_groups_delete_admin on public.v2_assignment_groups
  for delete to authenticated
  using ((select public.has_bootcamp_admin_role()));

create policy v2_assignment_group_members_select_scope on public.v2_assignment_group_members
  for select to authenticated
  using (
    (select public.has_bootcamp_staff_role())
    or (
      profile_id = (select auth.uid())
      and exists (
        select 1
        from public.v2_memberships membership
        join public.v2_assignment_groups assignment_group on assignment_group.id = group_id
        where membership.workspace_id = assignment_group.workspace_id
          and membership.profile_id = (select auth.uid())
          and coalesce(membership.role, 'member') <> 'removed'
      )
    )
    or exists (
      select 1
      from public.v2_assignment_groups assignment_group
      where assignment_group.id = group_id
        and (select public.is_bootcamp_member(assignment_group.workspace_id))
    )
  );

create policy v2_assignment_group_members_insert_admin on public.v2_assignment_group_members
  for insert to authenticated
  with check (
    (select public.has_bootcamp_admin_role())
    and exists (
      select 1
      from public.v2_assignment_groups assignment_group
      join public.v2_memberships membership
        on membership.workspace_id = assignment_group.workspace_id
       and membership.profile_id = public.v2_assignment_group_members.profile_id
       and coalesce(membership.role, 'member') <> 'removed'
      where assignment_group.id = public.v2_assignment_group_members.group_id
    )
  );

create policy v2_assignment_group_members_update_admin on public.v2_assignment_group_members
  for update to authenticated
  using ((select public.has_bootcamp_admin_role()))
  with check (
    (select public.has_bootcamp_admin_role())
    and exists (
      select 1
      from public.v2_assignment_groups assignment_group
      join public.v2_memberships membership
        on membership.workspace_id = assignment_group.workspace_id
       and membership.profile_id = public.v2_assignment_group_members.profile_id
       and coalesce(membership.role, 'member') <> 'removed'
      where assignment_group.id = public.v2_assignment_group_members.group_id
    )
  );

create policy v2_assignment_group_members_delete_admin on public.v2_assignment_group_members
  for delete to authenticated
  using ((select public.has_bootcamp_admin_role()));

create policy v2_announcements_select_scope on public.v2_announcements
  for select to authenticated
  using (
    (select public.has_bootcamp_staff_role())
    or (select public.is_bootcamp_member(workspace_id))
  );

create policy v2_announcements_insert_admin on public.v2_announcements
  for insert to authenticated
  with check (
    creator_id = (select auth.uid())
    and (select public.has_bootcamp_admin_role())
    and (
      (select public.is_bootcamp_member(workspace_id, creator_id))
      or (select public.has_bootcamp_admin_role())
    )
  );

create policy v2_announcements_update_admin on public.v2_announcements
  for update to authenticated
  using ((select public.has_bootcamp_admin_role()))
  with check ((select public.has_bootcamp_admin_role()));

create policy v2_announcements_delete_admin on public.v2_announcements
  for delete to authenticated
  using ((select public.has_bootcamp_admin_role()));

create policy v2_notifications_select_own on public.v2_notifications
  for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.has_bootcamp_staff_role()));

create policy v2_notifications_update_own on public.v2_notifications
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy v2_notifications_insert_admin on public.v2_notifications
  for insert to authenticated
  with check ((select public.has_bootcamp_admin_role()));

create policy v2_notifications_delete_own_or_admin on public.v2_notifications
  for delete to authenticated
  using (profile_id = (select auth.uid()) or (select public.has_bootcamp_admin_role()));

-- Keep Auth identity and the legacy role field immutable from any JWT-backed
-- direct update. Server/service-role migrations can still repair a profile,
-- while the role assignment table remains the authorization source of truth.
create or replace function public.guard_v2_profile_identity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $guard_v2_profile_identity$
begin
  if (select auth.uid()) is not null then
    if new.id is distinct from old.id
      or new.username is distinct from old.username
      or new.email is distinct from old.email
      or new.role is distinct from old.role then
      raise exception 'Auth identity and role fields can only be changed by the server';
    end if;
  end if;
  return new;
end;
$guard_v2_profile_identity$;

drop trigger if exists guard_v2_profile_identity on public.v2_profiles;
create trigger guard_v2_profile_identity
before update on public.v2_profiles
for each row execute function public.guard_v2_profile_identity();

-- Membership identity and the historical grade payload are immutable from a
-- JWT-backed direct update. Server mutations may still change roster metadata,
-- attendance, plus points, certificates, and the soft-revoke role.
create or replace function public.guard_v2_membership_identity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $guard_v2_membership_identity$
begin
  if (select auth.uid()) is not null then
    if new.id is distinct from old.id
      or new.workspace_id is distinct from old.workspace_id
      or new.profile_id is distinct from old.profile_id
      or new.grades is distinct from old.grades
      or new.created_at is distinct from old.created_at
      or new.joined_at is distinct from old.joined_at then
      raise exception 'Membership identity and historical grades can only be changed by the server';
    end if;
  end if;
  if new.role is not null and new.role not in ('member', 'student', 'removed') then
    raise exception 'Membership role is invalid';
  end if;
  return new;
end;
$guard_v2_membership_identity$;

drop trigger if exists guard_v2_membership_identity on public.v2_memberships;
create trigger guard_v2_membership_identity
before update on public.v2_memberships
for each row execute function public.guard_v2_membership_identity();

-- Grade/status/mentor fields are accepted only by the audited service-role RPC.
-- A student can still create/update their own file submission and mark feedback
-- read, but cannot forge a score, status, owner, or criteria JSON.
create or replace function public.guard_v2_submission_write()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $guard_v2_submission_write$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.curriculum_id is distinct from old.curriculum_id
      or new.profile_id is distinct from old.profile_id
      or new.workspace_id is distinct from old.workspace_id
      or new.created_at is distinct from old.created_at
      or new.status is distinct from old.status
      or new.grade is distinct from old.grade
      or new.mentor_feedback is distinct from old.mentor_feedback
      or new.graded_at is distinct from old.graded_at
      or new.criteria_scores is distinct from old.criteria_scores
      or new.is_cloned is distinct from old.is_cloned
      or new.cloned_from_submission_id is distinct from old.cloned_from_submission_id
      or new.submitted_by_profile_id is distinct from old.submitted_by_profile_id
      or new.assignment_group_id is distinct from old.assignment_group_id then
      raise exception 'Use the audited Bootcamp grading workflow for protected submission fields';
    end if;
    if new.file_link is distinct from old.file_link
      and (new.file_link is null or new.file_link !~ '^https://[^[:space:]]+$') then
      raise exception 'Submission link must be an HTTPS URL';
    end if;
  elsif tg_op = 'INSERT' then
    if new.file_link is null or new.file_link !~ '^https://[^[:space:]]+$' then
      raise exception 'Submission link must be an HTTPS URL';
    end if;
    if not exists (
      select 1
      from public.v2_curriculums curriculum
      where curriculum.id = new.curriculum_id
        and curriculum.workspace_id = new.workspace_id
        and curriculum.assignment_group_id is not distinct from new.assignment_group_id
    ) then
      raise exception 'Submission assignment group does not match the curriculum';
    end if;
    if new.status is not null
      or new.grade is not null
      or new.mentor_feedback is not null
      or new.graded_at is not null
      or new.is_cloned = true
      or new.cloned_from_submission_id is not null
      or new.submitted_by_profile_id is not null
      or new.criteria_scores is not null and new.criteria_scores <> '{}'::jsonb then
      raise exception 'Protected submission fields are server-assigned';
    end if;
    if new.assignment_group_id is not null
      and not exists (
        select 1
        from public.v2_assignment_group_members group_member
        join public.v2_assignment_groups assignment_group
          on assignment_group.id = group_member.group_id
         join public.v2_curriculums curriculum
           on curriculum.id = new.curriculum_id
        where group_member.group_id = new.assignment_group_id
          and group_member.profile_id = new.profile_id
          and assignment_group.workspace_id = new.workspace_id
          and curriculum.workspace_id = new.workspace_id
          and curriculum.assignment_group_id = new.assignment_group_id
      ) then
      raise exception 'Student is not a member of the submission group';
    end if;
  end if;

  return new;
end;
$guard_v2_submission_write$;

drop trigger if exists guard_v2_submission_write on public.v2_submissions;
create trigger guard_v2_submission_write
before insert or update on public.v2_submissions
for each row execute function public.guard_v2_submission_write();

-- Never accept a client-provided quiz score. The auto-grading RPC below is the
-- supported path and runs as one transaction with the attempt uniqueness check.
create or replace function public.guard_v2_quiz_result_write()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $guard_v2_quiz_result_write$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if coalesce(current_setting('ruang_campus.quiz_rpc', true), '') <> 'on' then
      raise exception 'Use the server-side quiz submission workflow';
    end if;
    if new.score is null then
      raise exception 'Quiz score is assigned by the server';
    end if;
  end if;

  if tg_op = 'UPDATE'
    and (
      new.id is distinct from old.id
      or new.curriculum_id is distinct from old.curriculum_id
      or new.profile_id is distinct from old.profile_id
      or new.workspace_id is distinct from old.workspace_id
      or new.score is distinct from old.score
    ) then
    raise exception 'Quiz identity and score are immutable outside the server workflow';
  end if;

  return new;
end;
$guard_v2_quiz_result_write$;

drop trigger if exists guard_v2_quiz_result_write on public.v2_quiz_results;
create trigger guard_v2_quiz_result_write
before insert or update on public.v2_quiz_results
for each row execute function public.guard_v2_quiz_result_write();

-- Server-side auto-grading compatible with the legacy quiz_data shape:
-- {"questions":[{"type":"mc", "correct": 0, ...}]}. Essay/long-text
-- questions remain participation/manual-review items and do not lower the
-- multiple-choice score, matching the existing Bootcamp behavior.
create or replace function public.submit_bootcamp_quiz_result(
  p_workspace_id uuid,
  p_curriculum_id uuid,
  p_answers jsonb
)
returns table (result_id uuid, score integer)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $submit_bootcamp_quiz_result$
declare
  actor_id uuid := (select auth.uid());
  curriculum_row public.v2_curriculums%rowtype;
  question jsonb;
  question_index integer := 0;
  multiple_choice_count integer := 0;
  correct_count integer := 0;
  calculated_score integer;
  inserted_id uuid;
begin
  if actor_id is null then
    raise exception 'Authenticated student is required';
  end if;

  perform set_config('ruang_campus.quiz_rpc', 'on', true);

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Quiz answers must be a JSON object';
  end if;
  if (select count(*) from jsonb_object_keys(p_answers)) > 200 then
    raise exception 'Quiz answers contain too many fields';
  end if;

  select curriculum.*
  into curriculum_row
  from public.v2_curriculums curriculum
  where curriculum.id = p_curriculum_id
    and curriculum.workspace_id = p_workspace_id
    and lower(coalesce(curriculum.is_published, '')) in ('true', 't', '1', 'yes');

  if not found or not (select public.is_bootcamp_member(p_workspace_id, actor_id)) then
    raise exception 'Published quiz or Bootcamp membership not found';
  end if;
  if lower(coalesce(curriculum_row.type, '')) not in ('post_test', 'quiz') then
    raise exception 'Curriculum is not a quiz';
  end if;

  for question in
    select value
    from jsonb_array_elements(coalesce(curriculum_row.quiz_data -> 'questions', '[]'::jsonb))
  loop
    if coalesce(question ->> 'type', 'mc') in ('mc', 'multiple_choice') then
      multiple_choice_count := multiple_choice_count + 1;
      if (p_answers ->> question_index::text) is not null
        and p_answers ->> question_index::text = question ->> 'correct' then
        correct_count := correct_count + 1;
      end if;
    end if;
    question_index := question_index + 1;
  end loop;

  calculated_score := case
    when multiple_choice_count > 0 then round((correct_count::numeric / multiple_choice_count::numeric) * 100)::integer
    else 100
  end;

  insert into public.v2_quiz_results (curriculum_id, profile_id, workspace_id, answers_json, score)
  values (p_curriculum_id, actor_id, p_workspace_id, p_answers, calculated_score)
  on conflict (curriculum_id, profile_id) where curriculum_id is not null and profile_id is not null
  do nothing
  returning id into inserted_id;

  if inserted_id is null then
    raise exception 'This quiz attempt has already been submitted';
  end if;

  -- Preserve the historical grading-matrix shape without recalculating any
  -- existing result. New post-test attempts update only the matching index.
  if curriculum_row.type = 'post_test' then
    declare
      post_test_index integer;
      existing_grades jsonb;
      post_tests jsonb;
    begin
      select ranked.index_zero_based
      into post_test_index
      from (
        select id, (row_number() over (order by created_at nulls first, id) - 1)::integer as index_zero_based
        from public.v2_curriculums
        where workspace_id = p_workspace_id and type = 'post_test'
      ) ranked
      where ranked.id = p_curriculum_id;

      if post_test_index is not null then
        select coalesce(grades, '{}'::jsonb)
        into existing_grades
        from public.v2_memberships
        where workspace_id = p_workspace_id and profile_id = actor_id
        for update;

        post_tests := case
          when jsonb_typeof(existing_grades -> 'post_tests') = 'array' then existing_grades -> 'post_tests'
          else '[]'::jsonb
        end;
        while jsonb_array_length(post_tests) <= post_test_index loop
          post_tests := post_tests || to_jsonb(0);
        end loop;
        existing_grades := jsonb_set(existing_grades, array['post_tests', post_test_index::text], to_jsonb(calculated_score), true);
        update public.v2_memberships
        set grades = existing_grades
        where workspace_id = p_workspace_id and profile_id = actor_id;
      end if;
    end;
  end if;

  return query select inserted_id, calculated_score;
end;
$submit_bootcamp_quiz_result$;

revoke all on function public.submit_bootcamp_quiz_result(uuid, uuid, jsonb) from public;
revoke all on function public.submit_bootcamp_quiz_result(uuid, uuid, jsonb) from anon;
grant execute on function public.submit_bootcamp_quiz_result(uuid, uuid, jsonb) to authenticated;
