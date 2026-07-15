'use client';

import Link from 'next/link';
import { ArrowLeft, Play, SkipBack, SkipForward } from 'lucide-react';
import { useUserStore } from '@/store';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { AdUnit } from '@/components/video/AdUnit';
import { createClient } from '@/lib/supabase/client';

if (typeof window !== 'undefined') {
  const originalPlay = HTMLMediaElement.prototype.play;
  if (originalPlay) {
    HTMLMediaElement.prototype.play = function() {
      const promise = originalPlay.apply(this, arguments as any);
      if (promise !== undefined) {
        promise.catch((error: any) => {
          if (error.name !== 'AbortError') {
            throw error;
          }
        });
      }
      return promise;
    };
  }
}

interface WatchClientProps {
  video: any;
  series: any;
  allEpisodes: any[];
  prevVideo: any;
  nextVideo: any;
  suggestedSeries: any[];
}

export function WatchClient({ video, series, allEpisodes, prevVideo, nextVideo, suggestedSeries }: WatchClientProps) {
  const { role, siteMode } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [isPaywallActive, setIsPaywallActive] = useState(false);

  // Ads state (same as feed player)
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adsState, setAdsState] = useState({ first: false, mid: false, last: false });
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [adSettings, setAdSettings] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const muxPlayerRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    const fetchAdSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('ad_settings').select('*').limit(1).single();
      if (data) setAdSettings(data);
    };
    fetchAdSettings();
  }, []);

  const isUserPremium = role === 'premium' || role === 'admin';
  const shouldEnforcePaywall = video.is_premium && !isUserPremium;
  const isExternal = video.video_type === 'youtube' || video.video_type === 'vimeo' || (video.video_url && (video.video_url.includes('vimeo.com') || video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be')));

  let finalUrl = video.video_url;
  if (finalUrl) {
    if (video.video_type === 'vimeo' || finalUrl.includes('vimeo.com')) {
      const vimeoMatch = finalUrl.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        finalUrl = `https://vimeo.com/${vimeoMatch[1]}`;
      }
    } else if (video.video_type === 'youtube' || finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')) {
      if (!finalUrl.includes('youtube.com') && !finalUrl.includes('youtu.be')) {
        finalUrl = `https://www.youtube.com/watch?v=${finalUrl}`;
      }
    }
  }

  // Fallback paywall timer for native iframes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isExternal && shouldEnforcePaywall && !isPaywallActive) {
      timeout = setTimeout(() => {
        setIsPaywallActive(true);
      }, video.preview_duration_seconds * 1000);
    }
    return () => clearTimeout(timeout);
  }, [shouldEnforcePaywall, isPaywallActive, video.preview_duration_seconds, finalUrl, video.video_type, isExternal]);

  // Track active viewing seconds to trigger ads (same as feed player)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isPaywallActive && !showAd) {
      interval = setInterval(() => {
        setActiveSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPaywallActive, showAd]);

  // Trigger ads based on site mode and elapsed time (same as feed player)
  useEffect(() => {
    if (siteMode !== 'free' || isPaywallActive || showAd) return;

    const trigger = (key: keyof typeof adsState) => {
      setShowAd(true);
      setAdCountdown(5);
      setAdsState(prev => ({ ...prev, [key]: true }));
    };

    // Trigger first ad after 30 seconds
    if (!adsState.first && activeSeconds >= 30) {
      trigger('first');
    }
    // Trigger mid-roll ad after 90 seconds
    else if (!adsState.mid && activeSeconds >= 90) {
      trigger('mid');
    }
  }, [activeSeconds, adsState, isPaywallActive, showAd, siteMode]);

  // Reset ad timer state when active video changes
  useEffect(() => {
    setAdsState({ first: false, mid: false, last: false });
    setActiveSeconds(0);
  }, [video.id]);

  // Ad Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAd && adCountdown > 0) {
      timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showAd, adCountdown]);

  const getVimeoId = (url?: string | null) => {
    if (!url) return '';
    const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/)|(album\/\d+\/video\/))?(\d+)?([^\s]*)/;
    const match = url.match(regExp);
    if (match && match[6]) {
      return match[6];
    }
    const parts = url.split('vimeo.com/');
    if (parts.length > 1) {
      return parts[1].split('?')[0].split('/')[0];
    }
    return '';
  };

  const getYoutubeId = (url?: string | null) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }
    return '';
  };

  const getEpisodeHref = (ep: any) => {
    if (series?.slug && ep?.slug) {
      return `/watch/${series.slug}/${ep.slug}`;
    }
    return `/watch/${ep.slug || ep.id}`;
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const renderPlayer = () => {
    if (!isExternal && video.mux_playback_id) {
      return (
        <MuxPlayer
          ref={muxPlayerRef}
          playbackId={video.mux_playback_id}
          metadata={{ video_id: video.id, video_title: video.title }}
          className="w-full h-full object-contain"
          autoPlay={true}
          controls
          paused={showAd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e: any) => {
            const playedSeconds = e.currentTarget.currentTime;
            if (shouldEnforcePaywall && playedSeconds >= video.preview_duration_seconds) {
              setIsPaywallActive(true);
            }
          }}
        />
      );
    }

    if (finalUrl && (video.video_type === 'vimeo' || finalUrl.includes('vimeo.com'))) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${getVimeoId(finalUrl)}?autoplay=1&muted=0&controls=1`}
          className="w-full h-full border-none absolute inset-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (finalUrl && (video.video_type === 'youtube' || finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be'))) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${getYoutubeId(finalUrl)}?autoplay=1&mute=0&controls=1`}
          className="w-full h-full border-none absolute inset-0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (finalUrl) {
      return (
        <video
          src={finalUrl}
          controls={true}
          autoPlay={true}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e: any) => {
            const playedSeconds = e.currentTarget.currentTime;
            if (shouldEnforcePaywall && playedSeconds >= video.preview_duration_seconds) {
              setIsPaywallActive(true);
            }
          }}
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Video source not found
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen text-white pt-20 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-4 flex items-center">
          <Link href={series ? `/series/${series.id}` : '/'}>
            <Button variant="ghost" className="text-gray-400 hover:text-white pl-0">
              <ArrowLeft className="w-5 h-5 mr-2" /> 
              Back to {series ? series.title : 'Home'}
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Video Player Container */}
            <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
              {isPaywallActive ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Premium Content</h3>
                  <p className="text-gray-300 mb-6 max-w-md">Sign up for a VIP subscription to continue watching this episode and unlock all premium content.</p>
                  <Link href="/shop">
                    <Button className="bg-gradient-to-r from-amber-200 to-yellow-500 text-black font-bold h-12 px-8">
                      Upgrade to VIP
                    </Button>
                  </Link>
                </div>
              ) : null}

              {/* Show Ad space or standard video player */}
              {showAd ? (
                <div className="absolute inset-0 z-45 flex flex-col items-center justify-center bg-black/95">
                  <p className="text-pink-500 font-bold tracking-widest uppercase text-xs mb-4 shadow-xl">Advertisement</p>
                  
                  {adSettings?.is_enabled && adSettings?.google_ad_client && adSettings?.video_ad_slot ? (
                    <div className="w-full max-w-[336px] bg-black rounded overflow-hidden">
                      <AdUnit 
                        client={adSettings.google_ad_client} 
                        slot={adSettings.video_ad_slot} 
                        format="rectangle"
                      />
                    </div>
                  ) : (
                    <div className="w-[80%] max-w-[300px] h-[250px] bg-white/10 border border-white/20 rounded-xl flex items-center justify-center animate-pulse shadow-2xl">
                      <span className="text-gray-400 font-bold">Ad Space</span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-10 flex flex-col items-center">
                    {adCountdown > 0 ? (
                      <div className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm">
                        Skip in {adCountdown}s
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowAd(false)}
                        className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        Skip Ad
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {renderPlayer()}
            </div>

            {/* Video Info */}
            <div className="mt-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{video.title}</h1>
              {series && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 font-semibold">
                  <Link href={`/series/${series.id}`} className="hover:text-pink-500 transition-colors">
                    {series.title}
                  </Link>
                  <span>•</span>
                  <span>Episode {video.episode_number}</span>
                </div>
              )}
              
              <div className="bg-zinc-900/50 rounded-xl p-4 md:p-6 mb-8">
                <p className="text-gray-300 whitespace-pre-wrap">{video.description || 'No description available for this episode.'}</p>
              </div>

              {/* Episode Navigation */}
              {(prevVideo || nextVideo) && (
                <div className="flex items-center justify-between py-6 border-t border-zinc-800">
                  {prevVideo ? (
                    <Link href={getEpisodeHref(prevVideo)}>
                      <Button variant="ghost" className="text-gray-300 hover:text-white pl-0">
                        <SkipBack className="w-5 h-5 mr-2" /> 
                        <div className="text-left hidden sm:block">
                          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Previous Episode</div>
                          <div className="font-semibold line-clamp-1">{prevVideo.title}</div>
                        </div>
                      </Button>
                    </Link>
                  ) : <div />}
                  
                  {nextVideo ? (
                    <Link href={getEpisodeHref(nextVideo)}>
                      <Button variant="ghost" className="text-gray-300 hover:text-white pr-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs text-pink-500 font-bold uppercase tracking-wider">Next Episode</div>
                          <div className="font-semibold line-clamp-1">{nextVideo.title}</div>
                        </div>
                        <SkipForward className="w-5 h-5 ml-2" /> 
                      </Button>
                    </Link>
                  ) : <div />}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-[400px] flex-shrink-0 space-y-8">
            
            {/* All Episodes in Series */}
            {series && allEpisodes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                  <span>More from <span className="text-pink-500">{series.title}</span></span>
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {allEpisodes.map((ep) => (
                    <Link 
                      key={ep.id} 
                      href={getEpisodeHref(ep)}
                      className={`flex gap-3 p-2 rounded-lg transition-colors ${ep.id === video.id ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
                    >
                      <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
                        <img 
                          src={ep.thumbnail_url || ep.poster_url || series.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop'} 
                          alt={ep.title}
                          className="w-full h-full object-cover"
                        />
                        {ep.id === video.id && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                              <Play className="w-3 h-3 fill-white text-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-[9px] font-bold rounded text-white">
                          Ep {ep.episode_number}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold line-clamp-2 ${ep.id === video.id ? 'text-pink-400' : 'text-white'}`}>
                          {ep.title}
                        </h4>
                        {ep.is_premium && (
                          <span className="text-[9px] font-bold text-pink-500 mt-1 block">PREMIUM</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Series (when series ends or just extra recommendations) */}
            {suggestedSeries.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4">You Might Also Like</h3>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedSeries.map((s) => (
                    <Link 
                      key={s.id} 
                      href={`/series/${s.id}`}
                      className="group block relative aspect-[2/3] rounded-lg overflow-hidden"
                    >
                      <img 
                        src={s.poster_url || s.thumbnail_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop'} 
                        alt={s.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <h4 className="text-xs font-bold text-white drop-shadow-md">{s.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #3f3f46;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
