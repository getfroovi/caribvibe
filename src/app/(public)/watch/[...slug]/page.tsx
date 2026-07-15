import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { WatchClient } from './WatchClient';

export const revalidate = 0;

export default async function WatchPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const supabase = await createClient();
  const params = await props.params;
  const slugArray = params.slug || [];

  if (slugArray.length === 0) {
    return notFound();
  }

  let video = null;
  let series = null;

  // 1. Resolve Slugs & Handle Legacy UUID redirects
  if (slugArray.length === 1) {
    const singleSlug = slugArray[0];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(singleSlug)) {
      // Legacy UUID: fetch video and redirect permanently (301) to pretty SEO url
      const { data: legacyVideo } = await supabase
        .from('videos')
        .select('*, series:series_id(*)')
        .eq('id', singleSlug)
        .single();

      if (legacyVideo) {
        if (legacyVideo.series) {
          redirect(`/watch/${legacyVideo.series.slug}/${legacyVideo.slug}`);
        } else {
          redirect(`/watch/${legacyVideo.slug}`);
        }
      }
      return notFound();
    } else {
      // Standalone video slug
      const { data: standaloneVideo } = await supabase
        .from('videos')
        .select('*')
        .eq('slug', singleSlug)
        .is('series_id', null)
        .single();

      if (!standaloneVideo) {
        // Fallback: search globally just in case
        const { data: globalVideo } = await supabase
          .from('videos')
          .select('*, series:series_id(*)')
          .eq('slug', singleSlug)
          .single();

        if (globalVideo) {
          if (globalVideo.series) {
            redirect(`/watch/${globalVideo.series.slug}/${globalVideo.slug}`);
          } else {
            redirect(`/watch/${globalVideo.slug}`);
          }
        }
        return notFound();
      }
      video = standaloneVideo;
    }
  } else if (slugArray.length === 2) {
    const seriesSlug = slugArray[0];
    const episodeSlug = slugArray[1];

    // Fetch series by slug
    const { data: seriesData } = await supabase
      .from('series')
      .select('*')
      .eq('slug', seriesSlug)
      .single();

    if (!seriesData) return notFound();
    series = seriesData;

    // Fetch episode by series_id and episode slug
    const { data: episodeVideo } = await supabase
      .from('videos')
      .select('*')
      .eq('series_id', series.id)
      .eq('slug', episodeSlug)
      .single();

    if (!episodeVideo) return notFound();
    video = episodeVideo;
  } else {
    return notFound();
  }

  // 2. Fetch series episodes and suggestions if series exists
  let allEpisodes: any[] = [];
  let suggestedSeries: any[] = [];

  if (video.series_id) {
    // If series object was not loaded during resolution, load it now
    if (!series) {
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .eq('id', video.series_id)
        .single();
      series = seriesData;
    }

    // Fetch all episodes in this series
    const { data: episodesData } = await supabase
      .from('videos')
      .select('*')
      .eq('series_id', video.series_id)
      .order('episode_number', { ascending: true });
    
    allEpisodes = episodesData || [];
    
    // Fetch suggested series (excluding this one)
    const { data: suggested } = await supabase
      .from('series')
      .select('*')
      .neq('id', video.series_id)
      .limit(4);
      
    suggestedSeries = suggested || [];
  } else {
    // If standalone video, grab general suggested series
    const { data: suggested } = await supabase
      .from('series')
      .select('*')
      .limit(4);
    suggestedSeries = suggested || [];
  }

  // 3. Determine prev and next episode
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
