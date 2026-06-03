'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { ContinueWatchingRow } from '@/components/home/ContinueWatchingRow';
import { useUserStore } from '@/store';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrailerModal } from '@/components/home/TrailerModal';

export function HomeRenderer({ seriesList, videosList, heroSlides }: { seriesList: any[], videosList: any[], heroSlides?: any[] }) {
  const { siteMode } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate hero slides every 5 seconds
  useEffect(() => {
    if (!heroSlides || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  // Filter based on site mode. 
  // Premium Series = Any series that has at least one premium video.
  const premiumSeriesIds = new Set(videosList.filter(v => v.is_premium).map(v => v.series_id));
  
  const filteredSeriesList = seriesList;
  const filteredVideosList = videosList;

  const seriesRows: any[] = [];

  if (filteredSeriesList && filteredSeriesList.length > 0) {
    // 1. Trending Series Row
    const trendingSeries = filteredSeriesList.filter(s => s.category === 'Trending Now' || !s.category);
    if (trendingSeries.length > 0) {
      seriesRows.push({
        title: 'Trending Now',
        items: trendingSeries.map(series => ({
          id: series.id,
          title: series.title,
          img: series.poster_url || series.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
          href: `/series/${series.id}`
        }))
      });
    }

    // 2. New Releases Row
    const newReleases = [...filteredSeriesList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (newReleases.length > 0) {
      seriesRows.push({
        title: 'New Releases',
        items: newReleases.map(series => ({
          id: series.id,
          title: series.title,
          img: series.poster_url || series.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
          href: `/series/${series.id}`
        }))
      });
    }
  }

  // 3. Series by Name Rows (Episodes)
  const rows: any[] = [];
  if (filteredSeriesList && filteredVideosList) {
    filteredSeriesList.forEach((series) => {
      const episodes = filteredVideosList
        .filter(v => v.series_id === series.id)
        .sort((a, b) => a.episode_number - b.episode_number);
        
      if (episodes.length > 0) {
        rows.push({
          title: series.title,
          items: episodes.map(v => ({
            id: v.id,
            title: `Ep ${v.episode_number} - ${v.title}`,
            img: v.thumbnail_url || v.poster_url || series.poster_url || series.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
            href: `/feed?seriesId=${series.id}#video-${v.id}`
          }))
        });
      }
    });
  }

  const featuredSeries = filteredSeriesList.length > 0 ? filteredSeriesList[0] : null;
  const hasCustomSlides = heroSlides && heroSlides.length > 0;

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const currentSlide = hasCustomSlides ? heroSlides[currentSlideIndex] : null;

  return (
    <div className="bg-black min-h-screen text-white pb-20 -mt-16">
      {/* Hero Section */}
      <div className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {hasCustomSlides ? (
            <motion.div
              key={`slide-${currentSlideIndex}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url('${currentSlide?.image_url}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

              <div className="absolute bottom-[10%] md:bottom-[15%] left-4 md:left-12 max-w-2xl z-10">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-black mb-4 tracking-tighter drop-shadow-2xl text-white uppercase"
                >
                  {currentSlide?.title}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 text-lg md:text-xl line-clamp-3 mb-8 drop-shadow-md font-medium leading-relaxed"
                >
                  {currentSlide?.description}
                </motion.p>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4"
                >
                  {currentSlide?.is_trailer ? (
                    <Button 
                      onClick={() => setIsTrailerModalOpen(true)}
                      size="lg" 
                      className="bg-white text-black hover:bg-gray-200 font-bold px-6 md:px-8 h-12 rounded-md text-base transition-transform hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-2 fill-black" /> Watch Trailer
                    </Button>
                  ) : (
                    <Link href={currentSlide?.series_id ? `/feed?seriesId=${currentSlide.series_id}` : (currentSlide?.link_url || '#')}>
                      <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-6 md:px-8 h-12 rounded-md text-base transition-transform hover:scale-105">
                        <Play className="w-5 h-5 mr-2 fill-black" /> Watch Now
                      </Button>
                    </Link>
                  )}
                  {currentSlide?.series_id && (
                    <Link href={`/series/${currentSlide.series_id}`}>
                      <Button size="lg" variant="outline" className="bg-white/20 border-transparent backdrop-blur-md text-white hover:bg-white/30 h-12 px-6 md:px-8 rounded-md text-base transition-transform hover:scale-105">
                        <Info className="w-5 h-5 mr-2" /> More Info
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="fallback" className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000" 
                style={{ backgroundImage: `url('${featuredSeries?.poster_url || featuredSeries?.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop'}')` }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

              <div className="absolute bottom-[10%] md:bottom-[15%] left-4 md:left-12 max-w-2xl z-10">
                <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter drop-shadow-2xl text-white uppercase">
                  {featuredSeries ? featuredSeries.title : 'Island Whispers'}
                </h1>
                <div className="flex items-center gap-4 text-sm font-semibold mb-6 text-gray-300 drop-shadow-md">
                  <span className="text-pink-500 font-bold">2026</span>
                  <span>•</span>
                  <span>Series</span>
                  <span>•</span>
                  <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs font-bold text-gray-300">TV-MA</span>
                </div>
                <p className="text-gray-300 text-lg md:text-xl line-clamp-3 mb-8 drop-shadow-md font-medium leading-relaxed">
                  {featuredSeries ? (featuredSeries.description || 'Watch the latest exclusive content.') : 'When a mysterious traveler arrives at the most exclusive resort in the Caribbean, secrets begin to wash ashore.'}
                </p>
                <div className="flex items-center gap-4">
                  <Link href={featuredSeries ? `/feed?seriesId=${featuredSeries.id}` : '/feed'}>
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-6 md:px-8 h-12 rounded-md text-base transition-transform hover:scale-105">
                      <Play className="w-5 h-5 mr-2 fill-black" /> Play
                    </Button>
                  </Link>
                  <Link href={featuredSeries ? `/series/${featuredSeries.id}` : '#'}>
                    <Button size="lg" variant="outline" className="bg-white/20 border-transparent backdrop-blur-md text-white hover:bg-white/30 h-12 px-6 md:px-8 rounded-md text-base transition-transform hover:scale-105">
                      <Info className="w-5 h-5 mr-2" /> More Info
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Indicators */}
        {hasCustomSlides && heroSlides.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlideIndex === idx ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Scroll Rows */}
      <div className="relative z-20 -mt-12 md:-mt-24 pb-12">
        <ContinueWatchingRow seriesList={filteredSeriesList || []} videosList={filteredVideosList || []} />
        
        <div className="space-y-8 md:space-y-12">
          {seriesRows.map((row, idx) => (
            <div key={`seriesRow-${idx}`} className="pl-4 md:pl-12">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white drop-shadow-md tracking-tight flex items-center gap-2">
                {row.title === 'Trending Now' && <span className="text-pink-500">🔥</span>}
                {row.title === 'New Releases' && <span className="text-pink-500">✨</span>}
                {row.title}
              </h2>
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory pr-12">
                {row.items.map((item: any) => (
                  <Link 
                    key={item.id} 
                    href={item.href} 
                    className="snap-start relative flex-shrink-0 w-[130px] h-[195px] md:w-[180px] md:h-[270px] rounded-md overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10"
                  >
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <p className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-lg">{item.title}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-pink-500">
                        <Play className="w-3 h-3 md:w-4 md:h-4 fill-pink-500 drop-shadow-lg" /> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider drop-shadow-lg">View Series</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {rows.map((row, idx) => (
            <div key={idx} className="pl-4 md:pl-12">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white drop-shadow-md tracking-tight">{row.title}</h2>
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory pr-12">
                {row.items.map((item: any) => (
                  <Link 
                    key={item.id} 
                    href={item.href} 
                    className="snap-start relative flex-shrink-0 w-[130px] h-[195px] md:w-[180px] md:h-[270px] rounded-md overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10"
                  >
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <p className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-lg">{item.title}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-pink-500">
                        <Play className="w-3 h-3 md:w-4 md:h-4 fill-pink-500 drop-shadow-lg" /> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider drop-shadow-lg">Watch</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {rows.length === 0 && seriesRows.length === 0 && (
          <div className="pl-4 md:pl-12 text-gray-500 py-12">
            No content uploaded for {siteMode === 'free' ? 'Free TV' : 'VIP TV'} yet.
          </div>
        )}
      </div>

      <TrailerModal 
        isOpen={isTrailerModalOpen} 
        onClose={() => setIsTrailerModalOpen(false)} 
        trailerUrl={currentSlide?.trailer_url || ''} 
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
