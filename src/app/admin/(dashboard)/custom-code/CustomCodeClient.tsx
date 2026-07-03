'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Code } from 'lucide-react';
import { saveCustomCodeAction } from '@/app/admin/settings-actions';

interface CustomCodeSettings {
  id: string;
  header_code: string;
  body_top_code: string;
  footer_code: string;
}

export default function CustomCodeClient({ initialSettings }: { initialSettings: CustomCodeSettings | null }) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: initialSettings?.id || '',
    header_code: initialSettings?.header_code || '',
    body_top_code: initialSettings?.body_top_code || '',
    footer_code: initialSettings?.footer_code || ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveCustomCodeAction({
        header_code: settings.header_code,
        body_top_code: settings.body_top_code,
        footer_code: settings.footer_code
      });
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to save custom code');
      }
      
      toast.success('Custom code saved successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(`Error saving: ${err.message || 'Failed to save custom code'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Custom Code</h1>
          <p className="text-lg text-slate-500 mt-2">Inject custom scripts, analytics, and CSS globally.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-pink-600 text-white hover:bg-pink-700 rounded-none px-6 py-6 font-bold uppercase tracking-wider transition-all shadow-sm">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Code'}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-none p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-pink-500" /> Header Code
              </label>
              <textarea
                value={settings.header_code || ''}
                onChange={e => setSettings({...settings, header_code: e.target.value})}
                className="w-full h-32 bg-[#1E1E1E] text-green-400 border border-slate-800 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono whitespace-pre placeholder:text-gray-600"
                placeholder={'<!-- Global site tag (gtag.js) - Google Analytics -->\n<script async src="https://..."></script>'}
                spellCheck="false"
              />
              <p className="text-xs text-slate-500 mt-2 font-semibold uppercase tracking-wider">
                Injected inside the head tag.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-violet-500" /> Body Top Code
              </label>
              <textarea
                value={settings.body_top_code || ''}
                onChange={e => setSettings({...settings, body_top_code: e.target.value})}
                className="w-full h-32 bg-[#1E1E1E] text-green-400 border border-slate-800 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono whitespace-pre placeholder:text-gray-600"
                placeholder={'<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://..." ...></iframe></noscript>'}
                spellCheck="false"
              />
              <p className="text-xs text-slate-500 mt-2 font-semibold uppercase tracking-wider">
                Injected at the very top of the body tag.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-violet-500" /> Footer Code
              </label>
              <textarea
                value={settings.footer_code || ''}
                onChange={e => setSettings({...settings, footer_code: e.target.value})}
                className="w-full h-32 bg-[#1E1E1E] text-green-400 border border-slate-800 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono whitespace-pre placeholder:text-gray-600"
                placeholder={'<script>\n  console.log("Footer script loaded");\n</script>'}
                spellCheck="false"
              />
              <p className="text-xs text-slate-500 mt-2 font-semibold uppercase tracking-wider">
                Injected at the very bottom of the body tag.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
