import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

function loadLocalEnv() {
  const envPath = new URL('../.env.local', import.meta.url);
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

const env = { ...loadLocalEnv(), ...process.env };
const files = [
  '20260906120000_platform_roles.sql',
  '20260906120500_bootcamp_grade_audit.sql',
  '20260906121000_webinar_lms.sql',
  '20260906121500_bootcamp_rls_hardening.sql',
];

if (!env.SUPABASE_DB_URL) {
  console.error('SUPABASE_DB_URL is required for the target migration dry-run.');
  process.exit(2);
}

const client = new Client({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
});

try {
  await client.connect();
  await client.query('begin');
  await client.query("set local lock_timeout = '5s'");
  await client.query("set local statement_timeout = '120s'");
  for (const file of files) {
    await client.query(fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', file), 'utf8'));
    console.log(`validated ${file}`);
  }
  await client.query('rollback');
  console.log('Migration dry-run transaction rolled back; no live objects or rows were persisted.');
} catch (error) {
  await client.query('rollback').catch(() => {});
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
