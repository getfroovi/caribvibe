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
  let issues: any[] = [];
  try {
    const { data, error } = await supabase
      .from('magazine_issues')
      .select('*')
      .eq('is_published', true)
      .order('published_date', { ascending: false });
    
    if (data && !error) {
      issues = data;
    }
  } catch (err) {
    console.error('Error querying magazine_issues:', err);
  }

  // Backward Compatibility Fallback: If global magazine is enabled and we have settings embed
  // but the magazine_issues table is empty or does not exist, we construct a synthetic issue
  // so the active flip-book still displays immediately.
  if (settings?.is_enabled && issues.length === 0 && (settings.embed_url || settings.embed_code)) {
    issues = [
      {
        id: settings.id || 'fallback-issue-id',
        title: 'Current Issue',
        description: 'Browse the latest interactive edition.',
        cover_image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600',
        embed_url: settings.embed_url,
        embed_code: settings.embed_code,
        is_published: true,
        published_date: settings.updated_at || new Date().toISOString()
      }
    ];
  }

  return <MagazineClient settings={settings} issues={issues} />;
}
