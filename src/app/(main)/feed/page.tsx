import { FeedRenderer } from '@/components/video/FeedRenderer';
import { BottomNav } from '@/components/layout/BottomNav';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const seriesId = params.seriesId as string | undefined;

  let query = supabase.from('videos').select('*');

  if (seriesId) {
    // If a series is selected, show episodes in sequential order
    query = query.eq('series_id', seriesId).order('episode_number', { ascending: true });
  } else {
    // Global feed fallback
    query = query.order('created_at', { ascending: false });
  }

  const { data: videos } = await query;

  return (
    <>
      <main className="w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory bg-black">
        <FeedRenderer allVideos={videos || []} />
      </main>
      <BottomNav />
    </>
  );
}
