'use client';

import { useState, useEffect } from 'react';
import MuxUploader from '@mux/mux-uploader-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, Edit2, Play } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';

export default function AdminVideosPage() {
  const [sourceType, setSourceType] = useState<'mux' | 'external'>('external');
  const [endpoint, setEndpoint] = useState<string | null>(null);
  
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [videosList, setVideosList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewDuration, setPreviewDuration] = useState(30);
  const [isPremium, setIsPremium] = useState(true);
  const [seriesId, setSeriesId] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState('youtube');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  const loadData = async () => {
    try {
      const [seriesRes, videosRes] = await Promise.all([
        fetch('/api/series'),
        fetch('/api/videos')
      ]);
      const seriesData = await seriesRes.json();
      const videosData = await videosRes.json();
      
      if (!seriesData.error) {
        setSeriesList(seriesData);
        if(seriesData.length > 0 && !seriesId && !editingId) setSeriesId(seriesData[0].id);
      }
      if (!videosData.error) {
        setVideosList(videosData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatVideoUrl = (url: string) => {
    if (url.includes('youtube.com/shorts/')) {
      const videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url;
  };

  const handleSaveExternal = async () => {
    try {
      const formattedUrl = formatVideoUrl(videoUrl);
      const url = editingId ? `/api/videos?id=${editingId}` : '/api/videos';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, preview_duration_seconds: previewDuration,
          is_premium: isPremium, series_id: seriesId, episode_number: episodeNumber,
          video_url: formattedUrl, video_type: videoType, 
          thumbnail_url: thumbnailUrl, poster_url: posterUrl
        })
      });
      if (res.ok) {
        toast.success(editingId ? 'Episode updated!' : 'Episode saved successfully!');
        setVideoUrl(''); setTitle(''); setDescription(''); setThumbnailUrl(''); setPosterUrl(''); 
        setEditingId(null);
        if (!editingId) setEpisodeNumber(prev => prev + 1);
        loadData();
      } else {
        toast.error('Failed to save episode');
      }
    } catch (error) {
      toast.error('Error saving episode');
    }
  };

  const handleEdit = (v: any) => {
    setEditingId(v.id);
    setTitle(v.title);
    setDescription(v.description || '');
    setPreviewDuration(v.preview_duration_seconds || 30);
    setIsPremium(v.is_premium);
    setSeriesId(v.series_id || '');
    setEpisodeNumber(v.episode_number || 1);
    setVideoUrl(v.video_url || '');
    setVideoType(v.video_type || 'youtube');
    setThumbnailUrl(v.thumbnail_url || '');
    setPosterUrl(v.poster_url || '');
    setSourceType(v.video_type === 'mux' ? 'mux' : 'external');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) return;
    try {
      const res = await fetch(`/api/videos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Episode deleted');
        loadData();
      } else {
        toast.error('Failed to delete episode');
      }
    } catch (error) {
      toast.error('Error deleting episode');
    }
  };

  const getUploadUrl = async () => {
    try {
      const res = await fetch('/api/mux/upload', { method: 'POST' });
      const data = await res.json();
      if (data.url) setEndpoint(data.url);
    } catch (error) {
      toast.error('Failed to get Mux upload URL');
    }
  };

  // Group videos by series
  const videosBySeries = seriesList.map(s => ({
    ...s,
    episodes: videosList.filter(v => v.series_id === s.id).sort((a, b) => a.episode_number - b.episode_number)
  })).filter(s => s.episodes.length > 0);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h2 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight">Episodes Manager</h2>
      <p className="text-slate-500 mb-8 text-lg">Upload episodes and attach them to a Series.</p>
      
      <div className="flex gap-4 mb-6">
        <Button 
          variant={sourceType === 'external' ? 'default' : 'outline'} 
          onClick={() => setSourceType('external')}
          className={`rounded-none font-bold uppercase tracking-wider ${sourceType === 'external' ? 'bg-pink-600 text-white hover:bg-pink-700 border-pink-600' : 'bg-transparent text-slate-700 hover:bg-slate-50 border-slate-300'}`}
        >
          External Link (YouTube/Vimeo)
        </Button>
        <Button 
          variant={sourceType === 'mux' ? 'default' : 'outline'} 
          onClick={() => setSourceType('mux')}
          className={`rounded-none font-bold uppercase tracking-wider ${sourceType === 'mux' ? 'bg-violet-600 text-white hover:bg-violet-700 border-violet-600' : 'bg-transparent text-slate-700 hover:bg-slate-50 border-slate-300'}`}
        >
          Upload to Mux
        </Button>
      </div>
      
      {/* FORM */}
      <div className="bg-white border border-slate-200 p-8 rounded-none space-y-6 mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-violet-500" />
        <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{editingId ? 'Edit Episode' : 'Add New Episode'}</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Episode Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Pilot" className="bg-slate-50 border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Series</Label>
              <select 
                value={seriesId} 
                onChange={(e) => setSeriesId(e.target.value)}
                className="flex h-10 w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500"
              >
                {seriesList.length === 0 && <option value="">No Series Found</option>}
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Episode Number</Label>
              <Input type="number" value={episodeNumber} onChange={(e) => setEpisodeNumber(Number(e.target.value))} className="bg-slate-50 border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview Duration (seconds)</Label>
              <Input type="number" value={previewDuration} onChange={(e) => setPreviewDuration(Number(e.target.value))} className="bg-slate-50 border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="w-4 h-4 text-pink-600 border-slate-300 focus:ring-pink-500 rounded-none accent-pink-600" />
              <Label className="text-sm font-semibold text-slate-900 uppercase tracking-wider mt-1">Require Premium</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
            <ImageUploader 
              label="Episode Poster (9:16)" 
              aspectRatio="9:16" 
              currentUrl={posterUrl} 
              onUpload={setPosterUrl} 
            />
            <ImageUploader 
              label="Episode Thumbnail (16:9)" 
              aspectRatio="16:9" 
              currentUrl={thumbnailUrl} 
              onUpload={setThumbnailUrl} 
            />
          </div>

          {sourceType === 'external' && (
            <>
              <div className="grid gap-2 border-t border-slate-200 pt-6 mt-4">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform</Label>
                <select value={videoType} onChange={(e) => setVideoType(e.target.value)} className="flex h-10 w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500">
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Video URL</Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="bg-slate-50 border-slate-200 text-slate-900 rounded-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500" />
                <p className="text-xs text-slate-500">YouTube Shorts links will automatically be converted to standard embed links.</p>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={handleSaveExternal} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-none font-bold uppercase tracking-wider" disabled={!seriesId}>
                  {editingId ? 'Save Changes' : 'Save Episode'}
                </Button>
                {editingId && (
                  <Button onClick={() => { setEditingId(null); setTitle(''); setVideoUrl(''); setThumbnailUrl(''); setPosterUrl(''); }} variant="outline" className="flex-1 rounded-none border-slate-300 text-slate-700 hover:bg-slate-100 font-bold uppercase tracking-wider">
                    Cancel Edit
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {sourceType === 'mux' && (
          <div className="pt-6 border-t border-slate-200 mt-4">
            <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wider">Mux uploads will be automatically tagged as 'mux' type.</p>
            {!endpoint ? (
              <Button onClick={getUploadUrl} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-none font-bold uppercase tracking-wider">Prepare Upload</Button>
            ) : (
              <div className="border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center bg-slate-50 rounded-none">
                <MuxUploader
                  endpoint={endpoint}
                  onSuccess={() => toast.success('Mux upload complete! (Webhook processing)')}
                  className="w-full max-w-md [--button-background-color:theme(colors.violet.600)] [--button-border-radius:0]"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIST */}
      <div>
        <h3 className="text-2xl font-extrabold mb-6 text-slate-900 tracking-tight">Uploaded Episodes</h3>
        {videosBySeries.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-none font-medium">
            No episodes uploaded yet.
          </div>
        )}
        <div className="space-y-8">
          {videosBySeries.map(series => (
            <div key={series.id} className="bg-white border border-slate-200 rounded-none p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-4">
                {series.thumbnail_url && (
                  <img src={series.thumbnail_url} alt="thumbnail" className="w-12 h-16 object-cover rounded-none border border-slate-200 shadow-sm" />
                )}
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">{series.title}</h4>
                  <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">{series.episodes.length} Episodes • {series.category}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {series.episodes.map((ep: any) => (
                  <div key={ep.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-none hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-none border border-slate-200 bg-white flex items-center justify-center text-sm font-extrabold text-pink-600">
                        {ep.episode_number}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                          {ep.title} 
                          {ep.is_premium && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-none font-bold uppercase tracking-widest shadow-sm">Premium</span>}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2 mt-1">
                          <Play className="w-3 h-3 text-slate-400" /> {ep.video_type} • Prev: {ep.preview_duration_seconds}s
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleEdit(ep)} variant="outline" size="sm" className="h-8 rounded-none border-slate-300 hover:bg-slate-200 text-slate-700">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(ep.id)} variant="outline" size="sm" className="h-8 rounded-none border-red-200 hover:bg-red-50 text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
