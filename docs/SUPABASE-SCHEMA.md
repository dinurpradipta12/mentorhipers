# Supabase schema — Ruang Campus

## Status audit

- **Source of truth:** katalog PostgreSQL project Supabase production yang aktif.
- **Audit timestamp:** 2026-09-06 (read-only, PostgreSQL 17.6).
- **Public tables:** 20.
- **Auth users:** 105; `v2_profiles`: 104.
- **Storage buckets:** `avatars` dan `lms` (keduanya saat ini public).

This document intentionally contains schema and aggregate findings only. It does
not contain student identities, passwords, submissions, grades, or connection
credentials.

## Compatibility contract

The following are existing Bootcamp tables. They remain the source of truth and
must not be renamed, truncated, dropped, copied to a new project, or repurposed
for Webinar LMS:

- `v2_profiles`
- `v2_memberships`
- `v2_workspaces`
- `v2_curriculums`
- `v2_submissions`
- `v2_quiz_results`
- `v2_quiz_templates`
- `v2_assignment_groups`
- `v2_assignment_group_members`
- `v2_announcements`
- `v2_notifications`

There is no live `v2_attendance` or `v2_portal_themes` table. Attendance is
stored in `v2_memberships.attendance` JSONB. The old Agency dataset is archived
in place in `v2_agency_*`; it is not Webinar data.

## Core Bootcamp data dictionary

All primary identifiers below are UUIDs. Timestamps are `timestamptz` unless
noted otherwise.

### Identity and membership

| Table | Purpose | Live columns |
| --- | --- | --- |
| `v2_profiles` | One profile per Supabase Auth user. | `id` (PK, FK to `auth.users`), `full_name`, `username` (unique), `avatar_url`, `role`, `updated_at`, `email` |
| `v2_memberships` | A student's preserved enrollment in a batch. | `id` (PK), `profile_id` (FK), `workspace_id` (FK), `group_name`, `role`, `grades` (JSONB), `attendance` (JSONB), `created_at`, `group_wa_link`, `is_leader`, `plus_points` (JSONB), `joined_at`, `certificate_url`, `credential_no` |
| `v2_workspaces` | Batch / legacy workspace. Webinar LMS must not use this table. | `id` (PK), `name`, `description`, `type`, `status`, `logo_url`, `max_members` (text), `start_date` (date), `end_date` (date), `settings` (JSONB), `schedules` (JSONB), `created_at`, `updated_at` |

The membership uniqueness contract is `UNIQUE (profile_id, workspace_id)`.

### Curriculum, assessment, and submissions

| Table | Purpose | Live columns |
| --- | --- | --- |
| `v2_curriculums` | Materials, post-tests, assignments, challenges, and group assignments. | `id` (PK), `workspace_id` (FK), `title`, `description`, `content_rich`, `type`, `module_name`, `due_date`, `video_url`, `quiz_data` (JSONB), `assets_json` (JSONB), `is_published` (text), `points_weight` (text), `created_at`, `assignment_group_id` (FK), `grading_mode` |
| `v2_submissions` | Assignment / challenge submissions and mentor grading. | `id` (PK), `curriculum_id` (FK), `profile_id` (FK), `workspace_id`, `file_link`, `status`, `grade` (integer), `mentor_feedback`, `is_feedback_read`, `graded_at`, `created_at`, `criteria_scores` (JSONB), `is_cloned`, `cloned_from_submission_id` (self FK), `submitted_by_profile_id` (FK), `assignment_group_id` |
| `v2_quiz_results` | Post-test answers and scores. | `id` (PK), `curriculum_id` (FK), `profile_id` (FK), `workspace_id`, `answers_json` (JSONB), `score` (integer), `created_at` |
| `v2_quiz_templates` | Reusable quiz templates. | `id` (PK), `title`, `description`, `category`, `questions_json` (JSONB), `created_at`, `updated_at` |

### Groups, announcements, and notifications

| Table | Purpose | Live columns |
| --- | --- | --- |
| `v2_assignment_groups` | Manually managed assignment groups. | `id` (PK), `workspace_id` (FK), `name`, `description`, `created_at`, `created_by` (FK to `auth.users`) |
| `v2_assignment_group_members` | Membership of an assignment group. | `id` (PK), `group_id` (FK), `profile_id` (FK), `joined_at` |
| `v2_announcements` | Batch announcements and community-board entries. | `id` (PK), `workspace_id` (FK), `creator_id` (FK), `category`, `title`, `summary`, `content`, `image_url`, `reactions` (JSONB), `is_pinned`, `created_at`, `updated_at`, `gallery_images` (JSONB) |
| `v2_notifications` | Per-profile notification inbox. | `id` (PK), `profile_id` (FK), `workspace_id` (FK), `title`, `message`, `type`, `link`, `is_read`, `created_at` |

`v2_notifications.type` has the only live check constraint: `material`,
`assignment`, `grade`, `feedback`, or `announcement`.

## Legacy Agency archive dictionary

These tables must remain archived and isolated. They are not a target for
Webinar migration or public read policies.

