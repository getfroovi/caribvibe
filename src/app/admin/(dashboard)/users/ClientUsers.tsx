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
      <div className="bg-white border border-black rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-lg font-black text-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-black" />
          Create Administrator
        </h3>
        <form action={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
            <input name="name" required placeholder="Admin Name" className="w-full bg-white border border-black rounded-none px-3 py-2 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</label>
            <input name="email" type="email" required placeholder="admin@example.com" className="w-full bg-white border border-black rounded-none px-3 py-2 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
            <input name="password" type="password" required placeholder="Min 6 chars" className="w-full bg-white border border-black rounded-none px-3 py-2 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
          </div>
          <Button type="submit" disabled={loadingId === 'create'} className="bg-black hover:bg-gray-800 text-white font-bold h-[38px] rounded-none uppercase tracking-widest text-xs border border-transparent">
            {loadingId === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Admin'}
          </Button>
        </form>
      </div>

      <div className="bg-white border border-black rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {error && (
          <div className="p-4 bg-red-50 border-b border-black text-red-600 text-sm font-bold uppercase tracking-wider">
            {error}
          </div>
        )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-black">
          <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-black tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <motion.tr 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-black flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-gray-100 flex items-center justify-center overflow-hidden border border-black">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="uppercase tracking-wide">{user.full_name || 'Anonymous User'}</div>
                    <div className="text-[10px] text-gray-500 font-bold font-mono mt-0.5">{user.id.slice(0, 8)}...</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border ${
                    user.role === 'admin' 
                      ? 'bg-black text-white border-black' 
                      : user.role === 'premium'
                      ? 'bg-gray-100 text-black border-black'
                      : 'bg-white text-gray-500 border-gray-300'
                  }`}>
                    {user.role === 'admin' && <ShieldAlert className="w-3 h-3" />}
                    {user.role === 'premium' && <ShieldCheck className="w-3 h-3" />}
                    {user.role === 'free' && <UserIcon className="w-3 h-3" />}
                    {(user.role || 'free').toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-black">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {loadingId === user.id ? (
                    <div className="flex justify-end pr-4">
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      {user.role !== 'admin' ? (
                        <Button 
                          onClick={() => handleRoleChange(user.id, 'admin')}
                          variant="outline" 
                          size="sm"
                          className="rounded-none border-black text-black hover:bg-gray-100 font-bold uppercase tracking-widest text-[10px]"
                        >
                          Make Admin
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleRoleChange(user.id, 'free')}
                          variant="outline" 
                          size="sm"
                          className="rounded-none border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-black hover:border-black font-bold uppercase tracking-widest text-[10px]"
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
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold uppercase tracking-widest bg-gray-50">
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
