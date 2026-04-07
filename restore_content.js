const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 🏠 DESTINATION (PROJECT-3)
const NEW_URL = 'https://vvnlrqbjhuoordjsauvr.supabase.co'; 
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bmxycWJqaHVvb2RyanNhdXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU2OTA4NSwiZXhwIjoyMDkxMTQ1MDg1fQ.xxEkR4E7ENMQQXbC3B1gl8a-E7qGxidygO1w10mQC7g';

const newSupabase = createClient(NEW_URL, NEW_SERVICE_KEY);

function parsePGDump(filePath, tableName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`COPY public\.${tableName} \((.*?)\) FROM stdin;([\\s\\S]*?)\\\\\.`, 'm');
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
      // Handle simple JSON parsing if needed
      try {
        if (val && (val.startsWith('{') || val.startsWith('['))) {
          val = JSON.parse(val.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
        }
      } catch(e) {}
      obj[col] = val;
    });
    return obj;
  });
}

async function run() {
  console.log("📂 Membaca backup materi dari public_dump.sql...");
  
  const workspaces = parsePGDump('public_dump.sql', 'v2_workspaces');
  const curriculums = parsePGDump('public_dump.sql', 'v2_curriculums');

  console.log(`♻️ Ditemukan ${workspaces.length} Batch dan ${curriculums.length} Materi.`);

  if (workspaces.length > 0) {
    console.log("🚀 Memulihkan Batch...");
    const { error } = await newSupabase.from('v2_workspaces').upsert(workspaces);
    if (error) console.error("   ❌ Gagal Batch:", error.message);
    else console.log("   ✅ Batch Pulih!");
  }

  if (curriculums.length > 0) {
    console.log("🚀 Memulihkan Post-Test & Materi...");
    const { error } = await newSupabase.from('v2_curriculums').upsert(curriculums);
    if (error) console.error("   ❌ Gagal Materi:", error.message);
    else console.log("   ✅ Post-Test Pulih!");
  }
}

run();
