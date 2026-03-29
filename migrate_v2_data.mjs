/**
 * DATA MIGRATION: V1 Supabase -> V2 Supabase
 * 
 * CARA PAKAI:
 * 1. Isi V1_URL, V1_SERVICE_KEY, V2_URL, V2_SERVICE_KEY di bawah
 * 2. Jalankan: node migrate_v2_data.mjs
 * 
 * CATATAN:
 * - Script ini TIDAK memindahkan auth.users (akun login).
 *   Students perlu sign-up ulang di project baru, atau admin invite via Supabase Dashboard.
 * - Jalankan saat V1 sudah recover / bisa diakses kembali.
 */

import { createClient } from '@supabase/supabase-js';

// =============================
// KONFIGURASI — ISI INI DULU
// =============================
const V1_URL = 'https://bgxpmqcyupjkvefhizln.supabase.co'; // Project lama
const V1_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneHBtcWN5dXBqa3ZlZmhpemxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzNzg0OCwiZXhwIjoyMDg5NTEzODQ4fQ.PgR4rL9oeKxGiPMzLCdlpPEAnx2EnN7TI4qzGIksMns';

const V2_URL = process.env.V2_URL || '';           // Project baru — isi dengan URL V2
const V2_SERVICE_KEY = process.env.V2_KEY || '';    // Service Role Key V2

if (!V2_URL || !V2_SERVICE_KEY) {
  console.error('❌ Set V2_URL and V2_KEY environment variables first!');
  console.error('   Example: V2_URL=https://xxx.supabase.co V2_KEY=eyJ... node migrate_v2_data.mjs');
  process.exit(1);
}

const v1 = createClient(V1_URL, V1_SERVICE_KEY);
const v2 = createClient(V2_URL, V2_SERVICE_KEY);

const TIMEOUT_MS = 15000;
let totalMigrated = 0;
let totalFailed = 0;

async function withTimeout(promise, label) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS));
  try {
    return await Promise.race([promise, timeout]);
  } catch (e) {
    console.error(`  ❌ ${label}: ${e.message}`);
    return null;
  }
}

async function migrateTable(tableName, options = {}) {
  const { orderBy = 'created_at', chunkSize = 50, transform = null } = options;
  
  console.log(`\n📦 Migrating: ${tableName}...`);

  // Fetch from V1
  const result = await withTimeout(
    v1.from(tableName).select('*').order(orderBy, { ascending: true }),
    `Fetch ${tableName} from V1`
  );

  if (!result || result.error) {
    console.error(`  ❌ Could not fetch ${tableName} from V1:`, result?.error?.message);
    totalFailed++;
    return;
  }

  const rows = result.data || [];
  if (rows.length === 0) {
    console.log(`  ⚪ ${tableName}: No data to migrate.`);
    return;
  }

  console.log(`  → Found ${rows.length} rows in V1`);

  // Transform rows if needed
  const processedRows = transform ? rows.map(transform) : rows;

  // Insert into V2 in chunks
  let migrated = 0;
  for (let i = 0; i < processedRows.length; i += chunkSize) {
    const chunk = processedRows.slice(i, i + chunkSize);
    const insertResult = await withTimeout(
      v2.from(tableName).upsert(chunk, { onConflict: 'id', ignoreDuplicates: true }),
      `Insert chunk ${i}-${i+chunkSize} into ${tableName}`
    );
    
    if (!insertResult || insertResult.error) {
      console.error(`  ⚠️ Chunk ${i}-${i+chunkSize} failed:`, insertResult?.error?.message);
      totalFailed += chunk.length;
    } else {
      migrated += chunk.length;
    }
  }

  console.log(`  ✅ ${tableName}: ${migrated}/${rows.length} rows migrated.`);
  totalMigrated += migrated;
}

async function checkV1Connection() {
  console.log('🔍 Checking V1 connection...');
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 10000);
  
  try {
    const res = await fetch(`${V1_URL}/rest/v1/v2_workspaces?select=id&limit=1`, {
      headers: { 'apikey': V1_SERVICE_KEY, 'Authorization': `Bearer ${V1_SERVICE_KEY}` },
      signal: ctrl.signal
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`  ✅ V1 is reachable! Found test workspace: ${data.length > 0 ? 'yes' : 'empty'}`);
      return true;
    } else {
      console.error(`  ❌ V1 responded with: ${res.status}`);
      return false;
    }
  } catch (e) {
    console.error(`  ❌ V1 unreachable: ${e.message}`);
    console.error('  ⚠️  V1 database must be healthy before migration can run.');
    console.error('     Restart V1 project from Supabase Dashboard first.');
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  MENTORHIPERS V2 DATA MIGRATION');
  console.log(`  V1: ${V1_URL}`);
  console.log(`  V2: ${V2_URL}`);
  console.log('='.repeat(60));

  // Check V1 is alive
  const v1ok = await checkV1Connection();
  if (!v1ok) {
    process.exit(1);
  }

  // Migration order matters (foreign key dependencies)
  
  // 1. Workspaces (no dependencies)
  await migrateTable('v2_workspaces');

  // 2. Profiles (references auth.users — migrated as-is, but auth users need to be recreated)
  // NOTE: Students will need to sign-up again in the new project.
  // The profile data (name, avatar, role) is preserved; only the auth session changes.
  await migrateTable('v2_profiles', {
    orderBy: 'updated_at',
    transform: (row) => ({
      ...row,
      // Keep same IDs so memberships still reference correctly
      // Auth users must be recreated with same UUID via Supabase User Management
    })
  });

  // 3. Curriculums (depends on v2_workspaces)
  await migrateTable('v2_curriculums');

  // 4. Memberships (depends on v2_workspaces + v2_profiles)
  await migrateTable('v2_memberships');

  // 5. Submissions (depends on v2_curriculums + v2_profiles + v2_workspaces)
  await migrateTable('v2_submissions');

  // 6. Quiz Results (depends on v2_curriculums + v2_profiles + v2_workspaces)
  await migrateTable('v2_quiz_results');

  // 7. Attendance
  await migrateTable('v2_attendance', { orderBy: 'created_at' });

  console.log('\n' + '='.repeat(60));
  console.log(`  MIGRATION COMPLETE`);
  console.log(`  ✅ Total migrated: ${totalMigrated} rows`);
  console.log(`  ❌ Total failed:   ${totalFailed} rows`);
  console.log('='.repeat(60));
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some rows failed. This is usually because:');
    console.log('   - auth.users IDs don\'t exist yet in V2 (profiles need auth users first)');
    console.log('   - Run the migration again after recreating auth users in V2');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Recreate student auth accounts in V2 Supabase (Authentication > Users > Invite)');
  console.log('      OR have students sign-up again using the same email');
  console.log('   2. Run this script again to re-migrate profiles after auth users exist');
  console.log('   3. Verify data in V2 Supabase Dashboard');
  console.log('   4. Run v2_cleanup_v1.sql on V1 to free up disk space');
}

main().catch(console.error);
