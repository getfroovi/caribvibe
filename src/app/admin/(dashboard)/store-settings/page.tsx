import { createClient } from '@/lib/supabase/server';
import StoreSettingsClient from './StoreSettingsClient';

export const revalidate = 0;

export default async function StoreSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('store_settings').select('*').limit(1).single();

  return <StoreSettingsClient initialSettings={settings} />;
}
