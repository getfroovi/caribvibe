import { Video, FileText, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-black">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Monitor your content and subscription metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-black p-6 rounded-none relative overflow-hidden group hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Videos</h3>
            <div className="p-2 bg-gray-100 rounded-none text-black"><Video className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-black text-black tracking-tighter">24</p>
        </div>
        
        <div className="bg-white border border-black p-6 rounded-none relative overflow-hidden group hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Published Posts</h3>
            <div className="p-2 bg-gray-100 rounded-none text-black"><FileText className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-black text-black tracking-tighter">12</p>
        </div>
        
        <div className="bg-white border border-black p-6 rounded-none relative overflow-hidden group hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Premium Subscribers</h3>
            <div className="p-2 bg-gray-100 rounded-none text-black"><Users className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-black text-black tracking-tighter relative z-10">1,024</p>
        </div>
      </div>
    </div>
  );
}
