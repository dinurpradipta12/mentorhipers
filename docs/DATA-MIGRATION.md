# Data migration and compatibility — Ruang Campus

## Current status

The four additive migrations were applied to the confirmed live Supabase
project on 2026-09-07 after a target transaction dry-run and a fresh
pre-migration dump. The application reconnects to the existing project and
preserves the Bootcamp tables in place. Webinar LMS is additive and isolated.

The existing Auth user with username `arunika` was assigned the database-backed
`admin` role. No Auth user was created or duplicated, and no legacy
`v2_profiles.role` value was used as authorization.

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

## Backup checkpoint

A full logical custom-format dump was completed locally on 2026-09-07 before
the live DDL. The latest ignored artifact is
`.local-backups/20260907-production-preflight/ruang-campus-target-pre-migration.dump`;
`pg_restore --list` reports 589 manifest entries (including Auth and
`v2_profiles`). Its SHA-256 is
`17d4c27c72e86ab5be317eacdf22fc1e2e5b5a16fd0c6e2eb67563837a5ac1c4`.
An isolated PostgreSQL 18 restore of the application schemas completed with
exit code 0 and preserved the key counts (`v2_profiles` 104,
`v2_memberships` 92, `v2_submissions` 206, `v2_quiz_results` 378). This
validates the application-schema dump, not a provider-complete Supabase
restore: the local host does not provide the provider-only `supabase_vault`
extension. A provider-managed backup/PITR reference and, if required, a
provider-run full restore rehearsal remain release gates.

The repeatable read-only target audit is `node
scripts/verify-production-target.mjs`. It reports aggregate counts, Auth/profile
parity, staged-object presence, RLS flags, Storage bucket visibility, and
anonymous REST status without returning row contents.

## Data boundaries

| Area | Source of truth | Rebuild action |
| --- | --- | --- |
| Bootcamp students, enrollment, assignments, quiz results, grades, attendance | Existing `v2_*` tables in the current Supabase project | Read in place; do not rename, move, truncate, or copy. |
| Legacy Agency/Team Mode | Existing `v2_agency_*` tables | Keep as an archive; do not read it as Webinar data. |
| Explicit Bootcamp grading history | `bootcamp_grade_audit_logs` | Add only with the audited grading migration; it records before/after changes and never recalculates historic scores. |
| Webinar LMS | `public_webinars`, `webinar_sections`, `webinar_lessons`, `webinar_resources`, `webinar_audit_logs` | Add only after the preflight below succeeds. |
| Platform authorization | `platform_role_assignments` | Additive role mapping; it does not create or duplicate Auth users. |

Student access removal is intentionally non-destructive: the application marks
the existing membership `role` as `removed` instead of deleting the row. This
keeps membership-scoped attendance, grades, plus points, credentials, and group
history available to the administrator. Re-registering the same profile can
restore the row to `member` without creating another Auth user.

## Completed preflight and live migration record

1. The Supabase project URL in `.env.local` was confirmed as the project holding
   the Bootcamp data. There is no fallback project in the application.
2. A full logical database backup was created outside the repository, and its
   checksum and timestamp were recorded. A direct
   `pg_dump --format=custom` using a privileged database connection is suitable;
   also retain the provider-managed backup/PITR reference when available.
3. Row counts for every required `v2_*` and Auth dataset were saved; read-only
   snapshots of memberships' `attendance`, `grades`, `plus_points`,
   submissions' `grade`, `criteria_scores`, `mentor_feedback`, and quiz scores.
4. Auth users and profiles were audited. The audit found one Auth user without a
   `v2_profiles` row; review it manually. Do not auto-link or recreate it.
5. Foreign keys, RLS policies, RPCs/functions, Storage buckets, and duplicate
   quiz-attempt groups were checked against the live project immediately before
   migration.
6. The existing `arunika` Auth/profile UUID was confirmed and assigned `admin`
   through `scripts/bootstrap-platform-admin.mjs`.
7. The four migrations were applied in order and are present in the remote
   migration history table.

The Supabase CLI's Docker workflow is not available on this host. The
PostgreSQL client fallback produced the verified dump above, and the isolated
application-schema restore passed. Keep an external copy of the artifact and
obtain provider-managed PITR/restore evidence before release.

## Apply sequence

Do not use the current local Supabase link state until it is rechecked: it did
not point at the audited production project during this work.

The completed apply sequence was:

1. Use the confirmed existing project connection and approved SQL/CLI
   change-management process.
2. Apply `20260906120000_platform_roles.sql`.
3. Confirm the approved administrator's existing Auth/profile UUID, then grant
   it explicitly. The operator helper was used for `arunika`:

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
7. Rehearse and apply `20260906121500_bootcamp_rls_hardening.sql` only after
   the policy dry run has passed for anon, student, and the explicitly assigned
   admin/mentor. It enables RLS on every preserved Bootcamp table, removes
   ineffective legacy policies, adds write-guard triggers, and never
   recalculates historic grades or attendance.
8. Run the access and data-integrity checks below before publishing any Webinar
   or changing a submission grade.

The identity check and role grant can be performed without creating an Auth
user by using the operator-only helper:

~~~bash
node scripts/bootstrap-platform-admin.mjs --email 'CONFIRMED_EXISTING_AUTH_EMAIL'
node scripts/bootstrap-platform-admin.mjs --email 'CONFIRMED_EXISTING_AUTH_EMAIL' --apply
# A confirmed existing username is also supported:
node scripts/bootstrap-platform-admin.mjs --username 'CONFIRMED_EXISTING_USERNAME' --apply
~~~

The first command is a dry run. Review the returned existing Auth UUID and
profile before running `--apply`. The helper refuses orphan Auth users,
duplicate matches, and missing `v2_profiles` rows. It never creates accounts,
sets passwords, or treats the legacy `v2_profiles.role` as authorization.

Before pushing the four files, validate them against the target inside a
transaction that is always rolled back:

~~~bash
node scripts/verify-target-migrations.mjs
~~~

The first three migrations add isolated role/audit/Webinar objects. The fourth
changes only policy/trigger behavior on existing Bootcamp tables; none of the
migrations renames, truncates, copies, or deletes historical Bootcamp grades,
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
