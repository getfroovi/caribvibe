'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateUserRole } from './actions';

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

  return (
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
  );
}
