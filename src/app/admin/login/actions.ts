'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  // 1. Authenticate the user
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return redirect(`/admin/login?error=${encodeURIComponent(authError.message)}`);
  }

  // 2. Fetch their role from profiles table
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/admin/login?error=Authentication failed');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    // 3. Not an admin! Sign them out immediately.
    await supabase.auth.signOut();
    return redirect('/admin/login?error=Forbidden: Not an Administrator');
  }

  // 4. Success. Redirect to admin dashboard
  revalidatePath('/', 'layout');
  redirect('/admin');
}
