'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Code, Link as LinkIcon } from 'lucide-react';
import { saveMagazineSettingsAction } from '@/app/admin/settings-actions';

interface MagazineSettings {
  id: string;
  is_enabled: boolean;
  embed_url: string;
  embed_code: string;
}

export default function MagazineSettingsClient({ initialSettings }: { initialSettings: MagazineSettings | null }) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: initialSettings?.id || '',
    is_enabled: initialSettings?.is_enabled || false,
    embed_url: initialSettings?.embed_url || '',
    embed_code: initialSettings?.embed_code || ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveMagazineSettingsAction({
        is_enabled: settings.is_enabled,
        embed_url: settings.embed_url,
        embed_code: settings.embed_code
      });
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to save settings');
      }
      
      toast.success('Magazine embed settings saved successfully!');
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Magazine Embed</h1>
          <p className="text-lg text-slate-500 mt-2">Embed interactive flip-books (Issuu, Heyzine, Flipsnack) on the public magazine route.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-pink-600 text-white hover:bg-pink-700 rounded-none px-6 py-6 font-bold uppercase tracking-wider transition-all shadow-sm">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-none p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight">Enable Interactive Magazine</h2>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Turn ON to display the flip-book on /magazine. If OFF, users see a "Next Issue Dropping Soon" message.</p>
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
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-pink-500" /> Option A: Direct Iframe URL
              </label>
              <input
                type="url"
                value={settings.embed_url || ''}
                onChange={e => setSettings({...settings, embed_url: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-none px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                placeholder="https://heyzine.com/flip-book/abc123456.html"
              />
              <p className="text-xs text-slate-500 mt-2 font-semibold uppercase tracking-wider">
                Paste just the direct URL if your provider gives you a simple sharing link.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-violet-500" /> Option B: Raw Embed HTML/Iframe Code (Overrides Option A)
              </label>
              <textarea
                value={settings.embed_code || ''}
                onChange={e => setSettings({...settings, embed_code: e.target.value})}
                className="w-full h-48 bg-[#1E1E1E] text-green-400 border border-slate-800 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono whitespace-pre placeholder:text-gray-600"
                placeholder={'<iframe src="https://heyzine.com/flip-book/..." width="100%" height="100%" frameborder="0" allowfullscreen></iframe>'}
                spellCheck="false"
              />
              <p className="text-xs text-slate-500 mt-2 font-semibold uppercase tracking-wider">
                If your provider gives you complete HTML embed code with custom dimensions or scripts, paste it here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
