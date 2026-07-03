import { createClient } from '@/lib/supabase/server';
import MagazineSettingsClient from './MagazineSettingsClient';

export const revalidate = 0;

export default async function MagazineSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('magazine_settings').select('*').limit(1).single();

  return <MagazineSettingsClient initialSettings={settings} />;
}
