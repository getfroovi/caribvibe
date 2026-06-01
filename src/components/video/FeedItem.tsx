'use client';

import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { useUserStore } from '@/store';
import { createClient } from '@/lib/supabase/client';
import { CommentsModal } from './CommentsModal';
import { toast } from 'sonner';

interface FeedItemProps {
  video: {
    id: string;
    title: string;
    mux_playback_id?: string | null;
    video_url?: string | null;
    video_type?: string;
    preview_duration_seconds: number;
    is_premium: boolean;
    series_id?: string | null;
  };
  nextVideo?: any;
}

export function FeedItem({ video, nextVideo }: FeedItemProps) {
  const { ref, inView } = useInView({
    threshold: 0.6,
  });

  useEffect(() => {
    if (inView && video.series_id) {
      try {
        const historyStr = localStorage.getItem('caribvibe_watch_history');
        const history = historyStr ? JSON.parse(historyStr) : [];
        const updated = history.filter((h: any) => h.seriesId !== video.series_id);
        updated.unshift({
          seriesId: video.series_id,
          videoId: video.id,
          timestamp: Date.now()
        });
        localStorage.setItem('caribvibe_watch_history', JSON.stringify(updated.slice(0, 10)));
      } catch (err) {
        console.error('Failed to save watch history', err);
      }
    }
  }, [inView, video.id, video.series_id]);
  
  const { role, user } = useUserStore();
  const isUserPremium = role === 'premium' || role === 'admin';
  const shouldEnforcePaywall = video.is_premium && !isUserPremium;
  const supabase = createClient();

  // Interaction States
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Fetch initial interaction counts
  useEffect(() => {
    if (inView) {
      fetchInteractions();
    }
  }, [inView, video.id, user?.id]);

  const fetchInteractions = async () => {
    try {
      // Fetch Likes Count
      const { count: likes } = await supabase
        .from('video_likes')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', video.id);
      
      if (likes !== null) setLikesCount(likes);

      // Fetch Comments Count
      const { count: comments } = await supabase
        .from('video_comments')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', video.id);
      
      if (comments !== null) setCommentsCount(comments);

      // Check if current user liked it
      if (user?.id) {
        const { data: userLike } = await supabase
          .from('video_likes')
          .select('id')
          .eq('video_id', video.id)
          .eq('user_id', user.id)
          .single();
        
        setIsLiked(!!userLike);
      }
    } catch (err) {
      console.error('Failed to fetch interactions', err);
    }
  };

  const toggleLike = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to like videos');
      return;
    }

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', video.id)
          .eq('user_id', user.id);
      } else {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        await supabase
          .from('video_likes')
          .insert({
            video_id: video.id,
            user_id: user.id
          });
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
      // Revert optimistic update on failure
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      toast.error('Failed to like video');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/feed?seriesId=${video.series_id || ''}#video-${video.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out ${video.title} on theGriot.io!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <div 
      ref={ref} 
      id={`video-${video.id}`} 
      className="w-full h-[100dvh] snap-start relative flex-shrink-0 bg-black"
    >
      <VideoPlayer
        playbackId={video.mux_playback_id}
        videoUrl={video.video_url}
        videoType={video.video_type || 'mux'}
        title={video.title}
        previewDurationSeconds={video.preview_duration_seconds}
        isPremium={video.is_premium}
        isActive={inView}
      />

      {/* Floating Action Buttons */}
      <div className="absolute right-4 bottom-32 md:bottom-24 flex flex-col items-center gap-6 z-20">
        <button 
          onClick={toggleLike}
          className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform"
        >
          <div className={`backdrop-blur-md p-3 rounded-full border border-white/10 transition-colors ${isLiked ? 'bg-pink-500/80' : 'bg-black/40 group-hover:bg-pink-500/50'}`}>
            <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'text-white fill-white' : 'text-white group-hover:fill-white'}`} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">
            {likesCount > 999 ? (likesCount / 1000).toFixed(1) + 'K' : likesCount}
          </span>
        </button>

        <button 
          onClick={() => setIsCommentsOpen(true)}
          className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform"
        >
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 group-hover:bg-white/20 transition-colors">
            <MessageCircle className="w-6 h-6 text-white group-hover:fill-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">
            {commentsCount > 999 ? (commentsCount / 1000).toFixed(1) + 'K' : commentsCount}
          </span>
        </button>

        <button className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform">
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 group-hover:bg-white/20 transition-colors">
            <Bookmark className="w-6 h-6 text-white group-hover:fill-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">Save</span>
        </button>

        <button 
          onClick={handleShare}
          className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform"
        >
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 group-hover:bg-white/20 transition-colors">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
        </button>
      </div>

      {/* Video Details Overlay */}
      <div className="absolute left-4 bottom-28 md:bottom-20 z-20 max-w-[75%]">
        <h3 className="text-white text-2xl font-black drop-shadow-lg mb-2 leading-tight">{video.title}</h3>
        <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md leading-relaxed font-medium">
          {video.is_premium ? 'Unlock this exclusive premium content to see the rest of the adventure! 🌴✨' : 'Enjoying the island vibes! Follow along for more. #caribvibe #travel'}
        </p>
        
        {shouldEnforcePaywall && (
          <div className="mt-3 inline-flex items-center gap-2 bg-pink-500/20 backdrop-blur-md border border-pink-500/30 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-pink-300 text-xs font-bold uppercase tracking-wider">
              Premium • {video.preview_duration_seconds}s Preview
            </span>
          </div>
        )}
      </div>

      {/* Up Next Button */}
      {nextVideo && (
        <button 
          onClick={() => {
            const el = document.getElementById(`video-${nextVideo.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-[90px] md:bottom-[70px] left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-all text-white px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Up Next (Swipe Up)</span>
            <span className="text-sm font-semibold leading-tight line-clamp-1">Ep {nextVideo.episode_number} - {nextVideo.title}</span>
          </div>
          <div className="bg-white/20 p-1.5 rounded-full animate-bounce mt-1">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      )}

      {/* Comments Modal */}
      <CommentsModal 
        isOpen={isCommentsOpen} 
        onClose={() => {
          setIsCommentsOpen(false);
          // Refresh comment count when modal closes
          fetchInteractions();
        }} 
        videoId={video.id} 
      />
    </div>
  );
}
