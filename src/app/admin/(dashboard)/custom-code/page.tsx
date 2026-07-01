'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Save, Code, AlertTriangle } from 'lucide-react';
import { saveCustomCodeAction } from '@/app/admin/settings-actions';

export default function CustomCodePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    id: '',
    header_code: '',
    body_top_code: '',
    footer_code: ''
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const timer = setTimeout(() => setLoading(false), 4000);
    try {
      const { data, error } = await supabase.from('custom_code').select('*').limit(1).single();
      if (error) {
        if (error.code !== 'PGRST116') {
          setDbError(error.message);
          toast.error(`Database Error: ${error.message}`);
        }
      } else if (data) {
        setSettings({
          id: data.id,
          header_code: data.header_code || '',
          body_top_code: data.body_top_code || '',
          footer_code: data.footer_code || ''
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
      const res = await saveCustomCodeAction({
        header_code: settings.header_code,
        body_top_code: settings.body_top_code,
        footer_code: settings.footer_code
      });
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to save custom code');
      }
      
      toast.success('Custom code saved successfully!');
      setDbError(null);
      await fetchSettings();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Failed to save custom code';
      setDbError(msg);
      toast.error(`Error saving: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400 font-bold uppercase tracking-widest text-sm">Loading settings...</div>;

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
        
        <div className="bg-red-50 border border-red-200 rounded-none p-6 flex gap-4 text-red-800 items-start shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <h4 className="font-bold text-sm mb-1 uppercase tracking-tight text-red-900">Security Warning</h4>
            <p className="text-xs text-red-800/80 leading-relaxed font-semibold uppercase tracking-wider">
              Only paste code from trusted sources. Malicious scripts entered here can compromise your site and steal user data. Ensure all tags (like &lt;script&gt; or &lt;style&gt;) are properly closed.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-none p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight flex items-center gap-2">
              <Code className="w-5 h-5 text-pink-500" /> Header Code
            </h2>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Injected directly into the &lt;head&gt; tag. Use this for Google Analytics, Meta Pixels, or custom &lt;style&gt; blocks.
            </p>
          </div>
          <textarea
            value={settings.header_code || ''}
            onChange={e => setSettings({...settings, header_code: e.target.value})}
            className="w-full h-64 bg-[#1E1E1E] text-green-400 border border-slate-800 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono whitespace-pre placeholder:text-gray-600"
            placeholder="<!-- Paste <script>, <style>, or <meta> tags here -->"
            spellCheck="false"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-none p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight flex items-center gap-2">
              <Code className="w-5 h-5 text-pink-500" /> Body Top Code
            </h2>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Injected immediately after the opening &lt;body&gt; tag. Use this for Google Tag Manager &lt;noscript&gt; blocks.
            </p>
          </div>
          <textarea
            value={settings.body_top_code || ''}
            onChange={e => setSettings({...settings, body_top_code: e.target.value})}
            className="w-full h-64 bg-[#1E1E1E] text-green-400 border border-slate-800 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono whitespace-pre placeholder:text-gray-600"
            placeholder="<!-- Paste <noscript> tags here -->"
            spellCheck="false"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-none p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight flex items-center gap-2">
              <Code className="w-5 h-5 text-pink-500" /> Footer Code
            </h2>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Injected just before the closing &lt;/body&gt; tag. Use this for live chat widgets, tracking scripts, or non-critical JS.
            </p>
          </div>
          <textarea
            value={settings.footer_code || ''}
            onChange={e => setSettings({...settings, footer_code: e.target.value})}
            className="w-full h-64 bg-[#1E1E1E] text-green-400 border border-slate-800 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono whitespace-pre placeholder:text-gray-600"
            placeholder="<!-- Paste <script> tags here -->"
            spellCheck="false"
          />
        </div>

      </div>
    </div>
  );
}
