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

The live Bootcamp schema had incomplete RLS at audit time: RLS is enabled only
on a subset of `v2_*` tables and several old policies are overly broad. The
staged `20260906121500_bootcamp_rls_hardening.sql` replaces those policies only
after a backup, dry run, and explicit approval. It changes authorization
behavior but does not modify historical rows.

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

## Validation still required on the target

The migration is intentionally not applied yet. The following are release
blockers: a tested full backup, a confirmed initial admin Auth UUID, real RLS
tests for anonymous/student/admin, a migration dry run on a safe environment,
and a Cloudflare preview browser test.

Next.js and `eslint-config-next` are pinned to the patched `16.3.4` release.
`npm audit --omit=dev --audit-level=high` currently reports zero production
dependency vulnerabilities. A full audit still reports six development-only
transitive findings (one low, one moderate, and four high); review those in a
separately tested tooling update before treating the repository-wide audit as
clean. No broad automatic `npm audit fix` was run.
