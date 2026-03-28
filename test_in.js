const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: mems } = await supabase
        .from('v2_memberships')
        .select('id, profile_id')
        .eq('workspace_id', 'be0763e3-4df5-46ac-9f11-c80d007b1188');

  const profileIds = [...new Set(mems.map(m => m.profile_id).filter(Boolean))];
  const validIds = profileIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
  
  const { data: profiles, error } = await supabase
        .from('v2_profiles')
        .select('id, full_name, avatar_url')
        .in('id', validIds);

  console.log("Found members:", validIds.length);
  console.log("Found profiles:", profiles?.length);
  if (error) console.error("Error:", error);
}

check();
