'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Play, SkipBack, SkipForward } from 'lucide-react';
import { useUserStore } from '@/store';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';

const GenericPlayer: any = dynamic(() => import('react-player'), { ssr: false });

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
  const { role } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [isPaywallActive, setIsPaywallActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserPremium = role === 'premium' || role === 'admin';
  const shouldEnforcePaywall = video.is_premium && !isUserPremium;

  const handleProgress = (state: any) => {
    if (shouldEnforcePaywall && state.playedSeconds >= video.preview_duration_seconds) {
      if (!isPaywallActive) {
        setIsPaywallActive(true);
      }
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

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

              {video.mux_playback_id ? (
                <MuxPlayer
                  playbackId={video.mux_playback_id}
                  metadata={{ video_id: video.id, video_title: video.title }}
                  className="w-full h-full object-contain"
                  autoPlay="any"
                  controls
                  onTimeUpdate={(e: any) => handleProgress({ playedSeconds: e.currentTarget.currentTime })}
                />
              ) : finalUrl ? (
                <GenericPlayer
                  className="react-player"
                  url={finalUrl}
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  playsinline={true}
                  onProgress={handleProgress}
                  config={{
                    youtube: { playerVars: { playsinline: 1 } },
                    vimeo: { playerOptions: { playsinline: true } }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Video source not found
                </div>
              )}
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
                    <Link href={`/watch/${prevVideo.id}`}>
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
                    <Link href={`/watch/${nextVideo.id}`}>
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
                      href={`/watch/${ep.id}`}
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
