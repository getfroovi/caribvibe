'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateUserRole, createAdminUser } from './actions';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
};

export function ClientUsers({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId);
    setError(null);

    const result = await updateUserRole(userId, newRole);

    if (result.error) {
      setError(result.error);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    
    setLoadingId(null);
  };

  const handleCreateAdmin = async (formData: FormData) => {
    setLoadingId('create');
    setError(null);
    const result = await createAdminUser(formData);
    if (result.error) {
      setError(result.error);
    } else {
      // Reload page to get new users
      window.location.reload();
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Create Admin Form */}
      <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Create Administrator
        </h3>
        <form action={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Display Name</label>
            <input name="name" required placeholder="Admin Name" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Email</label>
            <input name="email" type="email" required placeholder="admin@example.com" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Password</label>
            <input name="password" type="password" required placeholder="Min 6 chars" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
          </div>
          <Button type="submit" disabled={loadingId === 'create'} className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-[38px]">
            {loadingId === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Admin'}
          </Button>
        </form>
      </div>

      <div className="bg-zinc-950/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-white/5 text-xs uppercase font-semibold text-zinc-300">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user, index) => (
              <motion.tr 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  <div>
                    <div>{user.full_name || 'Anonymous User'}</div>
                    <div className="text-xs text-zinc-500 font-normal font-mono mt-0.5">{user.id.slice(0, 8)}...</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    user.role === 'admin' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : user.role === 'premium'
                      ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                      : 'bg-zinc-800 text-zinc-300 border border-white/10'
                  }`}>
                    {user.role === 'admin' && <ShieldAlert className="w-3 h-3" />}
                    {user.role === 'premium' && <ShieldCheck className="w-3 h-3" />}
                    {user.role === 'free' && <UserIcon className="w-3 h-3" />}
                    {(user.role || 'free').toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {loadingId === user.id ? (
                    <div className="flex justify-end pr-4">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      {user.role !== 'admin' ? (
                        <Button 
                          onClick={() => handleRoleChange(user.id, 'admin')}
                          variant="outline" 
                          size="sm"
                          className="bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400"
                        >
                          Make Admin
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleRoleChange(user.id, 'free')}
                          variant="outline" 
                          size="sm"
                          className="bg-zinc-800 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                        >
                          Revoke Admin
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  No users found in the database.
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
