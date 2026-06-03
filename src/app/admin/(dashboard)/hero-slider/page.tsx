'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  series_id: string | null;
  link_url: string | null;
  button_text: string;
  order_index: number;
  is_trailer?: boolean;
  trailer_url?: string | null;
}

export default function HeroSliderSettingsPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slidesRes, seriesRes] = await Promise.all([
        supabase.from('hero_slides').select('*').order('order_index', { ascending: true }),
        supabase.from('series').select('id, title').order('created_at', { ascending: false })
      ]);

      if (slidesRes.data) setSlides(slidesRes.data);
      if (seriesRes.data) setSeriesList(seriesRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert all slides
      const { error } = await supabase.from('hero_slides').upsert(slides);
      if (error) throw error;
      toast.success('Hero slides saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save slides');
    } finally {
      setSaving(false);
    }
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      title: 'New Slide',
      description: '',
      image_url: '',
      series_id: null,
      link_url: '',
      button_text: 'Play',
      order_index: slides.length,
      is_trailer: false,
      trailer_url: ''
    };
    setSlides([...slides, newSlide]);
  };

  const removeSlide = async (index: number) => {
    const slideToDelete = slides[index];
    if (slideToDelete.id && !slideToDelete.id.includes('-')) {
      // If it's a real UUID from DB, delete it from DB immediately
      const { error } = await supabase.from('hero_slides').delete().eq('id', slideToDelete.id);
      if (error) {
        toast.error('Failed to delete slide');
        return;
      }
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides.map((s, i) => ({ ...s, order_index: i }))); // re-index
  };

  const updateSlide = (index: number, field: keyof Slide, value: any) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  if (loading) return <div className="p-8 text-gray-400">Loading slides...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Hero Slider Management</h1>
          <p className="text-sm text-gray-500 mt-1 font-bold uppercase tracking-wider">Configure the rotating banners on the homepage.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={addSlide} className="bg-white hover:bg-gray-100 text-black border border-black rounded-none px-4 py-6 font-bold uppercase tracking-widest transition-all">
            <Plus className="w-4 h-4 mr-2" /> Add Slide
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800 rounded-none px-6 py-6 font-black uppercase tracking-widest transition-all border border-transparent">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {slides.length === 0 && (
          <div className="text-center p-16 border border-dashed border-gray-300 rounded-none text-gray-500 bg-gray-50 font-bold uppercase tracking-wider">
            No slides configured. Add a slide to feature content on the homepage!
          </div>
        )}

        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white border border-black rounded-none p-8 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
            <div className="absolute top-6 right-6 flex items-center gap-3">
              <div className="px-3 py-1 bg-gray-100 rounded-none border border-black">
                <span className="text-[10px] text-black uppercase tracking-widest font-black">Order: {slide.order_index}</span>
              </div>
              <button onClick={() => removeSlide(index)} className="p-2 text-red-500 hover:text-white bg-white border border-red-500 rounded-none hover:bg-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Title</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={e => updateSlide(index, 'title', e.target.value)}
                    className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Description</label>
                  <textarea
                    value={slide.description || ''}
                    onChange={e => updateSlide(index, 'description', e.target.value)}
                    className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Button Text</label>
                  <input
                    type="text"
                    value={slide.button_text}
                    onChange={e => updateSlide(index, 'button_text', e.target.value)}
                    className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Image / Poster URL</label>
                  <input
                    type="url"
                    value={slide.image_url}
                    onChange={e => updateSlide(index, 'image_url', e.target.value)}
                    className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    placeholder="https://..."
                    required
                  />
                </div>
                
                <div className="p-6 bg-gray-50 rounded-none border border-black space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-black uppercase tracking-tight">Link Routing</h3>
                    <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">Select a Series OR provide a custom Webpage URL. If both are set, Series is prioritized.</p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Link to Series</label>
                    <select
                      value={slide.series_id || ''}
                      onChange={e => updateSlide(index, 'series_id', e.target.value || null)}
                      className="w-full bg-white border border-black rounded-none px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all appearance-none"
                    >
                      <option value="">-- No Series (Use Webpage URL) --</option>
                      {seriesList.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  {!slide.series_id && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Custom Webpage URL</label>
                      <input
                        type="text"
                        value={slide.link_url || ''}
                        onChange={e => updateSlide(index, 'link_url', e.target.value)}
                        className="w-full bg-white border border-black rounded-none px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                        placeholder="/magazine or https://google.com"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-black">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={!!slide.is_trailer}
                          onChange={(e) => updateSlide(index, 'is_trailer', e.target.checked)}
                          className="sr-only" 
                        />
                        <div className={`block w-10 h-6 rounded-none border border-black transition-colors ${slide.is_trailer ? 'bg-black' : 'bg-white'}`}></div>
                        <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-none border border-black transition-transform ${slide.is_trailer ? 'transform translate-x-4 bg-white' : 'bg-black'}`}></div>
                      </div>
                      <span className="text-sm font-black text-gray-500 group-hover:text-black uppercase tracking-wider transition-colors">Is this a Trailer?</span>
                    </label>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">If checked, the button will play a trailer video in a popup modal.</p>
                  </div>

                  {slide.is_trailer && (
                    <div className="mt-4">
                      <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Trailer Video URL</label>
                      <input
                        type="text"
                        value={slide.trailer_url || ''}
                        onChange={e => updateSlide(index, 'trailer_url', e.target.value)}
                        className="w-full bg-white border border-black rounded-none px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                        placeholder="YouTube link or .mp4 URL"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {slide.image_url && (
              <div className="mt-8 aspect-[21/9] md:aspect-[4/1] rounded-none overflow-hidden relative border border-black group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <img src={slide.image_url} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <span className="text-black text-sm font-black tracking-widest uppercase">Image Preview</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
