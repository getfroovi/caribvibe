'use client';

import { FeedItem } from '@/components/video/FeedItem';
import { FeedAdItem } from '@/components/video/FeedAdItem';
import { useUserStore } from '@/store';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function FeedRenderer({ allVideos }: { allVideos: any[] }) {
  const { siteMode, setUser } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    if (searchParams.get('success') === 'true') {
      toast.success('Welcome to VIP! All premium content is now unlocked.');
      setUser({ id: 'mock-user' } as any, 'premium');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('success');
      router.replace(`/feed${params.toString() ? `?${params.toString()}` : ''}`);
    }
  }, [searchParams, router, setUser]);

  if (!mounted) return <div className="w-full h-full bg-black" />;

  // Filter based on site mode. Premium Series = Any series that has at least one premium video.
  const premiumSeriesIds = new Set(allVideos.filter(v => v.is_premium).map(v => v.series_id));
  
  const filteredVideos = allVideos.filter(v => {
    const isPremiumSeries = premiumSeriesIds.has(v.series_id);
    return siteMode === 'premium' ? isPremiumSeries : !isPremiumSeries;
  });

  return (
    <>
      {/* Floating Back Button */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-6 left-4 z-50 bg-black/50 hover:bg-black/80 backdrop-blur-md p-3 rounded-full text-white transition-all shadow-xl border border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {filteredVideos && filteredVideos.length > 0 ? (
        filteredVideos.map((video, index) => {
          const isLast = index === filteredVideos.length - 1;
          const nextVideo = !isLast ? filteredVideos[index + 1] : undefined;
          
          return (
            <div key={`wrapper-${video.id}`}>
              <FeedItem video={video} nextVideo={siteMode === 'free' ? undefined : nextVideo} />
              
              {/* Insert Ad after EVERY video in Free Mode */}
              {siteMode === 'free' && (
                <FeedAdItem key={`ad-${video.id}`} />
              )}
            </div>
          );
        })
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-black">
          <p>No episodes available in {siteMode === 'free' ? 'Free TV' : 'VIP TV'} mode.</p>
        </div>
      )}
    </>
  );
}
