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
      <h2 className="text-3xl font-black mb-6 text-black tracking-tight">Episodes Manager</h2>
      <p className="text-gray-500 mb-8">Upload episodes and attach them to a Series.</p>
      
      <div className="flex gap-4 mb-6">
        <Button 
          variant={sourceType === 'external' ? 'default' : 'outline'} 
          onClick={() => setSourceType('external')}
          className={`rounded-none border-black font-bold uppercase tracking-wider ${sourceType === 'external' ? 'bg-black text-white hover:bg-gray-800' : 'bg-transparent text-black hover:bg-gray-100'}`}
        >
          External Link (YouTube/Vimeo)
        </Button>
        <Button 
          variant={sourceType === 'mux' ? 'default' : 'outline'} 
          onClick={() => setSourceType('mux')}
          className={`rounded-none border-black font-bold uppercase tracking-wider ${sourceType === 'mux' ? 'bg-black text-white hover:bg-gray-800' : 'bg-transparent text-black hover:bg-gray-100'}`}
        >
          Upload to Mux
        </Button>
      </div>
      
      {/* FORM */}
      <div className="bg-white border border-black p-6 rounded-none space-y-6 mb-12">
        <h3 className="text-xl font-bold text-black uppercase tracking-tight">{editingId ? 'Edit Episode' : 'Add New Episode'}</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Episode Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Pilot" className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Series</Label>
              <select 
                value={seriesId} 
                onChange={(e) => setSeriesId(e.target.value)}
                className="flex h-10 w-full border border-black bg-white px-3 py-2 text-sm text-black rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
              >
                {seriesList.length === 0 && <option value="">No Series Found</option>}
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Episode Number</Label>
              <Input type="number" value={episodeNumber} onChange={(e) => setEpisodeNumber(Number(e.target.value))} className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Preview Duration (seconds)</Label>
              <Input type="number" value={previewDuration} onChange={(e) => setPreviewDuration(Number(e.target.value))} className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="w-4 h-4 text-black border-black focus:ring-black rounded-none accent-black" />
              <Label className="text-sm font-bold text-gray-900 uppercase tracking-wider mt-1">Require Premium</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
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
              <div className="grid gap-2 border-t border-gray-200 pt-6 mt-4">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Platform</Label>
                <select value={videoType} onChange={(e) => setVideoType(e.target.value)} className="flex h-10 w-full border border-black bg-white px-3 py-2 text-sm text-black rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black">
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Video URL</Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="bg-white border-black text-black rounded-none focus-visible:ring-1 focus-visible:ring-black" />
                <p className="text-xs text-gray-500">YouTube Shorts links will automatically be converted to standard embed links.</p>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={handleSaveExternal} className="flex-1 bg-black hover:bg-gray-800 text-white rounded-none font-bold uppercase tracking-widest" disabled={!seriesId}>
                  {editingId ? 'Save Changes' : 'Save Episode'}
                </Button>
                {editingId && (
                  <Button onClick={() => { setEditingId(null); setTitle(''); setVideoUrl(''); setThumbnailUrl(''); setPosterUrl(''); }} variant="outline" className="flex-1 rounded-none border-black text-black hover:bg-gray-100 font-bold uppercase tracking-widest">
                    Cancel Edit
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {sourceType === 'mux' && (
          <div className="pt-6 border-t border-gray-200 mt-4">
            <p className="text-sm text-gray-500 mb-4 font-bold uppercase tracking-wider">Mux uploads will be automatically tagged as 'mux' type.</p>
            {!endpoint ? (
              <Button onClick={getUploadUrl} className="w-full bg-black hover:bg-gray-800 text-white rounded-none font-bold uppercase tracking-widest">Prepare Upload</Button>
            ) : (
              <div className="border border-dashed border-black p-8 flex flex-col items-center justify-center bg-gray-50 rounded-none">
                <MuxUploader
                  endpoint={endpoint}
                  onSuccess={() => toast.success('Mux upload complete! (Webhook processing)')}
                  className="w-full max-w-md [--button-background-color:theme(colors.black)] [--button-border-radius:0]"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIST */}
      <div>
        <h3 className="text-2xl font-black mb-6 text-black tracking-tight">Uploaded Episodes</h3>
        {videosBySeries.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-none font-medium">
            No episodes uploaded yet.
          </div>
        )}
        <div className="space-y-8">
          {videosBySeries.map(series => (
            <div key={series.id} className="bg-white border border-black rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                {series.thumbnail_url && (
                  <img src={series.thumbnail_url} alt="thumbnail" className="w-12 h-16 object-cover rounded-none border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                )}
                <div>
                  <h4 className="text-xl font-black text-black uppercase tracking-tight">{series.title}</h4>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1">{series.episodes.length} Episodes • {series.category}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {series.episodes.map((ep: any) => (
                  <div key={ep.id} className="flex items-center justify-between p-4 bg-gray-50 border border-black rounded-none hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-none border border-black bg-white flex items-center justify-center text-sm font-black text-black">
                        {ep.episode_number}
                      </div>
                      <div>
                        <p className="font-bold text-black flex items-center gap-2 uppercase tracking-wide">
                          {ep.title} 
                          {ep.is_premium && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-none font-bold uppercase tracking-widest">Premium</span>}
                        </p>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2 mt-1">
                          <Play className="w-3 h-3 text-black" /> {ep.video_type} • Prev: {ep.preview_duration_seconds}s
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleEdit(ep)} variant="outline" size="sm" className="h-8 rounded-none border-black hover:bg-gray-200 text-black">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(ep.id)} variant="outline" size="sm" className="h-8 rounded-none border-red-500 hover:bg-red-50 text-red-500 hover:text-red-600">
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
