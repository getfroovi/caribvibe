import { Video, FileText, Users, LogOut, Layers } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  
  if (profile?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950/50 p-6 flex flex-col h-full backdrop-blur-xl">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-black bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent tracking-tighter">
            theGriot.io <span className="text-pink-500 font-normal">Admin</span>
          </h1>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Link href="/admin/series" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all">
            <Layers className="w-4 h-4" />
            Series
          </Link>
          <Link href="/admin/videos" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all">
            <Video className="w-4 h-4" />
            Episodes
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all">
            <FileText className="w-4 h-4" />
            Blog & Timeline
          </Link>
          <Link href="/admin/subscribers" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all">
            <Users className="w-4 h-4" />
            Subscribers
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all">
            <ShieldCheck className="w-4 h-4" />
            Admins
          </Link>
          
          <div className="pt-6 pb-2 px-3">
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Settings</p>
          </div>
          
          <Link href="/admin/vip-settings" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all">
            <Layers className="w-4 h-4" />
            VIP Rules
          </Link>
          <Link href="/admin/hero-slider" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all">
            <Video className="w-4 h-4" />
            Hero Slider
          </Link>
        </nav>

        <form action="/auth/signout" method="post" className="mt-auto px-2">
          <button className="flex items-center gap-3 text-sm text-zinc-500 hover:text-red-400 transition-colors w-full group">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
