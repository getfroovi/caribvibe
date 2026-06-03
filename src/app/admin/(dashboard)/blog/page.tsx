'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminBlogPage() {
  const [timeline, setTimeline] = useState([{ date: '', title: '', desc: '', videoId: '' }]);

  const handleAddTimelineEvent = () => {
    setTimeline([...timeline, { date: '', title: '', desc: '', videoId: '' }]);
  };

  const handleSave = () => {
    toast.success('Blog post saved as draft!');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h2 className="text-3xl font-extrabold mb-6 text-slate-900 tracking-tight">Blog & Timeline Builder</h2>
      
      <div className="bg-white border border-slate-200 p-8 rounded-none space-y-6 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-pink-500" />
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900 uppercase tracking-tight">Post Details</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</Label>
            <Input placeholder="Post Title" className="bg-slate-50 border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500" />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</Label>
            <Input placeholder="post-slug" className="bg-slate-50 border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500" />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</Label>
            <textarea 
              rows={6}
              className="flex min-h-[80px] w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500 rounded-none" 
              placeholder="Write your blog post here..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-8 rounded-none space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Timeline Milestones</h3>
          <Button onClick={handleAddTimelineEvent} variant="outline" size="sm" className="border-slate-300 text-violet-600 rounded-none hover:bg-violet-50 hover:border-violet-300 font-bold uppercase tracking-wider text-[10px]">
            + Add Milestone
          </Button>
        </div>
        
        {timeline.map((event, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border border-slate-200 bg-slate-50 rounded-none relative">
            <div className="absolute top-2 right-2 text-xs font-bold text-slate-400">#{index + 1}</div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date/Time</Label>
              <Input type="datetime-local" className="bg-white border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-violet-500" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Milestone Title</Label>
              <Input placeholder="E.g., Arrived at the resort" className="bg-white border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-violet-500" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Short Description</Label>
              <Input placeholder="A quick summary of this moment..." className="bg-white border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-violet-500" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Video ID (Optional)</Label>
              <Input placeholder="UUID of a video from the Video Manager" className="bg-white border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-violet-500" />
            </div>
          </div>
        ))}

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full bg-violet-600 text-white font-bold uppercase tracking-wider rounded-none hover:bg-violet-700 transition-colors h-12">
            Save Blog Post & Timeline
          </Button>
        </div>
      </div>
    </div>
  );
}
