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

const quizSql = parsePGDump('public_dump.sql', 'v2_quiz_results');
const submissionsSql = parsePGDump('public_dump.sql', 'v2_submissions');

fs.writeFileSync('MANUAL_GRADES_RESTORE.sql', `-- 📊 RESTORE NILAI & TUGAS\n\n${quizSql}\n\n${submissionsSql}`);
console.log("✅ Berhasil! File MANUAL_GRADES_RESTORE.sql sudah siap!");
