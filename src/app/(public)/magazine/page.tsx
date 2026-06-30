'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function MagazinePage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<{ is_enabled: boolean, embed_url: string, embed_code: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase.from('magazine_settings').select('*').limit(1).single();
        if (data && !error) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching magazine settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 pt-12 md:pt-24 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If magazine is disabled or neither embed option is provided
  if (!settings?.is_enabled || (!settings?.embed_url && !settings?.embed_code)) {
    return (
      <div className="max-w-7xl mx-auto p-8 pt-12 md:pt-24 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <BookOpen className="w-16 h-16 text-slate-800 mb-6 opacity-50" />
        <h1 className="text-4xl md:text-5xl font-black mb-4">Interactive <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Magazine</span></h1>
        <p className="text-xl text-gray-400 font-bold uppercase tracking-widest max-w-lg">
          Our next issue is dropping soon. Stay tuned!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col overflow-hidden bg-black">
      {settings.embed_code ? (
        <div 
          className="w-full h-full flex-1 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none"
          dangerouslySetInnerHTML={{ __html: settings.embed_code }}
        />
      ) : (
        <iframe 
          src={settings.embed_url} 
          className="w-full h-full border-none flex-1"
          title="Interactive Magazine Issue"
          allowFullScreen
        />
      )}
    </div>
  );
}
