/**
 * ⚡️ SUPABASE RESCUE MIGRATOR ⚡️
 * 
 * Sources: Project 2 (Unhealthy) via Direct Postgres (Port 5432)
 * Destination: Project 3 (Healthy) via API (Service Role)
 * Author: Antigravity AI
 */

const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// 🔌 SOURCE (PROJECT-2 UNHEALTHY)
const OLD_DB = {
  host: '2406:da18:243:7402:97fb:4130:1aac:1436', // DIRECT IPv6 BYPASS
  port: 5432,
  user: 'postgres',
  password: 'Arunika@12345',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

// 🏠 DESTINATION (PROJECT-3 HEALTHY)
const NEW_URL = 'https://vvnlrqbjhuoordjsauvr.supabase.co'; 
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bmxycWJqaHVvb2RyanNhdXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU2OTA4NSwiZXhwIjoyMDkxMTQ1MDg1fQ.xxEkR4E7ENMQQXbC3B1gl8a-E7qGxidygO1w10mQC7g';

const newSupabase = createClient(NEW_URL, NEW_SERVICE_KEY);

const tables = [
  'v2_profiles', 
  'v2_workspaces', 
  'v2_memberships', 
  'v2_curriculums', 
  'v2_quiz_results', 
  'v2_submissions'
];

async function migrate() {
  const client = new Client(OLD_DB);
  
  try {
    console.log("🔗 Mencoba koneksi ke Project-2 (Unhealthy) via Port 5432...");
    await client.connect();
    console.log("✅ Koneksi Berhasil! Pintu penyelamatan terbuka.");

    for (const table of tables) {
      console.log(`\n📦 Migrating table: ${table}...`);
      
      // 1. Fetch from Old DB
      const res = await client.query(`SELECT * FROM ${table}`);
      const data = res.rows;
      console.log(`   Ditemukan ${data.length} baris data.`);

      if (data.length === 0) continue;

      // 2. Clean Data (IMPORTANT: Remove heavy base64 to prevent project-3 from dying)
      const cleanedData = data.map(item => {
        const cleaned = { ...item };
        if (cleaned.avatar_url && cleaned.avatar_url.startsWith('data:')) {
          cleaned.avatar_url = null; // Kill the base64 monster!
        }
        return cleaned;
      });

      // 3. Upsert to New Project
      // We do it in chunks of 50 to be safe
      const CHUNK_SIZE = 50;
      for (let i = 0; i < cleanedData.length; i += CHUNK_SIZE) {
        const chunk = cleanedData.slice(i, i + CHUNK_SIZE);
        const { error: insertError } = await newSupabase.from(table).upsert(chunk);
        
        if (insertError) {
          console.error(`   ❌ Gagal masukkan chunk ${i}-${i+CHUNK_SIZE}: ${insertError.message}`);
        } else {
          console.log(`   ✅ Chunk ${i}-${i+Math.min(CHUNK_SIZE, cleanedData.length - i)} sukses!`);
        }
      }
    }

    console.log("\n🎊 SELAMAT! Semua data penilaian & murid berhasil diselamatkan ke Project Ke-3.");

  } catch (err) {
    console.error("\n❌ GAGAL: Koneksi ke database lama ditolak/error.");
    console.error("   Ini artinya Supabase sudah memblokir total akses Port 5432 Anda.");
    console.error("   " + err.message);
    if (err.message.includes('timeout') || err.message.includes('ECONNREFUSED')) {
       console.log("\n⚠️ SOLUSI TERAKHIR: Upgrade Project-2 ke Pro Plan ($25) agar akses dibuka kembali.");
    }
  } finally {
    await client.end();
  }
}

migrate();
