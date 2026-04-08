const fs = require('fs');
function parsePGDump(filePath, tableName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`COPY public.${tableName} \\((.*?)\\) FROM stdin;([\\s\\S]*?)\\\\\\.`, 'm');
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
    sql += `INSERT INTO public.${tableName} (${columns}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  return sql;
}

const membersSql = parsePGDump('public_dump.sql', 'v2_memberships');
fs.writeFileSync('MANUAL_MEMBERSHIP_RESTORE.sql', membersSql);
console.log("✅ File MANUAL_MEMBERSHIP_RESTORE.sql siap!");
