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
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-400" />
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Paid Subscribers
          </span>
        </h2>
        <p className="text-zinc-400">
          Track and manage active VIP subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
          <Crown className="absolute right-0 bottom-0 w-32 h-32 text-amber-500/10 pointer-events-none translate-x-4 translate-y-4" />
          <h3 className="text-amber-500 font-bold text-sm uppercase tracking-wider mb-2">Active Paid Users</h3>
          <p className="text-4xl font-black text-white">{premiumCount}</p>
        </div>
        <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-center">
          <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider mb-2">Total Monthly Revenue</h3>
          <p className="text-4xl font-black text-white">${(premiumCount * 9.99).toFixed(2)}</p>
          <p className="text-xs text-zinc-500 mt-2">Estimated (assuming $9.99/mo plan)</p>
        </div>
        <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-center items-start">
          <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider mb-4">Stripe Dashboard</h3>
          <Link href="https://dashboard.stripe.com/subscriptions" target="_blank" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm w-full text-center">
            Manage in Stripe
          </Link>
        </div>
      </div>

      <div className="bg-zinc-950/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-white/5 text-xs uppercase font-semibold text-zinc-300">
              <tr>
                <th className="px-6 py-4">Subscriber</th>
                <th className="px-6 py-4">Status / Role</th>
                <th className="px-6 py-4">Stripe ID</th>
                <th className="px-6 py-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscribers?.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-zinc-500 font-bold text-lg">
                              {(user.full_name || user.email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.full_name || 'Anonymous User'}</div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email || 'No email provided'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <ShieldCheck className="w-3 h-3" /> ADMIN
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">
                        <Crown className="w-3 h-3" /> ACTIVE VIP
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {user.stripe_customer_id ? (
                      <a 
                        href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                      >
                        {user.stripe_customer_id}
                      </a>
                    ) : (
                      <span className="text-zinc-600">Manual / Legacy</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-zinc-500" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!subscribers || subscribers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
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
