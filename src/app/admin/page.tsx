import { Video, FileText, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Dashboard Overview</h2>
        <p className="text-sm text-zinc-400 mt-1">Monitor your content and subscription metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-sm font-medium">Total Videos</h3>
            <div className="p-2 bg-white/5 rounded-lg text-zinc-300 group-hover:bg-white/10 transition-colors"><Video className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-semibold text-white tracking-tight">24</p>
        </div>
        
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-sm font-medium">Published Posts</h3>
            <div className="p-2 bg-white/5 rounded-lg text-zinc-300 group-hover:bg-white/10 transition-colors"><FileText className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-semibold text-white tracking-tight">12</p>
        </div>
        
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-pink-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-20"><TrendingUp className="w-32 h-32 text-pink-500 transform translate-x-1/3 -translate-y-1/3" /></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-zinc-400 text-sm font-medium">Premium Subscribers</h3>
            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><Users className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 tracking-tight relative z-10">1,024</p>
        </div>
      </div>
    </div>
  );
}
