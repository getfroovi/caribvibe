'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { saveStoreSettingsAction } from '@/app/admin/settings-actions';

interface StoreSettings {
  id: string;
  is_enabled: boolean;
  store_url: string;
  is_etsy_enabled: boolean;
  etsy_url: string;
}

export default function StoreSettingsClient({ initialSettings }: { initialSettings: StoreSettings | null }) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: initialSettings?.id || '',
    is_enabled: initialSettings?.is_enabled || false,
    store_url: initialSettings?.store_url || '',
    is_etsy_enabled: initialSettings?.is_etsy_enabled || false,
    etsy_url: initialSettings?.etsy_url || ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveStoreSettingsAction({
        is_enabled: settings.is_enabled,
        store_url: settings.store_url,
        is_etsy_enabled: settings.is_etsy_enabled,
        etsy_url: settings.etsy_url
      });
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to save settings');
      }
      
      toast.success('Store settings saved successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(`Error saving: ${err.message || 'Failed to save settings'}`);
    } finally {
      setSaving(false);
    }
  };

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
