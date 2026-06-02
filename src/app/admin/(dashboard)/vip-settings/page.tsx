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
        <h1 className="text-2xl font-semibold tracking-tight text-white">VIP Configuration</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage the paywall modal and the dedicated VIP sign-up landing page.</p>
      </div>
      
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* VIP Modal Settings */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 transition-colors hover:border-white/10">
          <h2 className="text-lg font-medium mb-1 text-white flex items-center gap-2">Video Player Modal</h2>
          <p className="text-sm text-zinc-500 mb-6">Appears when a user hits the paywall on a premium video.</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Modal Title</label>
              <input
                type="text"
                value={settings.modal_title}
                onChange={e => setSettings({...settings, modal_title: e.target.value})}
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Modal Description</label>
              <textarea
                value={settings.modal_description}
                onChange={e => setSettings({...settings, modal_description: e.target.value})}
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all h-24 resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* VIP Sign-Up Page Settings */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 transition-colors hover:border-white/10">
          <h2 className="text-lg font-medium mb-1 text-white flex items-center gap-2">VIP Sign-Up Page</h2>
          <p className="text-sm text-zinc-500 mb-6">The dedicated /vip landing page.</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Page Title</label>
              <input
                type="text"
                value={settings.page_title}
                onChange={e => setSettings({...settings, page_title: e.target.value})}
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Page Description</label>
              <textarea
                value={settings.page_description}
                onChange={e => setSettings({...settings, page_description: e.target.value})}
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all h-24 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Pricing Text</label>
              <input
                type="text"
                value={settings.pricing_text}
                onChange={e => setSettings({...settings, pricing_text: e.target.value})}
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                placeholder="e.g. $9.99/mo"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Square Subscription Plan ID</label>
              <input
                type="text"
                value={settings.square_plan_id || ''}
                onChange={e => setSettings({...settings, square_plan_id: e.target.value})}
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-mono"
                placeholder="e.g. 5CXXXXXXXXXXXX"
                required
              />
              <p className="text-xs text-zinc-500 mt-2">You must create a Subscription Plan in your Square Dashboard and paste the ID here.</p>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 transition-colors hover:border-white/10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium text-white">VIP Benefits</h2>
              <p className="text-sm text-zinc-500 mt-1">Displayed on both the Modal and the Sign-Up page.</p>
            </div>
            <Button type="button" variant="outline" onClick={addBenefit} className="bg-white text-black hover:bg-zinc-200 border-0 rounded-lg text-sm font-medium">
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
                  className="flex-1 bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => removeBenefit(index)}
                  className="p-3 text-zinc-500 hover:text-red-400 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {settings.benefits.length === 0 && (
              <p className="text-zinc-600 text-sm italic">No benefits added. Add some to display to users.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-white text-black hover:bg-zinc-200 font-semibold px-8 py-6 rounded-xl transition-all"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
