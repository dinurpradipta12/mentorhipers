-- Ruang Campus: preserve an audit trail for explicit Bootcamp grading changes.
--
-- Preconditions:
-- 1. A verified full database backup and grade snapshot.
-- 2. 20260906120000_platform_roles.sql has been applied and an approved admin
--    or mentor assignment exists.
--
-- This migration does not recalculate or update any historic grade. It only
-- provides an atomic function used when an authorized admin explicitly edits a
-- submission after this migration.

create table if not exists public.bootcamp_grade_audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.v2_workspaces(id) on delete set null,
  submission_id uuid references public.v2_submissions(id) on delete set null,
  student_profile_id uuid references public.v2_profiles(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  before_grade integer,
  after_grade integer,
  before_status text,
  after_status text,
  before_feedback text,
  after_feedback text,
  before_criteria_scores jsonb,
  after_criteria_scores jsonb,
  reason text,
  created_at timestamptz not null default now()
);

do $bootcamp_grade_audit_foreign_keys$
begin
  if not exists (select 1 from pg_constraint where conname = 'bootcamp_grade_audit_logs_workspace_id_fkey' and conrelid = 'public.bootcamp_grade_audit_logs'::regclass) then
    alter table public.bootcamp_grade_audit_logs add constraint bootcamp_grade_audit_logs_workspace_id_fkey foreign key (workspace_id) references public.v2_workspaces(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bootcamp_grade_audit_logs_submission_id_fkey' and conrelid = 'public.bootcamp_grade_audit_logs'::regclass) then
    alter table public.bootcamp_grade_audit_logs add constraint bootcamp_grade_audit_logs_submission_id_fkey foreign key (submission_id) references public.v2_submissions(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bootcamp_grade_audit_logs_student_profile_id_fkey' and conrelid = 'public.bootcamp_grade_audit_logs'::regclass) then
    alter table public.bootcamp_grade_audit_logs add constraint bootcamp_grade_audit_logs_student_profile_id_fkey foreign key (student_profile_id) references public.v2_profiles(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bootcamp_grade_audit_logs_actor_id_fkey' and conrelid = 'public.bootcamp_grade_audit_logs'::regclass) then
    alter table public.bootcamp_grade_audit_logs add constraint bootcamp_grade_audit_logs_actor_id_fkey foreign key (actor_id) references auth.users(id) on delete set null;
  end if;
end
$bootcamp_grade_audit_foreign_keys$;

do $bootcamp_grade_audit_constraints$
begin
  if not exists (select 1 from pg_constraint where conname = 'bootcamp_grade_audit_logs_before_grade_check' and conrelid = 'public.bootcamp_grade_audit_logs'::regclass) then
    alter table public.bootcamp_grade_audit_logs add constraint bootcamp_grade_audit_logs_before_grade_check check (before_grade is null or before_grade between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bootcamp_grade_audit_logs_after_grade_check' and conrelid = 'public.bootcamp_grade_audit_logs'::regclass) then
    alter table public.bootcamp_grade_audit_logs add constraint bootcamp_grade_audit_logs_after_grade_check check (after_grade is null or after_grade between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bootcamp_grade_audit_logs_reason_length_check' and conrelid = 'public.bootcamp_grade_audit_logs'::regclass) then
    alter table public.bootcamp_grade_audit_logs add constraint bootcamp_grade_audit_logs_reason_length_check check (reason is null or char_length(reason) <= 1000);
  end if;
end
$bootcamp_grade_audit_constraints$;

create index if not exists bootcamp_grade_audit_logs_workspace_created_idx
  on public.bootcamp_grade_audit_logs (workspace_id, created_at desc);
create index if not exists bootcamp_grade_audit_logs_submission_created_idx
  on public.bootcamp_grade_audit_logs (submission_id, created_at desc);
create index if not exists bootcamp_grade_audit_logs_student_created_idx
  on public.bootcamp_grade_audit_logs (student_profile_id, created_at desc);
create index if not exists bootcamp_grade_audit_logs_actor_created_idx
  on public.bootcamp_grade_audit_logs (actor_id, created_at desc);

alter table public.bootcamp_grade_audit_logs enable row level security;

drop policy if exists bootcamp_grade_audit_logs_admin_select on public.bootcamp_grade_audit_logs;
create policy bootcamp_grade_audit_logs_admin_select on public.bootcamp_grade_audit_logs
  for select to authenticated
  using ((select public.has_platform_role(array['admin', 'mentor']::text[])));

create or replace function public.record_bootcamp_submission_grade(
  p_workspace_id uuid,
  p_submission_id uuid,
  p_actor_id uuid,
  p_set_grade boolean,
  p_grade integer,
  p_set_status boolean,
  p_status text,
  p_set_feedback boolean,
  p_feedback text,
  p_set_criteria_scores boolean,
  p_criteria_scores jsonb,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $record_bootcamp_submission_grade$
declare
  current_submission public.v2_submissions%rowtype;
begin
  if not exists (
    select 1
    from public.platform_role_assignments assignment
    where assignment.profile_id = p_actor_id
      and assignment.revoked_at is null
      and assignment.role in ('admin', 'mentor')
  ) then
    raise exception 'A database-backed admin or mentor role is required';
  end if;

  if p_set_grade and p_grade is not null and p_grade not between 0 and 100 then
    raise exception 'Grade must be between 0 and 100';
  end if;

  if p_set_status and p_status not in ('pending', 'in_review', 'completed') then
    raise exception 'Submission status is invalid';
  end if;

  if p_set_feedback and p_feedback is not null and char_length(p_feedback) > 10000 then
    raise exception 'Mentor feedback is too long';
  end if;

  if p_set_criteria_scores
    and p_criteria_scores is not null
    and jsonb_typeof(p_criteria_scores) <> 'object' then
    raise exception 'Criteria scores must be a JSON object';
  end if;

  if p_reason is not null and char_length(p_reason) > 1000 then
    raise exception 'Reason is too long';
  end if;

  select *
  into current_submission
  from public.v2_submissions
  where id = p_submission_id
    and workspace_id = p_workspace_id
  for update;

  if not found then
    raise exception 'Submission not found in this Bootcamp batch';
  end if;

  insert into public.bootcamp_grade_audit_logs (
    workspace_id,
    submission_id,
    student_profile_id,
    actor_id,
    before_grade,
    after_grade,
    before_status,
    after_status,
    before_feedback,
    after_feedback,
    before_criteria_scores,
    after_criteria_scores,
    reason
  )
  values (
    current_submission.workspace_id,
    current_submission.id,
    current_submission.profile_id,
    p_actor_id,
    current_submission.grade,
    case when p_set_grade then p_grade else current_submission.grade end,
    current_submission.status,
    case when p_set_status then p_status else current_submission.status end,
    current_submission.mentor_feedback,
    case when p_set_feedback then p_feedback else current_submission.mentor_feedback end,
    current_submission.criteria_scores,
    case when p_set_criteria_scores then p_criteria_scores else current_submission.criteria_scores end,
    nullif(btrim(p_reason), '')
  );

  update public.v2_submissions
  set
    grade = case when p_set_grade then p_grade else grade end,
    status = case when p_set_status then p_status else status end,
    mentor_feedback = case when p_set_feedback then p_feedback else mentor_feedback end,
    criteria_scores = case when p_set_criteria_scores then p_criteria_scores else criteria_scores end,
    graded_at = case when p_set_grade or p_set_status or p_set_feedback or p_set_criteria_scores then now() else graded_at end
  where id = current_submission.id;
end;
$record_bootcamp_submission_grade$;

revoke all on function public.record_bootcamp_submission_grade(uuid, uuid, uuid, boolean, integer, boolean, text, boolean, text, boolean, jsonb, text) from public;
revoke all on function public.record_bootcamp_submission_grade(uuid, uuid, uuid, boolean, integer, boolean, text, boolean, text, boolean, jsonb, text) from anon;
revoke all on function public.record_bootcamp_submission_grade(uuid, uuid, uuid, boolean, integer, boolean, text, boolean, text, boolean, jsonb, text) from authenticated;
grant execute on function public.record_bootcamp_submission_grade(uuid, uuid, uuid, boolean, integer, boolean, text, boolean, text, boolean, jsonb, text) to service_role;
