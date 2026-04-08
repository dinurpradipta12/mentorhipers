'use server'

import { supabaseAdminV2 } from '@/lib/supabaseAdmin'

/**
 * Register a new student into the V2 platform.
 * 1. Creates a user in Supabase auth.users.
 * 2. Creates a profile in v2_profiles.
 * 3. Adds the student to a specific batch (v2_memberships).
 * 
 * NOTE: Requires SUPABASE_V2_SERVICE_ROLE_KEY to work.
 */
export async function registerStudentAction(data: { fullName: string, username: string, password: string, workspaceId: string }) {
  if (!supabaseAdminV2) {
     return { success: false, error: 'SUPABASE_V2_SERVICE_ROLE_KEY is missing in env. Server Action restricted.' }
  }

  try {
   //Generate synthetic email for Auth identity (hidden from user)
    const syntheticEmail = `${data.username.toLowerCase().trim()}@ruangsosmed.local`;

   //1. Create Auth User (Admin bypass)
    const { data: authUser, error: authError } = await supabaseAdminV2.auth.admin.createUser({
      email: syntheticEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: { 
        full_name: data.fullName,
        username: data.username.toLowerCase().trim()
      }
    })

    if (authError) {
       console.error("Auth creation error:", authError.message);
       return { success: false, error: authError.message }
    }

    if (!authUser.user) return { success: false, error: "Failed to create user auth identity." }

   //2. Create Profile in v2_profiles
   //Note: We include username in the payload. 
   //If the database column doesn't exist yet, this will error - 
   //but it's the correct path for the feature.
    const { error: profileError } = await supabaseAdminV2
      .from('v2_profiles')
      .upsert({
        id: authUser.user.id,
        full_name: data.fullName,
        username: data.username.toLowerCase().trim(),
        role: 'student'
      })

    if (profileError) {
       console.error("Profile creation error:", profileError.message);
      //We don't roll back Auth to keep it simple, but in prod we might delete authUser.
       return { success: false, error: `Database Error: ${profileError.message}` }
    }

   //3. Create Membership for the Batch
    const { error: memberError } = await supabaseAdminV2
      .from('v2_memberships')
      .insert({
        profile_id: authUser.user.id,
        workspace_id: data.workspaceId,
        role: 'student'
      })

    if (memberError) {
       console.error("Membership creation error:", memberError.message);
       return { success: false, error: memberError.message }
    }

    return { 
       success: true, 
       userId: authUser.user.id 
    }
  } catch (error: any) {
    console.error("Critical server error:", error.message);
    return { success: false, error: error.message || 'Unknown server error during registration.' }
  }
}

export async function updateWorkspaceSchedulesAction(workspaceId: string, schedules: any[]) {
   if (!supabaseAdminV2) {
     return { success: false, error: 'SUPABASE_V2_SERVICE_ROLE_KEY is missing in env. Server Action restricted.' }
   }
   
   try {
      const { error } = await supabaseAdminV2
        .from('v2_workspaces')
        .update({ schedules })
        .eq('id', workspaceId);
        
      if (error) return { success: false, error: error.message };
      return { success: true };
   } catch (error: any) {
      return { success: false, error: error.message };
   }
}

export async function createNotificationAction(data: { 
  profileId: string, 
  workspaceId?: string, 
  title: string, 
  message: string, 
  type: 'material' | 'assignment' | 'grade' | 'feedback' | 'announcement',
  link?: string 
}) {
  if (!supabaseAdminV2) {
    return { success: false, error: 'SUPABASE_V2_SERVICE_ROLE_KEY is missing.' };
  }

  try {
    const { error } = await supabaseAdminV2
      .from('v2_notifications')
      .insert({
        profile_id: data.profileId,
        workspace_id: data.workspaceId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link
      });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
