# Ruang Campus

Ruang Campus — Platform Edukasi LMS Sosmed is a Next.js application that keeps
the existing Bootcamp Workspace data in its current Supabase project and adds an
isolated public Webinar LMS.

## Local verification

~~~bash
npm run lint
npm test
npx tsc --noEmit
npm run build
npm run start -- --port 3001
~~~

Copy [`.env.example`](.env.example) to `.env.local` and fill it with values
from the existing Supabase project. The service-role key is server-only.

## Operational documentation

- [Live schema and compatibility contract](docs/SUPABASE-SCHEMA.md)
- [Data migration preflight](docs/DATA-MIGRATION.md)
- [Security model and RLS boundary](docs/SECURITY.md)
- [Deployment checklist](docs/DEPLOYMENT.md)
- [Rollback and recovery](docs/ROLLBACK.md)
- [Target acceptance tests](docs/ACCEPTANCE-TESTS.md)

No production migration or Cloudflare deployment should be performed until the
backup, authorization bootstrap, RLS tests, and preview acceptance checks in
those documents are complete.
