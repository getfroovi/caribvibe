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
      <h2 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight">Series Manager</h2>
      <p className="text-slate-500 mb-8 text-lg">Create and manage your Series here. Once created, attach Episodes to them from the Video Manager.</p>

      {/* Form */}
      <div className="bg-white border border-slate-200 p-8 rounded-none space-y-6 mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-violet-500" />
        <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{editingId ? 'Edit Series' : 'Create New Series'}</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Series Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Island Whispers" className="bg-slate-50 border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500" />
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</Label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="flex min-h-[80px] w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500 rounded-none"
              placeholder="Synopsis of the series..."
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Homepage Category</Label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500"
            >
              <option value="Trending Now">Trending Now</option>
              <option value="New Releases">New Releases</option>
              <option value="Exclusive">Exclusive</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
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

          <div className="flex gap-4 mt-6">
            <Button onClick={handleSaveSeries} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-none font-bold uppercase tracking-wider">
              {editingId ? 'Save Changes' : 'Create Series'}
            </Button>
            {editingId && (
              <Button onClick={() => { setEditingId(null); setTitle(''); setDescription(''); setThumbnailUrl(''); setPosterUrl(''); }} variant="outline" className="flex-1 rounded-none border-slate-300 text-slate-700 hover:bg-slate-100 font-bold uppercase tracking-wider">
                Cancel Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div>
        <h3 className="text-2xl font-extrabold mb-6 text-slate-900 tracking-tight">Existing Series</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-none overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-md group">
              <div className="h-48 bg-slate-100 relative border-b border-slate-200 overflow-hidden">
                {s.poster_url || s.thumbnail_url ? (
                  <img src={s.poster_url || s.thumbnail_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-semibold uppercase tracking-wider">No Poster</div>
                )}
                <div className="absolute top-2 right-2 bg-pink-600 text-xs px-2.5 py-1 rounded-none text-white font-bold uppercase tracking-wider shadow-sm">
                  {s.category}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-extrabold text-lg mb-1 text-slate-900">{s.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{s.description}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <Button onClick={() => handleEdit(s)} variant="outline" size="sm" className="flex-1 rounded-none border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-pink-600 hover:border-pink-200 font-bold uppercase tracking-wider text-[10px]">
                    <Edit2 className="w-3 h-3 mr-2" /> Edit
                  </Button>
                  <Button onClick={() => handleDelete(s.id)} variant="outline" size="sm" className="flex-1 rounded-none border-red-100 text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-bold uppercase tracking-wider text-[10px]">
                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {seriesList.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-none font-medium">
              No series found. Create one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
