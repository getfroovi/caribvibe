import { createClient } from '@/lib/supabase/server';
import { BookOpen } from 'lucide-react';

export const revalidate = 0;

export default async function MagazinePage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('magazine_settings').select('*').limit(1).single();

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

  const cleanIframeUrl = (val?: string) => {
    if (!val) return '';
    const match = val.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : val.trim();
  };
  const cleanEmbedUrl = cleanIframeUrl(settings.embed_url);

  // Dynamically inject absolute layout styles to guarantee the iframe renders at full scale
  const styledEmbedCode = settings.embed_code && settings.embed_code.includes('<iframe')
    ? settings.embed_code.replace(
        '<iframe',
        '<iframe style="width: 100%; height: 100%; border: none; min-height: 100%; position: absolute; top: 0; left: 0; right: 0; bottom: 0;"'
      )
    : settings.embed_code;

  return (
    <div className="w-full h-[calc(100dvh-128px)] md:h-[calc(100dvh-64px)] flex flex-col overflow-hidden bg-black relative">
      {settings.embed_code ? (
        <div 
          className="w-full h-full flex-1 relative"
          dangerouslySetInnerHTML={{ __html: styledEmbedCode }}
        />
      ) : (
        <iframe 
          src={cleanEmbedUrl} 
          className="absolute inset-0 w-full h-full border-none"
          title="Interactive Magazine Issue"
          allowFullScreen
        />
      )}
    </div>
  );
}
