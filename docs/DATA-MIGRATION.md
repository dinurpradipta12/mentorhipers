# Data migration and compatibility — Ruang Campus

## Current status

No migration has been applied to the live Supabase project by this rebuild.
The application is designed to reconnect to the existing project and preserve
the Bootcamp tables in place. Webinar LMS is additive and isolated.

The local read-only audit recorded the following baseline counts on 2026-09-06:

| Dataset | Count |
| --- | ---: |
| Auth users | 105 |
| `v2_profiles` | 104 |
| `v2_memberships` | 92 |
| `v2_workspaces` | 5 |
| `v2_curriculums` | 61 |
| `v2_submissions` | 206 |
| `v2_quiz_results` | 378 |
| `v2_quiz_templates` | 7 |
| `v2_assignment_groups` | 19 |
| `v2_assignment_group_members` | 102 |
| `v2_announcements` | 2 |

These are verification baselines, not a reason to rewrite data. The detailed
schema contract is in [SUPABASE-SCHEMA.md](SUPABASE-SCHEMA.md).

## Data boundaries

| Area | Source of truth | Rebuild action |
| --- | --- | --- |
| Bootcamp students, enrollment, assignments, quiz results, grades, attendance | Existing `v2_*` tables in the current Supabase project | Read in place; do not rename, move, truncate, or copy. |
| Legacy Agency/Team Mode | Existing `v2_agency_*` tables | Keep as an archive; do not read it as Webinar data. |
| Explicit Bootcamp grading history | `bootcamp_grade_audit_logs` | Add only with the audited grading migration; it records before/after changes and never recalculates historic scores. |
| Webinar LMS | `public_webinars`, `webinar_sections`, `webinar_lessons`, `webinar_resources`, `webinar_audit_logs` | Add only after the preflight below succeeds. |
| Platform authorization | `platform_role_assignments` | Additive role mapping; it does not create or duplicate Auth users. |

## Required preflight before any live DDL

1. Confirm the Supabase project URL in `.env.local` is the project holding the
   Bootcamp data. There is no fallback project in the application.
2. Create a full logical database backup outside the repository, and record its
   checksum, timestamp, operator, and restoration test location. A direct
   `pg_dump --format=custom` using a privileged database connection is suitable;
   also retain the provider-managed backup/PITR reference when available.
3. Save row counts for every `v2_*`, Auth, and Storage table; save read-only
   snapshots of memberships' `attendance`, `grades`, `plus_points`,
   submissions' `grade`, `criteria_scores`, `mentor_feedback`, and quiz scores.
4. Audit Auth users and profiles. The audit found one Auth user without a
   `v2_profiles` row; review it manually. Do not auto-link or recreate it.
5. Confirm foreign keys, RLS policies, RPCs/functions, and Storage buckets
   against the live project again immediately before migration.
6. Identify one existing Supabase Auth account, by its confirmed UUID, to be
   the first administrator. No role is granted automatically by any staged
   migration.
7. Obtain explicit approval to apply the three staged additive migrations, in
   order.

The Supabase CLI requires Docker for the local dump workflow used during the
audit. Docker Desktop was not running when the full dump was attempted, so a
verifiable full dump is still a release blocker.

## Apply sequence

Do not use the current local Supabase link state until it is rechecked: it did
not point at the audited production project during this work.

After the preflight and approval:

1. Link the CLI to the confirmed existing project, or use the approved SQL
   change-management process for that project.
2. Apply `20260906120000_platform_roles.sql`.
3. Confirm the approved administrator's existing Auth/profile UUID, then grant
   it explicitly. Example template (replace the UUID; do not use email text as
   identity):

   ~~~sql
   insert into public.platform_role_assignments (profile_id, role, note)
   values ('CONFIRMED_EXISTING_AUTH_PROFILE_UUID', 'admin', 'Initial Ruang Campus administrator')
   on conflict do nothing;
   ~~~

4. Log in using that real Supabase Auth account and verify the role server-side.
5. Apply `20260906120500_bootcamp_grade_audit.sql`. It enables explicit
   audited submission grading only; it does not change a historical row during
   migration.
6. Apply `20260906121000_webinar_lms.sql`.
7. Run the access and data-integrity checks below before publishing any Webinar
   or changing a submission grade.

All three staged migrations are additive. They do not alter historical Bootcamp grades,
attendance, memberships, submissions, quiz results, or Agency archive rows.

## Integrity verification

Run the following as an operator with read-only reporting access before and
after deployment; compare it with the baseline record rather than changing data.

~~~sql
select 'v2_profiles' as table_name, count(*) from public.v2_profiles
union all select 'v2_memberships', count(*) from public.v2_memberships
union all select 'v2_workspaces', count(*) from public.v2_workspaces
union all select 'v2_curriculums', count(*) from public.v2_curriculums
union all select 'v2_submissions', count(*) from public.v2_submissions
union all select 'v2_quiz_results', count(*) from public.v2_quiz_results
union all select 'v2_quiz_templates', count(*) from public.v2_quiz_templates
union all select 'v2_assignment_groups', count(*) from public.v2_assignment_groups
union all select 'v2_assignment_group_members', count(*) from public.v2_assignment_group_members
union all select 'v2_announcements', count(*) from public.v2_announcements
order by table_name;
~~~

For scores, compare aggregate values and a manually approved sample of students
before/after. Do not issue bulk score updates. The historical formula audit is
described in [SUPABASE-SCHEMA.md](SUPABASE-SCHEMA.md#grading-finding).

## Grading safeguard

No authoritative `grading_config` was found in the live workspace settings.
The rebuild preserves legacy displayed-score behavior in code and tests, but it
does not recalculate or write historical final scores. Any future normalized
grading rollout must first create a timestamped, immutable snapshot; record the
approved formula and source; present a dry-run diff; and receive explicit
approval. See [ROLLBACK.md](ROLLBACK.md) for the recovery principle.
