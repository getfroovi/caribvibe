'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, Edit2 } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';

export default function AdminSeriesPage() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trending Now');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  const loadSeries = async () => {
    const res = await fetch('/api/series');
    const data = await res.json();
    if (!data.error) setSeriesList(data);
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const handleSaveSeries = async () => {
    try {
      const url = editingId ? `/api/series?id=${editingId}` : '/api/series';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, category, thumbnail_url: thumbnailUrl, poster_url: posterUrl
        })
      });
      
      if (res.ok) {
        toast.success(editingId ? 'Series updated!' : 'Series created successfully!');
        setTitle(''); setDescription(''); setThumbnailUrl(''); setPosterUrl(''); setEditingId(null);
        loadSeries();
      } else {
        toast.error('Failed to save series');
      }
    } catch (error) {
      toast.error('Error saving series');
    }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setTitle(s.title);
    setDescription(s.description || '');
    setCategory(s.category || 'Trending Now');
    setThumbnailUrl(s.thumbnail_url || '');
    setPosterUrl(s.poster_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this series? All its episodes will also be deleted.')) return;
    try {
      const res = await fetch(`/api/series?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Series deleted');
        loadSeries();
      } else {
        toast.error('Failed to delete series');
      }
    } catch (error) {
      toast.error('Error deleting series');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h2 className="text-3xl font-bold mb-6">Series Manager</h2>
      <p className="text-gray-400 mb-8">Create and manage your Series here. Once created, attach Episodes to them from the Video Manager.</p>

      {/* Form */}
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl space-y-6 mb-12">
        <h3 className="text-xl font-bold">{editingId ? 'Edit Series' : 'Create New Series'}</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Series Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Island Whispers" className="bg-zinc-800 border-zinc-700" />
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="flex min-h-[80px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300"
              placeholder="Synopsis of the series..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Homepage Category</Label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
            >
              <option value="Trending Now">Trending Now</option>
              <option value="New Releases">New Releases</option>
              <option value="Exclusive">Exclusive</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <ImageUploader 
              label="Vertical Poster (9:16)" 
              aspectRatio="9:16" 
              currentUrl={posterUrl} 
              onUpload={setPosterUrl} 
            />
            <ImageUploader 
              label="Horizontal Thumbnail (16:9)" 
              aspectRatio="16:9" 
              currentUrl={thumbnailUrl} 
              onUpload={setThumbnailUrl} 
            />
          </div>

          <div className="flex gap-4 mt-4">
            <Button onClick={handleSaveSeries} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
              {editingId ? 'Save Changes' : 'Create Series'}
            </Button>
            {editingId && (
              <Button onClick={() => { setEditingId(null); setTitle(''); setDescription(''); setThumbnailUrl(''); setPosterUrl(''); }} variant="outline" className="flex-1">
                Cancel Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Existing Series</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((s) => (
            <div key={s.id} className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden flex flex-col">
              <div className="h-48 bg-zinc-800 relative">
                {s.poster_url || s.thumbnail_url ? (
                  <img src={s.poster_url || s.thumbnail_url} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">No Poster</div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-xs px-2 py-1 rounded text-white border border-white/10">
                  {s.category}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-lg mb-1">{s.title}</h4>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{s.description}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <Button onClick={() => handleEdit(s)} variant="secondary" size="sm" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button onClick={() => handleDelete(s.id)} variant="destructive" size="sm" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {seriesList.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-zinc-900 border border-white/10 rounded-xl">
              No series found. Create one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
