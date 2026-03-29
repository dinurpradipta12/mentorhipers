const { createClient } = require('@supabase/supabase-js');

const url = 'https://bgxpmqcyupjkvefhizln.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneHBtcWN5dXBqa3ZlZmhpemxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzNzg0OCwiZXhwIjoyMDg5NTEzODQ4fQ.PgR4rL9oeKxGiPMzLCdlpPEAnx2EnN7TI4qzGIksMns';
const supa = createClient(url, serviceKey);

// Use individual lightweight queries to create indexes one by one
// via direct RPC call to pg_catalog
async function runSQL(sql, label) {
  console.log(`⏳ Running: ${label}...`);
  try {
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql }),
      signal: AbortSignal.timeout(15000) // 15s timeout
    });
    
    if (res.ok) {
      console.log(`✅ ${label}: Done`);
    } else {
      const err = await res.text();
      console.log(`⚠️ ${label}: ${res.status} - ${err.substring(0, 100)}`);
    }
  } catch (e) {
    console.log(`❌ ${label}: ${e.message}`);
  }
}

async function main() {
  // Try a simple ping first
  console.log('🔍 Testing connection...');
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 8000);
    const ping = await fetch(`${url}/rest/v1/v2_workspaces?select=id&limit=1`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
      signal: ctrl.signal
    });
    console.log(`📡 Ping result: ${ping.status}`);
    if (!ping.ok) {
      const body = await ping.text();
      console.log('Response:', body.substring(0, 200));
    }
  } catch (e) {
    console.log(`❌ Ping failed: ${e.message}`);
    console.log('\n⚠️  DATABASE IS COMPLETELY UNREACHABLE');
    console.log('The project needs to recover before any queries can run.');
    console.log('👉 Go to: https://supabase.com/dashboard/project/bgxpmqcyupjkvefhizln');
    console.log('   Look for a "Restart" or "Resume" button on the overview page.');
    process.exit(0);
  }
}

main();
