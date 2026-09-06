import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')];
      }),
  );
}

const localEnv = loadLocalEnv();
const env = { ...localEnv, ...process.env };
const dbUrl = env.SUPABASE_DB_URL;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!dbUrl) {
  console.error('SUPABASE_DB_URL is required for the read-only target preflight.');
  process.exit(2);
}

const bootcampTables = [
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
  'v2_notifications',
];

async function main() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10_000,
  });

  try {
    await client.connect();
    const database = await client.query(`
      select current_database() as database_name,
             current_setting('server_version') as server_version
    `);
    const counts = [];
    for (const table of bootcampTables) {
      const result = await client.query(`select count(*)::int as count from public."${table}"`);
      counts.push([table, result.rows[0].count]);
    }
    const rls = await client.query(`
      select c.relname as table_name, c.relrowsecurity as rls_enabled,
             c.relforcerowsecurity as rls_forced
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = any($1::text[])
      order by c.relname
    `, [[...bootcampTables, 'platform_role_assignments', 'bootcamp_grade_audit_logs', 'public_webinars', 'webinar_sections', 'webinar_lessons', 'webinar_resources', 'webinar_audit_logs']]);
    const stagedObjects = await client.query(`
      select json_build_object(
        'platform_role_assignments', to_regclass('public.platform_role_assignments') is not null,
        'bootcamp_grade_audit_logs', to_regclass('public.bootcamp_grade_audit_logs') is not null,
        'public_webinars', to_regclass('public.public_webinars') is not null,
        'webinar_sections', to_regclass('public.webinar_sections') is not null,
        'webinar_lessons', to_regclass('public.webinar_lessons') is not null,
        'webinar_resources', to_regclass('public.webinar_resources') is not null,
        'webinar_audit_logs', to_regclass('public.webinar_audit_logs') is not null,
        'grade_rpc', exists (
          select 1 from pg_proc
          where pronamespace = 'public'::regnamespace
            and proname = 'record_bootcamp_submission_grade'
        )
      ) as staged_objects
    `);
    const auth = await client.query(`
      select
        (select count(*)::int from auth.users) as auth_users,
        (select count(*)::int from public.v2_profiles) as profiles,
        (select count(*)::int from auth.users u left join public.v2_profiles p on p.id = u.id where p.id is null) as auth_without_profile
    `);
    const storage = await client.query(`
      select name, public as is_public
      from storage.buckets
      order by name
    `);

    const anonymous = [];
    if (supabaseUrl && anonKey) {
      for (const table of ['v2_profiles', 'v2_memberships', 'v2_submissions', 'v2_quiz_results']) {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, {
          headers: { apikey: anonKey, authorization: `Bearer ${anonKey}` },
        });
        const body = await response.text();
        let parsed = null;
        try { parsed = JSON.parse(body); } catch { /* keep status-only result */ }
        anonymous.push({ table, status: response.status, rowCountReturned: Array.isArray(parsed) ? parsed.length : 0 });
      }
    }

    console.log(JSON.stringify({
      database: database.rows[0],
      bootcampCounts: Object.fromEntries(counts),
      auth: auth.rows[0],
      stagedObjects: stagedObjects.rows[0].staged_objects,
      rls: rls.rows,
      storage: storage.rows,
      anonymous,
    }, null, 2));
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
