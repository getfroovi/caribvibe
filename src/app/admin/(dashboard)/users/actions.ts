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
