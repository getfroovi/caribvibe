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
      order_index: slides.length
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Hero Slider Management</h1>
          <p className="text-sm text-zinc-400 mt-1">Configure the rotating banners on the homepage.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={addSlide} className="bg-white/10 hover:bg-white/20 text-white border-0 rounded-xl px-4 py-6 font-medium transition-all">
            <Plus className="w-4 h-4 mr-2" /> Add Slide
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-zinc-200 rounded-xl px-6 py-6 font-semibold transition-all">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {slides.length === 0 && (
          <div className="text-center p-16 border border-dashed border-white/10 rounded-2xl text-zinc-500 bg-zinc-900/20">
            No slides configured. Add a slide to feature content on the homepage!
          </div>
        )}

        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 relative group transition-colors hover:border-white/10">
            <div className="absolute top-6 right-6 flex items-center gap-3">
              <div className="px-3 py-1 bg-black/50 rounded-full border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Order: {slide.order_index}</span>
              </div>
              <button onClick={() => removeSlide(index)} className="p-2 text-zinc-500 hover:text-red-400 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={e => updateSlide(index, 'title', e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    value={slide.description || ''}
                    onChange={e => updateSlide(index, 'description', e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Button Text</label>
                  <input
                    type="text"
                    value={slide.button_text}
                    onChange={e => updateSlide(index, 'button_text', e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Image / Poster URL</label>
                  <input
                    type="url"
                    value={slide.image_url}
                    onChange={e => updateSlide(index, 'image_url', e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                    placeholder="https://..."
                    required
                  />
                </div>
                
                <div className="p-6 bg-zinc-950/50 rounded-xl border border-white/5 space-y-5">
                  <div>
                    <h3 className="text-sm font-medium text-white">Link Routing</h3>
                    <p className="text-xs text-zinc-500 mt-1">Select a Series OR provide a custom Webpage URL. If both are set, Series is prioritized.</p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Link to Series</label>
                    <select
                      value={slide.series_id || ''}
                      onChange={e => updateSlide(index, 'series_id', e.target.value || null)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 transition-all appearance-none"
                    >
                      <option value="">-- No Series (Use Webpage URL) --</option>
                      {seriesList.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  {!slide.series_id && (
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Custom Webpage URL</label>
                      <input
                        type="text"
                        value={slide.link_url || ''}
                        onChange={e => updateSlide(index, 'link_url', e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                        placeholder="/magazine or https://google.com"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {slide.image_url && (
              <div className="mt-8 aspect-[21/9] md:aspect-[4/1] rounded-xl overflow-hidden relative border border-white/5 group-hover:border-white/10 transition-colors">
                <img src={slide.image_url} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <span className="text-white text-sm font-medium tracking-wide">Image Preview</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
