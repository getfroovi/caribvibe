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
        <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-3 text-slate-900">
          <div className="p-2 bg-amber-50 rounded-none text-amber-600">
            <Crown className="w-8 h-8" />
          </div>
          <span className="text-slate-900 tracking-tight">
            Paid Subscribers
          </span>
        </h2>
        <p className="text-slate-500 text-lg">
          Track and manage active VIP subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-none p-6 relative overflow-hidden shadow-sm group hover:border-amber-500 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
          <Crown className="absolute right-0 bottom-0 w-32 h-32 text-slate-50 pointer-events-none translate-x-4 translate-y-4 group-hover:text-amber-50 transition-colors" />
          <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-2 relative z-10">Active Paid Users</h3>
          <p className="text-4xl font-extrabold text-slate-900 relative z-10">{premiumCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-none p-6 flex flex-col justify-center shadow-sm group hover:border-green-500 transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
          <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-2 relative z-10">Total Monthly Revenue</h3>
          <p className="text-4xl font-extrabold text-slate-900 relative z-10">${(premiumCount * 9.99).toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2 relative z-10">Estimated (assuming $9.99/mo plan)</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-none p-6 shadow-sm relative overflow-hidden">
          <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-4">Square Dashboard</h3>
          <Link href="https://squareup.com/dashboard/sales/subscriptions" target="_blank" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-none uppercase tracking-wider transition-colors text-sm w-full text-center inline-block">
            Manage in Square
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-none overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Square ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers?.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-none bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-slate-500 font-extrabold text-lg uppercase">
                              {(user.full_name || user.email || '?')[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 tracking-tight">{user.full_name || 'Anonymous User'}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email || 'No email provided'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-bold bg-violet-100 text-violet-700 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" /> ADMIN
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-bold bg-amber-50 text-amber-600 uppercase tracking-wider">
                        <Crown className="w-3.5 h-3.5" /> ACTIVE VIP
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-medium tracking-wider">
                    {user.square_customer_id ? (
                      <a 
                        href={`https://squareup.com/dashboard/customers/directory/${user.square_customer_id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-4"
                      >
                        {user.square_customer_id}
                      </a>
                    ) : (
                      <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold">Manual / Legacy</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!subscribers || subscribers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 bg-slate-50 border-t border-slate-200">
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
