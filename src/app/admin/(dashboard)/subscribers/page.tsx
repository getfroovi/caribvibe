import { createClient } from '@/lib/supabase/server';
import { Crown, Mail, Calendar, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminSubscribersPage() {
  const supabase = await createClient();

  // Fetch all premium and admin users
  const { data: subscribers, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['premium', 'admin'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscribers:', error);
  }

  const premiumCount = subscribers?.filter(s => s.role === 'premium').length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3 text-black">
          <Crown className="w-8 h-8 text-black" />
          <span className="text-black uppercase tracking-tight">
            Paid Subscribers
          </span>
        </h2>
        <p className="text-gray-500 font-bold uppercase tracking-wider">
          Track and manage active VIP subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-black rounded-none p-6 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Crown className="absolute right-0 bottom-0 w-32 h-32 text-gray-100 pointer-events-none translate-x-4 translate-y-4" />
          <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2 relative z-10">Active Paid Users</h3>
          <p className="text-4xl font-black text-black relative z-10">{premiumCount}</p>
        </div>
        <div className="bg-white border border-black rounded-none p-6 flex flex-col justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Total Monthly Revenue</h3>
          <p className="text-4xl font-black text-black">${(premiumCount * 9.99).toFixed(2)}</p>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">Estimated (assuming $9.99/mo plan)</p>
        </div>
        <div className="bg-white border border-black rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-4">Square Dashboard</h3>
          <Link href="https://squareup.com/dashboard/sales/subscriptions" target="_blank" className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-none uppercase tracking-widest transition-colors text-[10px] w-full text-center inline-block">
            Manage in Square
          </Link>
        </div>
      </div>

      <div className="bg-white border border-black rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 border-b border-black tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">User</th>
                <th className="px-6 py-4 font-bold tracking-wider">Role</th>
                <th className="px-6 py-4 font-bold tracking-wider">Square ID</th>
                <th className="px-6 py-4 font-bold tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none bg-gray-100 border border-black overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-black font-black text-lg uppercase">
                              {(user.full_name || user.email || '?')[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-black uppercase tracking-tight">{user.full_name || 'Anonymous User'}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-black" /> {user.email || 'No email provided'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-black bg-black text-white uppercase tracking-widest border border-black">
                        <ShieldCheck className="w-3 h-3" /> ADMIN
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-black bg-gray-100 text-black uppercase tracking-widest border border-black">
                        <Crown className="w-3 h-3" /> ACTIVE VIP
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] font-bold tracking-wider">
                    {user.square_customer_id ? (
                      <a 
                        href={`https://squareup.com/dashboard/customers/directory/${user.square_customer_id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-black hover:text-gray-600 underline underline-offset-4"
                      >
                        {user.square_customer_id}
                      </a>
                    ) : (
                      <span className="text-gray-400 uppercase">Manual / Legacy</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
                      <Calendar className="w-4 h-4 text-black" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!subscribers || subscribers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold uppercase tracking-widest bg-gray-50 border-t border-black">
                    No active subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
