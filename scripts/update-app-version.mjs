import { createClient } from '@supabase/supabase-js';

// Environment variables are provided by the build platform (Cloudflare/Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Skipping version update: Supabase credentials not found in environment.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateVersion() {
  const newVersion = `v${Date.now()}`;
  console.log(`Updating app version to: ${newVersion}...`);
  
  const { error } = await supabase
    .from('app_settings')
    .update({ app_version: newVersion })
    .eq('id', 1);

  if (error) {
    console.error('Failed to update app version:', error.message);
    process.exit(1);
  }

  console.log('App version updated successfully. Real-time notification broadcasted!');
}

updateVersion();
