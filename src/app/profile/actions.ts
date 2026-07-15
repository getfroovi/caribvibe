'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get('fullName') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    // 1. Update profiles table
    if (fullName !== undefined || username !== undefined) {
      const updates: { full_name?: string | null, username?: string | null } = {};
      if (fullName !== undefined) updates.full_name = fullName;
      if (username !== undefined) updates.username = username || null; // null if empty to avoid unique constraint on empty strings

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) {
        if (profileError.code === '23505') { // Unique violation
          throw new Error('This username is already taken. Please choose another one.');
        }
        throw profileError;
      }
    }

    // 2. Update auth email if changed
    if (email && email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: email,
      });
      if (authError) throw authError;
    }

    revalidatePath('/profile');
    return { success: 'Profile updated successfully!' };
  } catch (err: any) {
    console.error('Update profile error:', err);
    return { error: err.message || 'Failed to update profile' };
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    
    return { success: 'Password updated successfully!' };
  } catch (err: any) {
    console.error('Update password error:', err);
    return { error: err.message || 'Failed to update password' };
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
