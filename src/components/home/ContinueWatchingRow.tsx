'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

export function ContinueWatchingRow({ seriesList, videosList }: { seriesList: any[], videosList: any[] }) {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const historyStr = localStorage.getItem('caribvibe_watch_history');
      if (historyStr) {
        const history = JSON.parse(historyStr);
        const mapped = history.map((entry: any) => {
          const series = seriesList.find(s => s.id === entry.seriesId);
          const video = videosList.find(v => v.id === entry.videoId);
          if (!series || !video) return null;
          
          return {
            id: series.id,
            videoId: video.id,
            title: series.title,
            epTitle: `Ep ${video.episode_number} - ${video.title}`,
            img: video.thumbnail_url || video.poster_url || series.poster_url || series.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
            href: `/feed?seriesId=${series.id}#video-${video.id}`
          };
        }).filter(Boolean);
        setHistoryItems(mapped);
      }
    } catch (e) {}
  }, [seriesList, videosList]);

  if (!mounted || historyItems.length === 0) return null;

  return (
    <div className="pl-4 md:pl-12 mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-white drop-shadow-md tracking-tight flex items-center gap-2">
        Continue Watching
      </h2>
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory pr-12">
        {historyItems.map((item: any) => (
          <Link 
            key={item.id} 
            href={item.href} 
            className="snap-start relative flex-shrink-0 w-[130px] h-[195px] md:w-[180px] md:h-[270px] rounded-md overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10 ring-2 ring-pink-500 ring-offset-2 ring-offset-black"
          >
            <img 
              src={item.img} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-500/80 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
              <Play className="w-6 h-6 fill-white text-white" />
            </div>

            <div className="absolute bottom-0 left-0 p-3 w-full">
              <p className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-lg line-clamp-1">{item.title}</p>
              <p className="text-gray-300 text-[10px] md:text-xs font-semibold leading-tight line-clamp-1 mt-0.5">{item.epTitle}</p>
              
              {/* Progress bar mock */}
              <div className="w-full h-1 bg-white/30 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-pink-500 w-[60%] rounded-full" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
