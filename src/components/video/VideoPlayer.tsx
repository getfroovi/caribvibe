'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { PremiumModal } from './PremiumModal';
import { useUserStore } from '@/store';
import { Volume2, VolumeX, SkipForward, Play } from 'lucide-react';
import { AdUnit } from '@/components/video/AdUnit';
import { createClient } from '@/lib/supabase/client';

const GenericPlayer: any = dynamic(() => import('react-player'), { ssr: false });

interface VideoPlayerProps {
  playbackId?: string | null;
  videoUrl?: string | null;
  videoType?: string;
  title: string;
  previewDurationSeconds: number;
  isPremium: boolean;
  isActive: boolean;
}

export function VideoPlayer({
  playbackId,
  videoUrl,
  videoType = 'mux',
  title,
  previewDurationSeconds,
  isPremium,
  isActive
}: VideoPlayerProps) {
  const [isPaywallActive, setIsPaywallActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const playerRef = useRef<any>(null);
  const reactPlayerRef = useRef<any>(null);
  const { role, siteMode } = useUserStore();
  const [adSettings, setAdSettings] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const fetchAdSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('ad_settings').select('*').limit(1).single();
      if (data) setAdSettings(data);
    };
    fetchAdSettings();
  }, []);

  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const isUserPremium = role === 'premium' || role === 'admin';
  const shouldEnforcePaywall = isPremium && !isUserPremium;
  const isExternal = videoType === 'youtube' || videoType === 'vimeo' || videoType === 'external';

  // Fallback paywall timer for native iframes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isActive && isExternal && shouldEnforcePaywall && !isPaywallActive) {
      timeout = setTimeout(() => {
        setIsPaywallActive(true);
      }, previewDurationSeconds * 1000);
    }
    return () => clearTimeout(timeout);
  }, [isActive, isExternal, shouldEnforcePaywall, isPaywallActive, previewDurationSeconds]);

  const [duration, setDuration] = useState<number | null>(null);
  const [adsState, setAdsState] = useState({ first: false, mid: false, last: false });
  const [activeSeconds, setActiveSeconds] = useState(0);

  // Track active viewing time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isPaywallActive && !showAd) {
      interval = setInterval(() => {
        setActiveSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaywallActive, showAd]);

  // Ad triggers based on user rules
  useEffect(() => {
    if (siteMode !== 'free' || !isActive || isPaywallActive || showAd) return;

    const trigger = (key: keyof typeof adsState) => {
      setShowAd(true);
      setAdCountdown(5);
      setAdsState(prev => ({ ...prev, [key]: true }));
    };

    // 1. After 30 seconds when the video starts
    if (!adsState.first && activeSeconds >= 30) {
      trigger('first');
    }
    // 2. Mid-way the duration of the video
    else if (!adsState.mid && duration && activeSeconds >= (duration / 2)) {
      trigger('mid');
    }
    // Fallback if duration is unknown (e.g. YouTube iframe)
    else if (!adsState.mid && !duration && activeSeconds >= 90) {
      trigger('mid');
    }
    // 3. 60 seconds before the video ends
    else if (!adsState.last && duration && duration > 60 && activeSeconds >= (duration - 60)) {
      trigger('last');
    }
  }, [activeSeconds, duration, adsState, isActive, isPaywallActive, showAd, siteMode]);

  // Reset state when video changes (becomes inactive)
  useEffect(() => {
    if (!isActive) {
      setAdsState({ first: false, mid: false, last: false });
      setActiveSeconds(0);
    }
  }, [isActive]);

  // Ad Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAd && adCountdown > 0) {
      timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showAd, adCountdown]);

  const handleTimeUpdate = (e: Event) => {
    const target = e.target as HTMLMediaElement;
    if (shouldEnforcePaywall && target.currentTime >= previewDurationSeconds) {
      if (!isPaywallActive) {
        setIsPaywallActive(true);
        target.pause();
      }
    }
  };

  const handleProgressReactPlayer = (state: any) => {
    const playedSeconds = state.playedSeconds;
    if (shouldEnforcePaywall && playedSeconds >= previewDurationSeconds) {
      if (!isPaywallActive) {
        setIsPaywallActive(true);
      }
    }
  };

  const getFormattedUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.includes('youtube.com/shorts/')) {
      const id = url.split('shorts/')[1].split('?')[0];
      return `https://www.youtube.com/watch?v=${id}`;
    }
    return url;
  };

  if (!mounted) return <div className="w-full h-full bg-black animate-pulse" />;

  const ytUrl = getFormattedUrl(videoUrl);
  const ytId = ytUrl?.split('v=')[1]?.split('&')[0];
  const vimeoId = videoUrl?.split('vimeo.com/')[1]?.split('?')[0];

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <div 
        onClick={togglePlay}
        className={`w-full h-full cursor-pointer relative transition-all duration-1000 ease-out ${isPaywallActive ? 'blur-2xl scale-110 opacity-40 brightness-50 pointer-events-none' : ''}`}
      >
        
        {!isExternal && playbackId ? (
          // @ts-ignore
          <GenericPlayer
            ref={reactPlayerRef}
            url={`https://stream.mux.com/${playbackId}.m3u8`}
            width="100%"
            height="100%"
            playing={isPlaying && !isPaywallActive && !showAd}
            loop
            muted={isMuted}
            playsinline={true}
            style={{ pointerEvents: isPaywallActive ? 'none' : 'auto' }}
            onProgress={handleProgressReactPlayer}
            onDuration={(d: number) => setDuration(d)}
            config={{
              file: {
                attributes: {
                  playsInline: true,
                  playsinline: true,
                  webkitPlaysInline: true
                }
              }
            }}
          />
        ) : videoUrl ? (
          <GenericPlayer
            className="react-player"
            ref={reactPlayerRef}
            url={ytUrl || videoUrl}
            playing={isPlaying && !isPaywallActive && !showAd}
            loop
            muted={isMuted}
            playsinline={true}
            width="100%"
            height="100%"
            controls={false}
            style={{ pointerEvents: isPaywallActive ? 'none' : 'auto' }}
            onProgress={handleProgressReactPlayer}
            onDuration={(d: number) => setDuration(d)}
            config={{
              file: {
                attributes: {
                  playsInline: true,
                  playsinline: true,
                  webkitPlaysInline: true
                }
              },
              youtube: {
                playerVars: { playsinline: 1, controls: 1, loop: 1, autoplay: 1 }
              },
              vimeo: {
                playerOptions: { loop: true, playsinline: true }
              }
            }}
          />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-500">Video Source Error</div>
        )}

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
            <div className="bg-black/60 p-5 rounded-full text-white backdrop-blur-md transition-all transform scale-100 animate-in fade-in zoom-in-75 duration-200">
              <Play className="w-8 h-8 fill-current text-white" />
            </div>
          </div>
        )}

      </div>

      {/* Mute/Unmute Toggle */}
      {!isPaywallActive && (
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-6 right-4 z-40 bg-black/50 hover:bg-black/80 backdrop-blur-md p-3 rounded-full text-white transition-all shadow-xl border border-white/10"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {isPaywallActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <PremiumModal onUnlock={() => setIsPaywallActive(false)} />
        </div>
      )}

      {showAd && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
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
          
          <div className="absolute bottom-24 flex flex-col items-center">
            {adCountdown > 0 ? (
              <div className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm">
                Skip in {adCountdown}s
              </div>
            ) : (
              <button 
                onClick={() => setShowAd(false)}
                className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
              >
                Skip Ad <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Gradient overlay for text readability on feed */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
