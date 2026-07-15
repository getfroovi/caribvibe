'use client';

import { useState, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { PremiumModal } from './PremiumModal';
import { useUserStore } from '@/store';
import { AdUnit } from '@/components/video/AdUnit';
import { createClient } from '@/lib/supabase/client';

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
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
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

    // Trigger ad after 30 seconds
    if (!adsState.first && activeSeconds >= 30) {
      trigger('first');
    }
    // Fallback mid-roll ad after 90 seconds
    else if (!adsState.mid && activeSeconds >= 90) {
      trigger('mid');
    }
  }, [activeSeconds, adsState, isActive, isPaywallActive, showAd, siteMode]);

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

  const handleMuxTimeUpdate = (e: Event) => {
    const target = e.target as HTMLMediaElement;
    if (shouldEnforcePaywall && target.currentTime >= previewDurationSeconds) {
      if (!isPaywallActive) {
        setIsPaywallActive(true);
        target.pause();
      }
    }
  };

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

  if (!mounted) return <div className="w-full h-full bg-black animate-pulse" />;

  const renderPlayer = () => {
    // If Mux stream
    if (!isExternal && playbackId) {
      return (
        <MuxPlayer
          playbackId={playbackId}
          metadata={{ video_id: playbackId, video_title: title }}
          className="w-full h-full object-contain"
          autoPlay={isActive ? "any" : false}
          controls={true}
          muted={true}
          loop={true}
          streamType="on-demand"
          onTimeUpdate={handleMuxTimeUpdate}
        />
      );
    }

    // If Vimeo video
    if (videoType === 'vimeo' || (videoUrl && videoUrl.includes('vimeo.com'))) {
      const vimeoId = getVimeoId(videoUrl);
      const embedSrc = `https://player.vimeo.com/video/${vimeoId}?autoplay=${isActive ? 1 : 0}&loop=1&muted=1&controls=1`;
      return (
        <iframe
          src={embedSrc}
          className="w-full h-full border-none absolute inset-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // If YouTube video
    if (videoType === 'youtube' || (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')))) {
      const ytId = getYoutubeId(videoUrl);
      const embedSrc = `https://www.youtube.com/embed/${ytId}?autoplay=${isActive ? 1 : 0}&loop=1&mute=1&controls=1&playlist=${ytId}`;
      return (
        <iframe
          src={embedSrc}
          className="w-full h-full border-none absolute inset-0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Fallback standard HTML5 video tag
    if (videoUrl) {
      return (
        <video
          src={videoUrl}
          controls={true}
          loop={true}
          muted={true}
          autoPlay={isActive}
          playsInline={true}
          className="w-full h-full object-contain"
          onTimeUpdate={handleMuxTimeUpdate}
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
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <div 
        className={`w-full h-full relative transition-all duration-1000 ease-out ${isPaywallActive ? 'blur-2xl scale-110 opacity-40 brightness-50 pointer-events-none' : ''}`}
      >
        {renderPlayer()}
      </div>

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
                Skip Ad
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