| Table | Live columns |
| --- | --- |
| `v2_agency_accounts` | `id`, `workspace_id` (FK), `name`, `platform`, `handle`, `avatar_url`, `created_at`, `current_followers` |
| `v2_agency_activities` | `id`, `workspace_id` (FK), `profile_id` (FK), `action_text`, `target_id`, `target_type`, `created_at` |
| `v2_agency_content_plans` | `id`, `workspace_id` (FK), `title`, `description`, `platform`, `status`, `content_url`, `due_date`, `created_at`, `updated_at`, `content_pillar`, `headline`, `script_url`, `result_url`, `published_url`, `created_by` (FK), engagement metrics, `account_id` (FK) |
| `v2_agency_intelligence` | `id`, `workspace_id` (unique FK), `workflow` (JSONB), `scopes` (JSONB), `updated_at` |
| `v2_agency_meetings` | `id`, `workspace_id` (FK), `title`, `description`, `start_time`, `end_time`, `meeting_link`, `category`, `created_by` (FK), `created_at` |
| `v2_agency_meeting_attendees` | `id`, `meeting_id` (FK), `profile_id` (FK), `joined_at`; unique by meeting/profile |
| `v2_agency_roadmaps` | `id`, `workspace_id` (FK), `title`, `description`, `target_date`, `progress`, `status`, `created_at` |
| `v2_agency_roadmap_members` | `id`, `roadmap_id` (FK), `profile_id` (FK), `joined_at`; unique by roadmap/profile |
| `v2_agency_roadmap_milestones` | `id`, `roadmap_id` (FK), `title`, `is_completed`, `created_at`, `assigned_to` (FK) |

## Referential integrity and indexing findings

- Live schema has 20 primary keys, 35 foreign keys, 6 additional unique
  constraints, and one check constraint.
- The key historical relations are intact: profiles → Auth users;
  memberships → profiles/workspaces; curriculum → workspaces/groups;
  quiz results and submissions → profiles/curriculum.
- No Bootcamp row is orphaned from its referenced profile in memberships,
  submissions, or quiz results.
- One Auth user has no `v2_profiles` row. It must be reviewed rather than
  automatically linked or duplicated.
- Many foreign-key columns lack a leading index. Future additive maintenance
  migrations should add indexes only after checking workload and lock impact;
  they must not rewrite or move historical data.

## Current RLS and authorization audit

This is an **as-is finding**, not the target security model.

- RLS is enabled only on `v2_notifications`, `v2_quiz_results`,
  `v2_quiz_templates`, and `v2_submissions`.
- The other 16 `v2_*` tables have policies defined but have RLS disabled, so
  those policies do not protect data.
- Several legacy policies use `USING (true)` or grant all authenticated users
  full access. They must be replaced, not copied, in the hardening migration.
- `is_platform_admin()` checks for `v2_profiles.role = 'admin'`, but no live
  profile currently has that role. Existing localStorage admin bypasses are
  not an acceptable source of authorization.
- The live helper functions are `SECURITY DEFINER` without an explicit
  `search_path`. Any replacement must pin a safe `search_path`.

No new policy may use broad `USING (true)` on Bootcamp, profile, membership,
submission, grade, or internal Webinar tables.

## Storage and realtime

- `avatars`: public; 2 recorded objects at audit time.
- `lms`: public; 8 recorded objects at audit time.
- Neither bucket currently has a file-size or MIME allowlist.
- Realtime currently publishes some Agency tables plus `v2_memberships` and
  `v2_profiles`. Webinar tables will not be added to this publication unless a
  later product requirement needs it.

## Grading finding

- All five `v2_workspaces.settings` values are empty JSON objects.
- No `grading_config`, `matrix_config`, or equivalent authoritative database
  value exists.
- Historical results contain post-test scores, submissions, feedback,
  `criteria_scores`, attendance JSONB, and plus-points JSONB.
- The legacy desktop and mobile applications contain conflicting unused
  default-weight objects, while their displayed final score uses the separate
  four-component average formula.

No historical grade may be recalculated automatically. A future grading-config
migration must first snapshot existing calculated values, record the source and
timestamp, provide a rollback path, and obtain explicit product approval for
the formula.

## Staged isolated Webinar schema

The un-applied additive migration
`20260906121000_webinar_lms.sql` creates its own tables:

- `public_webinars`
- `webinar_sections`
- `webinar_lessons`
- `webinar_resources`
- `webinar_audit_logs`

It uses UUID primary keys, stable URL-safe `public_code`, foreign keys and
supporting indexes, status/provider/source constraints, updated-at triggers,
private `webinar-media` Storage, and RLS. It will not use `v2_workspaces`,
`v2_memberships`, or any `v2_agency_*` table. The preceding
`20260906120000_platform_roles.sql` adds a separate database-backed role
assignment table. The staged `20260906120500_bootcamp_grade_audit.sql` adds
`bootcamp_grade_audit_logs` and an audited grading RPC; it does not modify any
existing grade until an authorized mentor/admin explicitly uses it. None of
these migrations has been applied to the live project.
