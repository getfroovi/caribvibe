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
      <h2 className="text-3xl font-black mb-6 text-black tracking-tight">Blog & Timeline Builder</h2>
      
      <div className="bg-white border border-black p-6 rounded-none space-y-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-bold border-b border-gray-200 pb-2 text-black uppercase tracking-tight">Post Details</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title</Label>
            <Input placeholder="Post Title" className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Slug</Label>
            <Input placeholder="post-slug" className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Content</Label>
            <textarea 
              rows={6}
              className="flex min-h-[80px] w-full border border-black bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black rounded-none" 
              placeholder="Write your blog post here..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-black p-6 rounded-none space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="text-xl font-bold text-black uppercase tracking-tight">Timeline Milestones</h3>
          <Button onClick={handleAddTimelineEvent} variant="outline" size="sm" className="border-black text-black rounded-none hover:bg-gray-100 font-bold uppercase tracking-widest text-[10px]">
            + Add Milestone
          </Button>
        </div>
        
        {timeline.map((event, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-black bg-gray-50 rounded-none relative">
            <div className="absolute top-2 right-2 text-xs font-bold text-gray-400">#{index + 1}</div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date/Time</Label>
              <Input type="datetime-local" className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Milestone Title</Label>
              <Input placeholder="E.g., Arrived at the resort" className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Short Description</Label>
              <Input placeholder="A quick summary of this moment..." className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Linked Video ID (Optional)</Label>
              <Input placeholder="UUID of a video from the Video Manager" className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
            </div>
          </div>
        ))}

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full bg-black text-white font-bold uppercase tracking-widest rounded-none hover:bg-gray-800 transition-colors h-12">
            Save Blog Post & Timeline
          </Button>
        </div>
      </div>
    </div>
  );
}
