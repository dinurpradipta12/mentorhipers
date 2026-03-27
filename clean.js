import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgxpmqcyupjkvefhizln.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneHBtcWN5dXBqa3ZlZmhpemxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzNzg0OCwiZXhwIjoyMDg5NTEzODQ4fQ.PgR4rL9oeKxGiPMzLCdlpPEAnx2EnN7TI4qzGIksMns';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanStuckUser() {
  console.log("Fetching users to clean up stuck 'allisha'...");
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const stuckUser = users.find(u => u.email === 'allisha@mentorhipers.local');
  
  if (stuckUser) {
    console.log(`Found stuck user 'allisha' with ID: ${stuckUser.id}. Deleting...`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(stuckUser.id);
    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
    } else {
      console.log("Successfully deleted stuck user! You can now register 'allisha' again.");
    }
  } else {
    console.log("Stuck user not found.");
  }
}

cleanStuckUser();
