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
      <div className="bg-white border border-slate-200 rounded-none p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-violet-600" />
          Create Administrator
        </h3>
        <form action={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Display Name</label>
            <input name="name" required placeholder="Admin Name" className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
            <input name="email" type="email" required placeholder="admin@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
            <input name="password" type="password" required placeholder="Min 6 chars" className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" />
          </div>
          <Button type="submit" disabled={loadingId === 'create'} className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-[38px] rounded-none uppercase tracking-wider text-xs border border-transparent shadow-sm">
            {loadingId === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Admin'}
          </Button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-none overflow-hidden shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-600 text-sm font-semibold uppercase tracking-wider">
            {error}
          </div>
        )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-900">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user, index) => (
              <motion.tr 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 font-extrabold text-slate-900 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="tracking-tight">{user.full_name || 'Anonymous User'}</div>
                    <div className="text-xs text-slate-500 font-semibold font-mono mt-0.5">{user.id.slice(0, 8)}...</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-bold uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-violet-100 text-violet-700' 
                      : user.role === 'premium'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.role === 'admin' && <ShieldAlert className="w-3.5 h-3.5" />}
                    {user.role === 'premium' && <ShieldCheck className="w-3.5 h-3.5" />}
                    {user.role === 'free' && <UserIcon className="w-3.5 h-3.5" />}
                    {(user.role || 'free').toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {loadingId === user.id ? (
                    <div className="flex justify-end pr-4">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      {user.role !== 'admin' ? (
                        <Button 
                          onClick={() => handleRoleChange(user.id, 'admin')}
                          variant="outline" 
                          size="sm"
                          className="rounded-none border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-violet-600 hover:border-violet-300 font-bold uppercase tracking-wider text-xs"
                        >
                          Make Admin
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleRoleChange(user.id, 'free')}
                          variant="outline" 
                          size="sm"
                          className="rounded-none border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-600 hover:border-red-300 font-bold uppercase tracking-wider text-xs"
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
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-semibold uppercase tracking-wider bg-slate-50">
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
