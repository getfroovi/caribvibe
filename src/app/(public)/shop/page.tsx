import { createClient } from '@/lib/supabase/server';
import ShopClient from './ShopClient';

export const revalidate = 0;

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('store_settings').select('*').limit(1).single();

  return <ShopClient settings={settings} />;
}
