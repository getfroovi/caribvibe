import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { WatchClient } from './WatchClient';

export const revalidate = 0;

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Fetch current video
  const { data: video } = await supabase.from('videos').select('*').eq('id', id).single();
  if (!video) return notFound();

  // 2. Fetch series if available
  let series = null;
  let allEpisodes = [];
  let suggestedSeries = [];
  
  if (video.series_id) {
    const { data: seriesData } = await supabase.from('series').select('*').eq('id', video.series_id).single();
    series = seriesData;

    // Fetch all episodes in this series
    const { data: episodesData } = await supabase.from('videos')
      .select('*')
      .eq('series_id', video.series_id)
      .order('episode_number', { ascending: true });
    
    allEpisodes = episodesData || [];
    
    // Fetch suggested series (just grab a few that are not this one)
    const { data: suggested } = await supabase.from('series')
      .select('*')
      .neq('id', video.series_id)
      .limit(4);
      
    suggestedSeries = suggested || [];
  } else {
    // If no series, just fetch some general suggested series
    const { data: suggested } = await supabase.from('series').select('*').limit(4);
    suggestedSeries = suggested || [];
  }

  // Determine prev and next episode
  let nextVideo = null;
  let prevVideo = null;
  if (allEpisodes.length > 0) {
    const currentIndex = allEpisodes.findIndex(ep => ep.id === video.id);
    if (currentIndex > 0) prevVideo = allEpisodes[currentIndex - 1];
    if (currentIndex < allEpisodes.length - 1) nextVideo = allEpisodes[currentIndex + 1];
  }

  return (
    <WatchClient 
      video={video} 
      series={series} 
      allEpisodes={allEpisodes} 
      prevVideo={prevVideo} 
      nextVideo={nextVideo} 
      suggestedSeries={suggestedSeries} 
    />
  );
}
