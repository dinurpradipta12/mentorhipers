/**
 * 🛰️ RUANG SOSMED BLACK BOX BACKUP SYSTEM
 * Author: Antigravity AI
 * Deskripsi: Skrip otomatisasi untuk mencadangkan seluruh data tabel v2_* ke format JSON.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Konfigurasi dari Environment (Ganti jika menjalankan lokal)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_V2_URL || 'https://vvnlrqbjhuoodrjsauvr.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_V2_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("❌ ERROR: SUPABASE_V2_SERVICE_ROLE_KEY tidak ditemukan!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const TABLES_TO_BACKUP = [
  'v2_profiles',
  'v2_memberships',
  'v2_workspaces',
  'v2_curriculums',
  'v2_submissions',
  'v2_quiz_results'
];

async function runBackup() {
  console.log("🚀 Memulai pencadangan data Ruang Sosmed...");
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFolder = path.join(backupDir, timestamp);

  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder, { recursive: true });

  const fullExport = {};

  for (const table of TABLES_TO_BACKUP) {
    console.log(`📡 Mengambil data dari: ${table}...`);
    const { data, error } = await supabase.from(table).select('*');

    if (error) {
       console.error(`   ❌ Gagal mengambil ${table}:`, error.message);
       continue;
    }

    console.log(`   ✅ Berhasil mengambil ${data.length} baris.`);

    // Simpan file terpisah per tabel
    fs.writeFileSync(
      path.join(backupFolder, `${table}.json`),
      JSON.stringify(data, null, 2)
    );

    fullExport[table] = data;
  }

  // Simpan Master Backup
  fs.writeFileSync(
    path.join(backupFolder, `_MASTER_BACKUP_${timestamp}.json`),
    JSON.stringify(fullExport, null, 2)
  );

  console.log(`\n🎊 BERHASIL! Cadangan data disimpan di folder backups.`);
  console.log(`📂 Folder ini siap untuk disimpan secara aman.`);
}

runBackup();
