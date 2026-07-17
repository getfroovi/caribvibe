import { Video, FileText, Users, LogOut, Layers, ShieldCheck, ShoppingBag, Code, BookOpen } from 'lucide-react';
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
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col h-full shadow-sm z-10 relative">
        <div className="mb-10 px-2 flex items-center gap-2">
          <img src="/logo.png" alt="theGriot.io" className="h-8 w-auto object-contain" />
          <span className="font-normal text-slate-400 text-sm mt-1">Admin</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Link href="/admin/series" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-pink-500">
            <Layers className="w-4 h-4" />
            Series
          </Link>
          <Link href="/admin/videos" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-pink-500">
            <Video className="w-4 h-4" />
            Episodes
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-violet-500">
            <FileText className="w-4 h-4" />
            Blog & Timeline
          </Link>
          <Link href="/admin/subscribers" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-violet-500">
            <Users className="w-4 h-4" />
            Subscribers
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-amber-500">
            <ShieldCheck className="w-4 h-4" />
            Admins
          </Link>
          
          <div className="pt-8 pb-3 px-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Settings</p>
          </div>
          
          <Link href="/admin/vip-settings" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-pink-500">
            <Layers className="w-4 h-4" />
            VIP Rules
          </Link>
          <Link href="/admin/ad-settings" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-pink-500">
            <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px] border border-current rounded-none">Ad</span>
            Ad Monetization
          </Link>
          <Link href="/admin/hero-slider" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-pink-500">
            <Video className="w-4 h-4" />
            Hero Slider
          </Link>
          <Link href="/admin/store-settings" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-pink-500">
            <ShoppingBag className="w-4 h-4" />
            Store Settings
          </Link>
          <Link href="/admin/magazine-settings" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-pink-500">
            <BookOpen className="w-4 h-4" />
            Magazine Embed
          </Link>
          <Link href="/admin/custom-code" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2.5 transition-colors rounded-none border-l-2 border-transparent hover:border-pink-500">
            <Code className="w-4 h-4" />
            Custom Code
          </Link>
        </nav>

        <form action="/auth/signout" method="post" className="mt-auto px-2">
          <button className="flex items-center gap-3 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-2.5 transition-colors w-full group rounded-none border-l-2 border-transparent hover:border-red-500">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {children}
      </main>
    </div>
  );
}
