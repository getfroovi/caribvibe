'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Save, ShoppingBag } from 'lucide-react';

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: '',
    is_enabled: false,
    store_url: ''
  });

  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
      if (error) {
        if (error.code !== 'PGRST116') {
          toast.error('Failed to load store settings. Have you pushed the DB migrations?');
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
        const { error } = await supabase.from('store_settings').update({
          is_enabled: settings.is_enabled,
          store_url: settings.store_url
        }).eq('id', settings.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('store_settings').insert([{
          is_enabled: settings.is_enabled,
          store_url: settings.store_url
        }]).select().single();
        
        if (error) throw error;
        if (data) setSettings(data);
      }
      
      toast.success('Store settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400 font-bold uppercase tracking-widest text-sm">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Store Settings</h1>
          <p className="text-lg text-slate-500 mt-2">Embed your external storefront directly into the platform.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-pink-600 text-white hover:bg-pink-700 rounded-none px-6 py-6 font-bold uppercase tracking-wider transition-all shadow-sm">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-none p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight">Enable Embedded Store</h2>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Turn on to display the iframe storefront to users instead of the "Coming Soon" message.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.is_enabled}
                onChange={(e) => setSettings({...settings, is_enabled: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pink-500 transition-colors"></div>
            </label>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Embedded Store URL</label>
              <input
                type="url"
                value={settings.store_url || ''}
                onChange={e => setSettings({...settings, store_url: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                placeholder="https://your-shopify-store.com"
              />
              <p className="text-xs text-slate-500 mt-2 font-semibold uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-3 h-3" /> Note: Make sure the URL allows iframe embedding (some platforms restrict this via X-Frame-Options).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
