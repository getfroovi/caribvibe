import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { HomeRenderer } from '@/components/home/HomeRenderer';

export const revalidate = 0;

export default async function ReelShortLandingPage() {
  const supabase = await createClient();
  const [{ data: seriesList }, { data: videosList }, { data: heroSlides }] = await Promise.all([
    supabase.from('series').select('*').order('created_at', { ascending: false }),
    supabase.from('videos').select('*').order('created_at', { ascending: false }),
    supabase.from('hero_slides').select('*').order('order_index', { ascending: true })
  ]);

  return <HomeRenderer 
    seriesList={seriesList || []} 
    videosList={videosList || []} 
    heroSlides={heroSlides || []} 
  />;
}
