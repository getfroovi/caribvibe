import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ClientProfile } from './ClientProfile';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile to get their name and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, role')
    .eq('id', user.id)
    .single();

  const userProfile = {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    role: profile?.role || 'free',
  };

  const { data: vipSettings } = await supabase.from('vip_settings').select('monthly_price').limit(1).single();
  const monthlyPrice = vipSettings?.monthly_price || 9.99;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-24 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center md:text-left max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-gray-400">
            Manage your account settings, update your password, and check your subscription status.
          </p>
        </div>

        <ClientProfile userProfile={userProfile} monthlyPrice={monthlyPrice} />
      </main>
    </div>
  );
}
