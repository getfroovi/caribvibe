import { Video, FileText, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500 mt-2 text-lg">Monitor your content and subscription metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-none relative overflow-hidden group hover:border-pink-500 transition-colors shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Videos</h3>
            <div className="p-2.5 bg-pink-50 text-pink-600 rounded-none"><Video className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">24</p>
        </div>
        
        <div className="bg-white border border-slate-200 p-6 rounded-none relative overflow-hidden group hover:border-violet-500 transition-colors shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Published Posts</h3>
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-none"><FileText className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">12</p>
        </div>
        
        <div className="bg-white border border-slate-200 p-6 rounded-none relative overflow-hidden group hover:border-amber-500 transition-colors shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Premium Subscribers</h3>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-none"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight relative z-10">1,024</p>
        </div>
      </div>
    </div>
  );
}
