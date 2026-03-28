const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking v2_submissions 400 error...");
  const res1 = await supabase.from('v2_submissions').select('id, curriculum_id, profile_id, score, grade, submitted_at, has_passed').eq('workspace_id', 'be0763e3-4df5-46ac-9f11-c80d007b1188');
  console.log("Submissions Result:", JSON.stringify(res1, null, 2));

  console.log("Checking v2_profiles 500 error...");
  const res2 = await supabase.from('v2_profiles').select('id, full_name, avatar_url').eq('id', '2c73c0fd-8462-4823-986b-795ae9efd37d');
  console.log("Profiles Result:", JSON.stringify(res2, null, 2));
}

check();
