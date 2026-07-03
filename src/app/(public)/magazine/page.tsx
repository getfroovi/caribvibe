import { createClient } from '@/lib/supabase/server';
import MagazineClient from './MagazineClient';

export const revalidate = 0;

export default async function MagazinePage() {
  const supabase = await createClient();
  
  // Get global magazine settings status
  const { data: settings } = await supabase
    .from('magazine_settings')
    .select('*')
    .limit(1)
    .single();

  // Get all published magazine issues, sorted by published date (latest first)
  const { data: issues } = await supabase
    .from('magazine_issues')
    .select('*')
    .eq('is_published', true)
    .order('published_date', { ascending: false });

  return <MagazineClient settings={settings} issues={issues || []} />;
}
