const fs = require('fs');
function parsePGDump(filePath, tableName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`COPY auth.${tableName} \\((.*?)\\) FROM stdin;([\\s\\S]*?)\\\\\\.`, 'm');
  const match = content.match(regex);
  if (!match) return "";

  const columns = match[1];
  const rows = match[2].trim().split('\n');

  let sql = "";
  rows.forEach(row => {
    const values = row.split('\t').map(val => {
      if (val === '\\N') return 'NULL';
      return `'${val.replace(/'/g, "''")}'`;
    });
    sql += `INSERT INTO auth.users (${columns}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  return sql;
}

const authSql = parsePGDump('auth_dump.sql', 'users');
fs.writeFileSync('MANUAL_AUTH_RESTORE.sql', authSql);
console.log("✅ Berhasil! File MANUAL_AUTH_RESTORE.sql siap dikopi.");
