# Acceptance tests — Ruang Campus

This is the target acceptance record. Mark a row as passed only after it is run
against the confirmed Supabase project and a Cloudflare Pages preview (or the
equivalent approved production-like target). It is intentionally not marked
passed by local build success.

## Preconditions

- Full backup and score/attendance snapshots are complete.
- Platform role, Bootcamp grade audit, and Webinar migrations are applied.
- One real Auth user has an explicit admin role assignment.
- One pre-existing student Auth user is available; do not create a duplicate.
- One Webinar exists in draft state, and one published Webinar has at least one
  published lesson.

## Authentication and authorization

| Test | Actor | Expected result |
| --- | --- | --- |
| Open /admin/webinars signed out | Anonymous | Redirect to login; no data is rendered. |
| Request GET /api/admin/webinars without cookies | Anonymous | HTTP 403, no Webinar data. |
| Log in using old student credentials | Existing student | Existing Auth/profile and membership are used; no new Auth user is created. |
| Open another student's batch URL | Student | Not found / denied; no grades, feedback, attendance, or profile data leak. |
| Set a browser localStorage admin marker then open admin route | Student/anonymous | Still denied; role is not read from browser storage. |
| Log in as explicit role-assigned admin | Admin | Bootcamp admin area and Webinar administration open. |
| Remove/revoke the role assignment then refresh | Former admin | Admin route is denied after a fresh server-side identity check. |

## Webinar public boundary

| Test | Expected result |
| --- | --- |
| Open /w/[draftCode] without login | 404/not available; no title, lesson, draft data, or created_by is shown. |
| Open /w/[publishedCode] in an incognito/fresh session | 200; no login/identity loading state; only published sections/lessons/resources appear. |
| Refresh the published public URL directly | Still 200, not a false 404. |
| Change Webinar title as admin | Existing public code and public URL remain unchanged. |
| Call any admin API from public page/browser | 403; no edit/delete action is exposed. |
| Inspect page/API response | No Bootcamp membership, student, grade, submission, or audit data is present. |
| Test at 390px-wide viewport | Vertical scrolling works and scrollWidth is no greater than innerWidth. |

## RLS verification

Run queries using the actual PostgREST roles or an approved RLS test harness,
not the service-role client, because the service role bypasses RLS.

| Role | Assert |
| --- | --- |
| anon | Cannot select/update/insert/delete internal Webinar tables; can only reach safe published Webinar output through the server route. |
| Authenticated student | Cannot read another profile/membership/grade/submission; cannot create an admin role, modify grades, or write Webinar tables. |
| Explicit admin/mentor | Direct policy behavior matches the permitted Webinar CRUD role; server routes still require a validated Auth user. |

For every RLS assertion, record the exact request/query role, result status,
affected table, timestamp, and the tester. Do not use a broad USING (true)
policy as a shortcut to make a test pass.

## Regression data comparison

Compare the preflight snapshots with live data before and after deployment:

- bootcamp batches and students;
- membership records, group assignments, certificates, and credentials;
- attendance and plus-points JSON values;
- submissions, criteria scores, grades, status, and mentor feedback;
- quiz results and templates;
- no automatic recalculation of historic final scores.

## Current local evidence

- npm run lint, npm test, npx tsc --noEmit, and npm run build have passed
  locally.
- Public unknown Webinar routing, login branding, Agency retired routing, and
  anonymous admin-API denial were smoke-tested locally.
- The migration, real Auth accounts, target RLS contexts, published Webinar,
  Cloudflare preview, and target browser acceptance remain unverified.
