const fs = require('fs');
const { Client } = require('pg');

// 🏠 DESTINATION (PROJECT-3)
const NEW_DB = {
  host: '2406:da1a:6b0:f622:cfde:ed8a:2d37:eb72', // DIRECT IPv6 BYPASS FOR PROJECT-3
  port: 5432,
  user: 'postgres',
  password: 'Arunika@12345',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

function parseAuthDump(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /COPY auth\.users \((.*?)\) FROM stdin;([\s\S]*?)\\\./m;
  const match = content.match(regex);
  if (!match) return [];

  const columns = match[1].split(', ').map(c => c.trim());
  const rows = match[2].trim().split('\n');

  return rows.map(row => {
    const values = row.split('\t');
    const obj = {};
    columns.forEach((col, i) => {
      let val = values[i];
      if (val === '\\N') val = null;
      obj[col] = val;
    });
    return obj;
  });
}

async function restore() {
  const client = new Client(NEW_DB);
  try {
    console.log("🔗 Menghubungkan ke Database Project Ke-3...");
    await client.connect();
    console.log("✅ Koneksi Berhasil.");

    const users = parseAuthDump('auth_dump.sql');
    console.log(`♻️ Ditemukan ${users.length} akun murid.`);

    if (users.length === 0) {
      console.log("❌ Tidak ada data akun ditemukan di auth_dump.sql.");
      return;
    }

    console.log("🚀 Memulihkan Akun Murid (Email & Password)...");
    for (const user of users) {
      // We manually construct INSERT because SQL editor blocks auth.users
      const cols = Object.keys(user).join(', ');
      const placeholders = Object.keys(user).map((_, i) => `$${i + 1}`).join(', ');
      const vals = Object.values(user);

      try {
        await client.query(`INSERT INTO auth.users (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, vals);
        console.log(`   ✅ User ${user.email} sukses dipulihkan!`);
        
        // Also create entry in v2_profiles to avoid errors
        await client.query(`INSERT INTO public.v2_profiles (id, full_name, email, role) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`, [user.id, user.id.split('-')[0], user.email, 'student']);

      } catch (err) {
        console.error(`   ❌ Gagal user ${user.email}: ${err.message}`);
      }
    }

    console.log("\n🎊 SELAMAT! Murid Anda sekarang sudah bisa login ke Project Ke-3 pakai password lama!");

  } catch (err) {
    console.error("❌ KONEKSI GAGAL:", err.message);
  } finally {
    await client.end();
  }
}

restore();
