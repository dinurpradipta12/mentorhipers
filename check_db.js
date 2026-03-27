const { createClient } = require('@supabase/supabase-js');
const url = 'https://bgxpmqcyupjkvefhizln.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneHBtcWN5dXBqa3ZlZmhpemxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzNzg0OCwiZXhwIjoyMDg5NTEzODQ4fQ.PgR4rL9oeKxGiPMzLCdlpPEAnx2EnN7TI4qzGIksMns';
const supabase = createClient(url, key);

async function check() {
  const { data } = await supabase.from('v2_memberships').select('attendance').eq('profile_id', '0840a55e-191e-4fb9-8410-39e655810a8e').single();
  console.log('ATTENDANCE_RAW:', JSON.stringify(data?.attendance));
}
check();
