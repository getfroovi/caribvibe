import { createClient } from '@/lib/supabase/server';
import { ClientUsers } from './ClientUsers';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch all users from profiles table
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black mb-2 text-black tracking-tight">
          User Management
        </h2>
        <p className="text-gray-500 font-bold uppercase tracking-wider">
          View all registered users and manage their access roles.
        </p>
      </div>

      <ClientUsers initialUsers={users || []} />
    </div>
  );
}
