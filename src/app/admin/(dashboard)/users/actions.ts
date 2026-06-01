'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  
  // Verify the person doing this is an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentUserProfile?.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can manage roles' };
  }

  // Prevent admin from demoting themselves (failsafe)
  if (userId === user.id && newRole !== 'admin') {
    return { error: 'You cannot demote yourself. Another admin must do it.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    console.error('Error updating role:', error);
    return { error: 'Failed to update user role' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function createAdminUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return { error: 'Missing SUPABASE_SERVICE_ROLE_KEY in environment variables. Cannot create user securely.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify caller is admin
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentUserProfile?.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can create new admins' };
  }

  // Use the admin API with the service role key
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Create the user
  const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name }
  });

  if (createError) {
    console.error('Failed to create user:', createError);
    return { error: createError.message };
  }

  if (newUserData.user) {
    // 2. Set their role to admin (service role key bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', newUserData.user.id);

    if (roleError) {
      console.error('Failed to set role:', roleError);
      return { error: 'User created but failed to set admin role' };
    }
  }

  revalidatePath('/admin/users');
  return { success: 'Administrator created successfully!' };
}
