const fs = require('fs');
function parsePGDump(filePath, tableName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`COPY public.${tableName} \\((.*?)\\) FROM stdin;([\\s\\S]*?)\\\\\\.`, 'm');
  const match = content.match(regex);
  if (!match) return "";

  const columns = match[1].split(', ').map(c => c.trim());
  const rows = match[2].trim().split('\n');

  // Find index of avatar_url to exclude it
  const avatarIdx = columns.indexOf('avatar_url');

  let sql = "";
  rows.forEach(row => {
    const values = row.split('\t').map((val, idx) => {
      // Skip the large avatar_url data to keep SQL small
      if (idx === avatarIdx) return 'NULL'; 
      if (val === '\\N') return 'NULL';
      return `'${val.replace(/'/g, "''")}'`;
    });
    sql += `INSERT INTO public.${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, username = EXCLUDED.username;\n`;
  });
  return sql;
}

const profilesSql = parsePGDump('public_dump.sql', 'v2_profiles');
fs.writeFileSync('MANUAL_PROFILES_RESTORE_LIGHT.sql', profilesSql);
console.log("✅ Berhasil! File MANUAL_PROFILES_RESTORE_LIGHT.sql (Versi Ringan) sudah siap!");
