import fs from 'node:fs';
import process from 'node:process';
import { Client } from 'pg';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

const localEnv = loadLocalEnv();
const env = { ...localEnv, ...process.env };
const email = getArg('--email')?.trim().toLowerCase() || null;
const username = getArg('--username')?.trim().toLowerCase() || null;
const profileId = getArg('--profile-id')?.trim() || null;
const note = (getArg('--note')?.trim() || 'Initial Ruang Campus administrator').slice(0, 1000);
const apply = process.argv.includes('--apply');

if (![email, username, profileId].filter(Boolean).length) {
  console.error('Provide --email existing-auth-email, --username existing-profile-username, or --profile-id existing-auth-uuid.');
  process.exit(2);
}
if ([email, username, profileId].filter(Boolean).length > 1) {
  console.error('Provide only one identity selector: --email, --username, or --profile-id.');
  process.exit(2);
}
if (profileId && !UUID_PATTERN.test(profileId)) {
  console.error('The profile ID must be a valid UUID.');
  process.exit(2);
}
if (!env.SUPABASE_DB_URL) {
  console.error('SUPABASE_DB_URL is required.');
  process.exit(2);
}

const client = new Client({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
});

async function main() {
try {
  await client.connect();
  const roleTable = await client.query(`select to_regclass('public.platform_role_assignments') is not null as exists`);
  if (!roleTable.rows[0]?.exists) {
    throw new Error('platform_role_assignments is not present. Apply the platform-role migration first; no Auth or profile data was changed.');
  }
  const result = await client.query(
    `select u.id, u.email, p.full_name, p.username, p.role as profile_role,
            p.id is not null as has_profile,
            exists (
              select 1 from public.platform_role_assignments assignment
              where assignment.profile_id = u.id
                and assignment.role = 'admin'
                and assignment.revoked_at is null
            ) as already_admin
       from auth.users u
       left join public.v2_profiles p on p.id = u.id
      where ${email ? 'lower(u.email) = $1' : username ? 'lower(p.username) = $1' : 'u.id = $1'}
      limit 2`,
    [email ?? username ?? profileId],
  );

  if (result.rowCount === 0) {
    throw new Error('No existing Supabase Auth user matched the supplied identity. No account was created.');
  }
  if (result.rowCount > 1) {
    throw new Error('The supplied identity matched multiple Auth users. Use the exact profile UUID.');
  }

  const user = result.rows[0];
  if (!user.has_profile) {
    throw new Error('The Auth user has no v2_profiles row. Review the orphan manually; this script will not create or link one.');
  }

  const summary = {
    authUserId: user.id,
    email: user.email,
    fullName: user.full_name,
    username: user.username,
    legacyProfileRole: user.profile_role,
    alreadyAdmin: user.already_admin,
    mode: apply ? 'apply' : 'dry-run',
  };

  if (!apply || user.already_admin) {
    console.log(JSON.stringify(summary, null, 2));
    if (!apply) console.log('No database write performed. Add --apply only after confirming this exact Auth identity.');
    return;
  }

  await client.query('begin');
  const inserted = await client.query(
    `insert into public.platform_role_assignments (profile_id, role, granted_by, note)
     select $1, 'admin', $1, $2
      where not exists (
        select 1 from public.platform_role_assignments
         where profile_id = $1 and role = 'admin' and revoked_at is null
      )
     returning id`,
    [user.id, note],
  );
  await client.query('commit');
  console.log(JSON.stringify({ ...summary, assigned: inserted.rowCount === 1 }, null, 2));
} catch (error) {
  await client.query('rollback').catch(() => {});
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
}

await main();
