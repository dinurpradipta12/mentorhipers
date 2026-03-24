import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/dinurm.pradipta/mentorhipers/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('mentor_profile').select('*');
  console.log("MENTOR PROFILE DATA:", data);
  if (error) {
    console.error("ERROR:", error);
  }
}
check();
