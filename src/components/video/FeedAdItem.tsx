'use client';

import { useInView } from 'react-intersection-observer';
import { Play } from 'lucide-react';

export function FeedAdItem() {
  const { ref, inView } = useInView({ threshold: 0.5 });

  return (
    <div 
      ref={ref}
      className="w-full h-[100dvh] snap-start relative flex-shrink-0 bg-black flex flex-col items-center justify-center border-y-4 border-pink-500/20"
    >
      {/* 
        Google AdSense Integration Placeholder
        Replace this placeholder with the standard Google AdSense display unit code:
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="YYYYYYYYYY"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      */}
      
      <div className="text-center p-8 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md max-w-[80%] shadow-2xl">
        <p className="text-pink-500 font-bold tracking-widest uppercase text-xs mb-4">Advertisement</p>
        <h3 className="text-white text-2xl font-black mb-2">Google Ad Slot</h3>
        <p className="text-gray-400 text-sm mb-6">Replace this block with your AdSense client ID tag to monetize the free feed.</p>
        <div className="w-full h-48 bg-white/10 rounded animate-pulse" />
      </div>

      <div className="absolute bottom-20 text-center animate-bounce">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Swipe up to skip</p>
      </div>
    </div>
  );
}
