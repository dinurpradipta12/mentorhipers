require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('v2_workspaces')
    .select('id, name, schedules')
    .eq('id', '883cabd8-502d-48c3-a868-177b4f34d3b8')
    .single();

  if (error) console.error("Error:", error.message);
  console.log("Result:", JSON.stringify(data, null, 2));
}

check();
