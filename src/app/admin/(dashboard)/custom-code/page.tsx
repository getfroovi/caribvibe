import { createClient } from '@/lib/supabase/server';
import CustomCodeClient from './CustomCodeClient';

export const revalidate = 0;

export default async function CustomCodePage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('custom_code').select('*').limit(1).single();

  return <CustomCodeClient initialSettings={settings} />;
}
