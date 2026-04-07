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
      // Basic escaping for SQL strings
      return `'${val.replace(/'/g, "''")}'`;
    });
    sql += `INSERT INTO public.${tableName} (${columns}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
  });
  return sql;
}

const workspacesSql = parsePGDump('public_dump.sql', 'v2_workspaces');
const curriculumsSql = parsePGDump('public_dump.sql', 'v2_curriculums');

fs.writeFileSync('MANUAL_SQL_RESTORE.sql', `-- CLIPBOARD READY SQL\n\n${workspacesSql}\n\n${curriculumsSql}`);
console.log("✅ Berhasil! File MANUAL_SQL_RESTORE.sql sudah siap di VS Code Anda.");
