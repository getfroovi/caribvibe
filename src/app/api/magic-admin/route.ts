import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be logged in first. Go to /login.' }, { status: 401 });
  }

  // Update their role to admin (this works because RLS allows users to update their own profiles right now)
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
