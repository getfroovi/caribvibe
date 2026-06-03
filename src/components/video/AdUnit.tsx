'use client';

import { useEffect, useState } from 'react';

interface AdUnitProps {
  client: string;
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
}

export function AdUnit({ client, slot, format = 'auto', className = '', responsive = true }: AdUnitProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        // Only push if the ad isn't already filled
        if (!error) {
          adsbygoogle.push({});
        }
      }
    } catch (err) {
      console.error('AdSense initialization error:', err);
      setError(true);
    }
  }, [error]);

  if (error || !client || !slot) {
    return (
      <div className={`flex flex-col items-center justify-center bg-zinc-900/50 border border-white/5 rounded-xl p-8 ${className}`}>
        <p className="text-pink-500 font-bold tracking-widest uppercase text-[10px] mb-2">Advertisement Slot</p>
        <p className="text-zinc-600 text-xs">Ad blocked or invalid configuration</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden w-full flex justify-center ${className}`}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      ></ins>
    </div>
  );
}
