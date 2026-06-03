'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

export default function VIPSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const [settings, setSettings] = useState({
    id: '',
    modal_title: 'Unlock Full Video',
    modal_description: 'You\'ve reached the end of the free preview. Subscribe to watch the rest of this video and access our entire premium catalog.',
    benefits: ['Unlimited access to all premium videos', 'Ad-free viewing experience', 'Support your favorite creators'],
    page_title: 'Become a VIP Member',
    page_description: 'Get the ultimate theGriot.io experience. Gain unlimited access to premium exclusive content, ad-free viewing, and support local creators.',
    pricing_text: '$9.99/month',
    square_plan_id: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('vip_settings').select('*').limit(1).single();
      if (data && !error) {
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load VIP Settings. Displaying defaults.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('vip_settings')
          .update(settings)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('vip_settings')
          .insert(settings)
          .select()
          .single();
        if (error) throw error;
        if (data) setSettings(data);
      }
      toast.success('VIP Settings updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = () => {
    setSettings(s => ({ ...s, benefits: [...s.benefits, 'New Benefit'] }));
  };

  const updateBenefit = (index: number, val: string) => {
    const newBenefits = [...settings.benefits];
    newBenefits[index] = val;
    setSettings({ ...settings, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = settings.benefits.filter((_, i) => i !== index);
    setSettings({ ...settings, benefits: newBenefits });
  };

  if (loading) return <div className="p-8 text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-black">VIP Configuration</h1>
        <p className="text-sm text-gray-500 mt-1 font-bold uppercase tracking-wider">Manage the paywall modal and the dedicated VIP sign-up landing page.</p>
      </div>
      
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* VIP Modal Settings */}
        <div className="bg-white border border-black rounded-none p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg font-black mb-1 text-black flex items-center gap-2 uppercase tracking-tight">Video Player Modal</h2>
          <p className="text-sm text-gray-500 mb-6 font-bold uppercase tracking-wider">Appears when a user hits the paywall on a premium video.</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Modal Title</label>
              <input
                type="text"
                value={settings.modal_title}
                onChange={e => setSettings({...settings, modal_title: e.target.value})}
                className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Modal Description</label>
              <textarea
                value={settings.modal_description}
                onChange={e => setSettings({...settings, modal_description: e.target.value})}
                className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all h-24 resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* VIP Sign-Up Page Settings */}
        <div className="bg-white border border-black rounded-none p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg font-black mb-1 text-black flex items-center gap-2 uppercase tracking-tight">VIP Sign-Up Page</h2>
          <p className="text-sm text-gray-500 mb-6 font-bold uppercase tracking-wider">The dedicated /vip landing page.</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Page Title</label>
              <input
                type="text"
                value={settings.page_title}
                onChange={e => setSettings({...settings, page_title: e.target.value})}
                className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Page Description</label>
              <textarea
                value={settings.page_description}
                onChange={e => setSettings({...settings, page_description: e.target.value})}
                className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all h-24 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Pricing Text</label>
              <input
                type="text"
                value={settings.pricing_text}
                onChange={e => setSettings({...settings, pricing_text: e.target.value})}
                className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                placeholder="e.g. $9.99/mo"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Square Subscription Plan ID</label>
              <input
                type="text"
                value={settings.square_plan_id || ''}
                onChange={e => setSettings({...settings, square_plan_id: e.target.value})}
                className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all font-mono"
                placeholder="e.g. 5CXXXXXXXXXXXX"
                required
              />
              <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">You must create a Subscription Plan in your Square Dashboard and paste the ID here.</p>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-white border border-black rounded-none p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight">VIP Benefits</h2>
              <p className="text-sm text-gray-500 mt-1 font-bold uppercase tracking-wider">Displayed on both the Modal and the Sign-Up page.</p>
            </div>
            <Button type="button" variant="outline" onClick={addBenefit} className="bg-white text-black hover:bg-gray-100 border border-black rounded-none text-[10px] font-bold uppercase tracking-widest">
              <Plus className="w-4 h-4 mr-2" /> Add Benefit
            </Button>
          </div>
          
          <div className="space-y-3">
            {settings.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={benefit}
                  onChange={e => updateBenefit(index, e.target.value)}
                  className="flex-1 bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => removeBenefit(index)}
                  className="p-3 text-red-500 hover:text-white bg-white border border-red-500 rounded-none hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {settings.benefits.length === 0 && (
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">No benefits added. Add some to display to users.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-widest px-8 py-6 rounded-none transition-all border border-transparent"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
