# Deployment — Ruang Campus

## Current deployment status

The local production build and a full logical backup checkpoint succeed, but
this application is **not yet marked production-ready**. No live migration,
Cloudflare Pages deployment preview, or target-project RLS/Auth acceptance test
has been performed.

No Cloudflare Pages configuration, Wrangler file, or existing Pages project
identifier is present in this checkout. Do not create a new project or Worker.
Use the already-approved Pages project only after its name, account, and
established Next.js runtime strategy are confirmed by the operator.

## Required environment variables

Copy [`.env.example`](../.env.example) to `.env.local` for local development;
do not commit `.env.local`.

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Existing Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe | Existing project anon/publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/deployment secret only | Server-side admin operations; never browser-visible. |
| `NEXT_PUBLIC_APP_URL` | Browser-safe | HTTPS canonical application URL. |
| `SUPABASE_DB_URL` | Local/operator only | Audit and backup connection; do not configure for browser use. |

The app fails clearly when its required Supabase browser configuration is
missing; it never silently switches to another project.

## Build and local production verification

Use only scripts declared in `package.json`:

~~~bash
npm run lint
npm test
npx tsc --noEmit
npm run build
npm run start -- --port 3001
node scripts/verify-production-target.mjs
npm audit --omit=dev --audit-level=high
~~~

Before deployment, verify from a fresh browser session:

1. Existing student logs in and sees only their Bootcamp data.
2. Confirmed database-backed admin logs in and opens Bootcamp and Webinar
   administration.
3. Admin creates a Webinar draft; its public URL is not visible.
4. Admin publishes it; `/w/[publicCode]` opens directly and after refresh,
   without authentication or an infinite identity loader.
5. The public page has no admin controls, no Bootcamp data, no mobile
   horizontal overflow, correct canonical URL, and no browser-console errors.
6. `/ruang-sosmed/agency` displays the retired-feature response rather than an
   Agency workspace.
7. Inspect browser assets/API responses to confirm the service-role key is not
   present.

## Existing Cloudflare Pages rollout

1. Confirm the existing Pages project and its currently supported Next.js SSR
   integration. This repository intentionally does not add speculative
   `wrangler` configuration or a new Worker.
2. Set the four runtime application variables above in that existing project's
   environment settings. Mark `SUPABASE_SERVICE_ROLE_KEY` as a secret and do
   not expose `SUPABASE_DB_URL` unless an approved server process genuinely
   needs it.
3. Use the existing project’s approved install strategy and the repository
   build command `npm run build`. Do not invent a build command or point the
   build to a different Supabase project.
4. Deploy a preview first. Check the Cloudflare build log for a successful Next
   build and run the browser acceptance list against the preview URL.
5. Promote only after database preflight, migrations, RLS tests, Auth tests,
   and preview checks are recorded as passing.

If the confirmed Pages project cannot run this Next.js SSR application with its
existing supported integration, stop rather than adding an unreviewed Worker.
Choose an approved hosting/runtime plan with the project owner.

## Release gate

Production release requires all of the following:

- Full backup and restoration plan verified.
- Correct Supabase project confirmed and the four staged migrations applied in
  order: platform roles, Bootcamp grade audit, Webinar LMS, then the rehearsed
  Bootcamp RLS hardening.
- Explicit first admin assignment linked to an existing Auth/profile UUID.
- Anonymous, student, and admin RLS tests passed against the target.
- `npm run lint`, `npm test`, `npx tsc --noEmit`, and `npm run build` passed.
- `npm audit --omit=dev --audit-level=high` reports zero production dependency
  vulnerabilities after the targeted Next.js security update.
- Cloudflare preview build/browser checks passed, including direct refresh of
  `/w/[publicCode]`.
- Service-role/database credentials rotated if previously exposed and secrets
  removed from tracked artifacts under approved data-retention handling.
