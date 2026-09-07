# Security model — Ruang Campus

## Authentication and authorization

- Every administrator and student uses an existing Supabase Auth account.
- The server validates identity with `auth.getUser()`; browser claims and
  localStorage are never accepted as proof of an admin role.
- `platform_role_assignments` is the proposed database source of truth for
  `admin` and `mentor` roles. The migration grants no role by default.
- Service-role access is isolated in server-only modules and API handlers. It
  must never be prefixed with `NEXT_PUBLIC_`, returned by an API, or bundled in
  browser JavaScript.
- A username login maps a confirmed `v2_profiles.username` to an existing Auth
  account on the server, then performs a normal Supabase Auth sign-in. It does
  not guess email domains or use a fallback password.
- Assignment submission links are accepted only over HTTPS. Student submission
  and feedback-read mutations are scoped to the authenticated profile and an
  active batch membership; group-copy inserts are created server-side only
  after the student's own submission is accepted.
- Removing a student from a batch is a soft revoke (`v2_memberships.role =
  'removed'`). Queries and the staged RLS helper exclude that role from active
  access, while the membership row, grades, attendance, and Auth profile stay
  available for audit or later restoration.

Group CRUD and random distribution are admin-only server operations. Moving a
student changes the assignment-group mapping and display group_name; it does
not delete the profile, Auth user, grades, attendance, or submissions.
Announcement CRUD is admin-only and batch-scoped. Image and gallery sources
must be HTTPS URLs; the Bootcamp UI renders announcement content as text.

## Webinar isolation and public delivery

Webinar LMS has no `workspace_id`, Bootcamp membership, student, grade, or
Agency foreign key. The database tables have RLS enabled and only authenticated
database-backed admins/mentors receive direct CRUD policies.

Public `/w/[publicCode]` delivery is a server-rendered allowlist query:

- it filters to `status = 'published'`;
- it returns only page-safe fields;
- it does not expose creator IDs, internal audit rows, student data, or draft
  records;
- unknown, draft, and archived codes return not found;
- it does not mount an authenticated layout or perform a login check.

The stable `public_code` is server-generated, URL-safe, constrained to 7–12
characters, unique, and protected by a database trigger against later changes.

## RLS status and migration boundary

The live Bootcamp schema was hardened on 2026-09-07 after a backup, target
transaction dry-run, and explicit operator approval. RLS is now enabled on all
preserved Bootcamp tables, and the old broad policies were replaced. The
migration changed authorization behavior but did not modify historical rows.

Before a Bootcamp RLS-hardening migration is approved, it must be tested using
three real contexts:

| Context | Required assertion |
| --- | --- |
| Anonymous | Cannot read Bootcamp profiles, grades, memberships, submissions, or internal Webinar records. |
| Student | Can read only own profile/membership and permitted batch content; cannot read peers' grades or write grades. |
| Admin | Can manage only after a database role assignment; no browser-only bypass works. |

The new Webinar and Bootcamp hardening migrations use no `USING (true)` policy
for internal tables. They use `SECURITY DEFINER` helpers only for role and
membership checks and pin their
`search_path` to `pg_catalog, public, auth`.

Explicit Bootcamp grading is also gated by a server-validated admin/mentor
role. Its separate migration locks the target submission, writes a before/after
audit row, and updates the grade in one database transaction. Quiz scores use a
server-side auto-grading RPC and one-attempt unique index. The application does
not fall back to an unaudited direct update if those migrations are missing.

## Storage and content safety

- Existing `avatars` and `lms` buckets are public legacy storage. Their access
  model must be reviewed separately; changing them is not part of the Webinar
  migration.
- New `webinar-media` storage is private, has a MIME allowlist and size cap,
  and permits access only to database-backed admins/mentors. Public pages use
  short-lived server-created URLs only for published content.
- Webinar external video URLs are restricted to HTTPS YouTube, Vimeo, or an
  HTTPS direct-video URL. Rich text is stripped/sanitized before rendering.
- Public video sharing or screen recording cannot be prevented without DRM; no
  DRM guarantee is made.

## Secrets and incident actions

`.env.local`, database URLs, service-role keys, Auth JWTs, dump files, and
backups are ignored by Git. A browser-bundle scan of the rebuilt local
production output found no configured service-role value.

Older tracked scripts and dump/backups in repository history may contain
credentials or personal data. The unsafe executable scripts were removed from
the working tree, but existing tracked dumps were intentionally not deleted
without separate approval. Before deployment, rotate any previously exposed
Supabase service-role/database credentials, remove or archive sensitive dumps
from the repository under an approved retention plan, and review Git history
with the project owner.

## Validation completed and remaining release checks

The target migration, `arunika` admin assignment, anonymous/student/admin RLS
harness, and isolated application-schema restore have passed. The remaining
release checks are provider-managed PITR/full-restore confirmation and a
Cloudflare Pages preview browser test.

Next.js and `eslint-config-next` are pinned to the patched `16.3.4` release.
`npm audit --omit=dev --audit-level=high` currently reports zero production
dependency vulnerabilities. A full audit still reports six development-only
transitive findings (one low, one moderate, and four high); review those in a
separately tested tooling update before treating the repository-wide audit as
clean. No broad automatic `npm audit fix` was run.
