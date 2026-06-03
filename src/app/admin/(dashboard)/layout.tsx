import { Video, FileText, Users, LogOut, Layers, ShieldCheck } from 'lucide-react';
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
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white p-6 flex flex-col h-full">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold tracking-tight text-black">
            theGriot.io <span className="font-normal text-gray-500">Admin</span>
          </h1>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Link href="/admin/series" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2.5 transition-colors rounded-none">
            <Layers className="w-4 h-4" />
            Series
          </Link>
          <Link href="/admin/videos" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2.5 transition-colors rounded-none">
            <Video className="w-4 h-4" />
            Episodes
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2.5 transition-colors rounded-none">
            <FileText className="w-4 h-4" />
            Blog & Timeline
          </Link>
          <Link href="/admin/subscribers" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2.5 transition-colors rounded-none">
            <Users className="w-4 h-4" />
            Subscribers
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2.5 transition-colors rounded-none">
            <ShieldCheck className="w-4 h-4" />
            Admins
          </Link>
          
          <div className="pt-8 pb-3 px-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settings</p>
          </div>
          
          <Link href="/admin/vip-settings" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2.5 transition-colors rounded-none">
            <Layers className="w-4 h-4" />
            VIP Rules
          </Link>
          <Link href="/admin/ad-settings" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2.5 transition-colors rounded-none">
            <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px] border border-current rounded-none">Ad</span>
            Ad Monetization
          </Link>
          <Link href="/admin/hero-slider" className="flex items-center gap-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2.5 transition-colors rounded-none">
            <Video className="w-4 h-4" />
            Hero Slider
          </Link>
        </nav>

        <form action="/auth/signout" method="post" className="mt-auto px-2">
          <button className="flex items-center gap-3 text-sm text-gray-500 hover:text-black transition-colors w-full group">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
