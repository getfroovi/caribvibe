import { createClient } from '@/lib/supabase/server';
import HeroSliderClient from './HeroSliderClient';

export const revalidate = 0;

export default async function HeroSliderSettingsPage() {
  const supabase = await createClient();
  
  const [slidesRes, seriesRes] = await Promise.all([
    supabase.from('hero_slides').select('*').order('order_index', { ascending: true }),
    supabase.from('series').select('id, title').order('created_at', { ascending: false })
  ]);

  return (
    <HeroSliderClient 
      initialSlides={slidesRes.data || []} 
      seriesList={seriesRes.data || []} 
    />
  );
}
