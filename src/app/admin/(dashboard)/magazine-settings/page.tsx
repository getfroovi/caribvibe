import { createClient } from '@/lib/supabase/server';
import MagazineSettingsClient from './MagazineSettingsClient';

export const revalidate = 0;

export default async function MagazineSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('magazine_settings').select('*').limit(1).single();
  const { data: issues } = await supabase.from('magazine_issues').select('*').order('published_date', { ascending: false });

  return <MagazineSettingsClient initialSettings={settings} initialIssues={issues || []} />;
}
