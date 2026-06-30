'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Save, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    id: '',
    is_enabled: false,
    store_url: '',
    is_etsy_enabled: false,
    etsy_url: ''
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Safety timer to prevent infinite loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    try {
      const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
      if (error) {
        if (error.code !== 'PGRST116') {
          setDbError(error.message);
          toast.error(`Database Error: ${error.message}. Please run the SQL script in Supabase!`);
        }
      } else if (data) {
        setSettings({
          id: data.id,
          is_enabled: data.is_enabled || false,
          store_url: data.store_url || '',
          is_etsy_enabled: data.is_etsy_enabled || false,
          etsy_url: data.etsy_url || ''
        });
      }
    } catch (err: any) {
      console.error(err);
      setDbError(err.message || 'Unknown network error');
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase.from('store_settings').update({
          is_enabled: settings.is_enabled,
          store_url: settings.store_url,
          is_etsy_enabled: settings.is_etsy_enabled,
          etsy_url: settings.etsy_url
        }).eq('id', settings.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('store_settings').insert([{
          is_enabled: settings.is_enabled,
          store_url: settings.store_url,
          is_etsy_enabled: settings.is_etsy_enabled,
          etsy_url: settings.etsy_url
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

      {dbError && (
        <div className="bg-red-50 border border-red-200 p-6 mb-6 flex gap-4 text-red-800 items-start shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <h4 className="font-bold text-sm mb-1 uppercase tracking-tight text-red-900">Missing Database Table</h4>
            <p className="text-xs text-red-800/80 leading-relaxed font-semibold uppercase tracking-wider mb-2">
              Error: {dbError}
            </p>
            <p className="text-xs text-red-900 font-bold">
              Please copy and run the SQL migration script from our walkthrough in your Supabase SQL Editor so this table exists!
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-none p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight">Main Storefront</h2>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Configure your primary embedded store (e.g. Shopify, Custom Website).</p>
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
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-none p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight">Etsy Storefront</h2>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Configure a secondary Etsy store. A tabbed UI will automatically appear if both are enabled.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.is_etsy_enabled}
                onChange={(e) => setSettings({...settings, is_etsy_enabled: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#F1641E] transition-colors"></div>
            </label>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Etsy Store URL</label>
              <input
                type="url"
                value={settings.etsy_url || ''}
                onChange={e => setSettings({...settings, etsy_url: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#F1641E] focus:border-[#F1641E] transition-all font-mono"
                placeholder="https://www.etsy.com/shop/YourShopName"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
