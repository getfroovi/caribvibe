'use client';

import { useInView } from 'react-intersection-observer';
import { Play } from 'lucide-react';
import { AdUnit } from '@/components/video/AdUnit';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function FeedAdItem() {
  const { ref, inView } = useInView({ threshold: 0.5 });
  const [adSettings, setAdSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('ad_settings').select('*').limit(1).single();
      if (data) setAdSettings(data);
    };
    fetchSettings();
  }, []);

  return (
    <div 
      ref={ref}
      className="w-full h-[100dvh] snap-start relative flex-shrink-0 bg-black flex flex-col items-center justify-center border-y-4 border-pink-500/20"
    >
      {adSettings?.is_enabled && adSettings?.google_ad_client && adSettings?.feed_ad_slot ? (
        <div className="w-full max-w-[336px]">
          <p className="text-pink-500 font-bold tracking-widest uppercase text-[10px] mb-2 text-center">Advertisement</p>
          <AdUnit 
            client={adSettings.google_ad_client} 
            slot={adSettings.feed_ad_slot} 
            format="rectangle"
          />
        </div>
      ) : (
        <div className="text-center p-8 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md max-w-[80%] shadow-2xl">
          <p className="text-pink-500 font-bold tracking-widest uppercase text-xs mb-4">Advertisement Space</p>
          <h3 className="text-white text-2xl font-black mb-2">Google Ad Slot</h3>
          <p className="text-gray-400 text-sm mb-6">Ads are currently disabled or not fully configured in settings.</p>
          <div className="w-full h-48 bg-white/10 rounded animate-pulse" />
        </div>
      )}

      <div className="absolute bottom-20 text-center animate-bounce">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Swipe up to skip</p>
      </div>
    </div>
  );
}
