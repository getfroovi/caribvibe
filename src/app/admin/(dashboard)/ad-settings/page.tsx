'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Save, AlertCircle } from 'lucide-react';

export default function AdSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: '',
    is_enabled: false,
    google_ad_client: '',
    feed_ad_slot: '',
    video_ad_slot: ''
  });

  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('ad_settings').select('*').limit(1).single();
      if (error) {
        if (error.code !== 'PGRST116') {
          toast.error('Failed to load ad settings.');
        }
      } else if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase.from('ad_settings').update({
          is_enabled: settings.is_enabled,
          google_ad_client: settings.google_ad_client,
          feed_ad_slot: settings.feed_ad_slot,
          video_ad_slot: settings.video_ad_slot
        }).eq('id', settings.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('ad_settings').insert([{
          is_enabled: settings.is_enabled,
          google_ad_client: settings.google_ad_client,
          feed_ad_slot: settings.feed_ad_slot,
          video_ad_slot: settings.video_ad_slot
        }]).select().single();
        
        if (error) throw error;
        if (data) setSettings(data);
      }
      
      toast.success('Ad settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Ad Monetization</h1>
          <p className="text-sm text-gray-500 mt-1 font-bold uppercase tracking-wider">Configure your Google AdSense integration to monetize free users.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800 rounded-none px-6 py-6 font-black uppercase tracking-widest transition-all border border-transparent">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-black rounded-none p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-black">
            <div>
              <h2 className="text-lg font-black text-black mb-1 uppercase tracking-tight">Enable Advertisements</h2>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Turn on to globally inject AdSense scripts and display ads across the site.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.is_enabled}
                onChange={(e) => setSettings({...settings, is_enabled: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-14 h-7 bg-white border border-black peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-black after:border after:rounded-none after:h-6 after:w-6 after:transition-all peer-checked:bg-white transition-colors"></div>
            </label>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Google AdSense Publisher ID</label>
              <input
                type="text"
                value={settings.google_ad_client || ''}
                onChange={e => setSettings({...settings, google_ad_client: e.target.value})}
                className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all font-mono"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">This is your main AdSense data-ad-client ID.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Feed Ad Slot ID</label>
                <input
                  type="text"
                  value={settings.feed_ad_slot || ''}
                  onChange={e => setSettings({...settings, feed_ad_slot: e.target.value})}
                  className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all font-mono"
                  placeholder="1234567890"
                />
                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">Slot ID for ads appearing between videos in the scrolling feed.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Video Mid-roll Ad Slot ID</label>
                <input
                  type="text"
                  value={settings.video_ad_slot || ''}
                  onChange={e => setSettings({...settings, video_ad_slot: e.target.value})}
                  className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all font-mono"
                  placeholder="0987654321"
                />
                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">Slot ID for overlay ads appearing during video playback.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-400 rounded-none p-6 flex gap-4 text-yellow-800 items-start shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-sm mb-1 uppercase tracking-tight">AdSense Review Process</h4>
            <p className="text-xs text-yellow-800/80 leading-relaxed font-bold uppercase tracking-wider">
              Ensure you have added this website's domain to your Google AdSense dashboard and that it has been approved. Ads will not display until Google verifies your domain and the publisher ID provided above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
