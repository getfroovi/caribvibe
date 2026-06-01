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
      <h2 className="text-3xl font-bold mb-6">Blog & Timeline Builder</h2>
      
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl space-y-6 mb-8">
        <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Post Details</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input placeholder="Post Title" className="bg-zinc-800 border-zinc-700" />
          </div>
          <div className="grid gap-2">
            <Label>Slug</Label>
            <Input placeholder="post-slug" className="bg-zinc-800 border-zinc-700" />
          </div>
          <div className="grid gap-2">
            <Label>Content</Label>
            <textarea 
              rows={6}
              className="flex min-h-[80px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              placeholder="Write your blog post here..."
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xl font-semibold">Timeline Milestones</h3>
          <Button onClick={handleAddTimelineEvent} variant="outline" size="sm" className="border-pink-500 text-pink-500 hover:bg-pink-500/10">
            + Add Milestone
          </Button>
        </div>
        
        {timeline.map((event, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-zinc-700 bg-zinc-800/50 rounded-lg">
            <div className="grid gap-2">
              <Label>Date/Time</Label>
              <Input type="datetime-local" className="bg-zinc-800 border-zinc-700" />
            </div>
            <div className="grid gap-2">
              <Label>Milestone Title</Label>
              <Input placeholder="E.g., Arrived at the resort" className="bg-zinc-800 border-zinc-700" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Short Description</Label>
              <Input placeholder="A quick summary of this moment..." className="bg-zinc-800 border-zinc-700" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Linked Video ID (Optional)</Label>
              <Input placeholder="UUID of a video from the Video Manager" className="bg-zinc-800 border-zinc-700" />
            </div>
          </div>
        ))}

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold hover:opacity-90">
            Save Blog Post & Timeline
          </Button>
        </div>
      </div>
    </div>
  );
}
