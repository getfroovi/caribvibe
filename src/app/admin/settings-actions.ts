'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

async function getAdminDb() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated. Please log in again.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required.');
  }

  // If SUPABASE_SERVICE_ROLE_KEY is set, use it to ensure RLS doesn't block administrative updates
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }

  return supabase;
}

export async function saveStoreSettingsAction(payload: {
  is_enabled: boolean;
  store_url: string;
  is_etsy_enabled: boolean;
  etsy_url: string;
}) {
  try {
    const db = await getAdminDb();
    const { data: existing, error: selectError } = await db.from('store_settings').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    let error;
    if (existing && existing.length > 0) {
      const res = await db.from('store_settings').update(payload).eq('id', existing[0].id);
      error = res.error;
    } else {
      const res = await db.from('store_settings').insert([payload]);
      error = res.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/shop');
    revalidatePath('/admin/store-settings');
    return { success: true };
  } catch (err: any) {
    console.error('saveStoreSettingsAction error:', err);
    return { success: false, error: err.message || 'Server action error' };
  }
}

export async function saveMagazineSettingsAction(payload: {
  is_enabled: boolean;
  embed_url: string;
  embed_code?: string;
}) {
  try {
    const db = await getAdminDb();
    const { data: existing, error: selectError } = await db.from('magazine_settings').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    let error;
    if (existing && existing.length > 0) {
      const res = await db.from('magazine_settings').update(payload).eq('id', existing[0].id);
      error = res.error;
    } else {
      const res = await db.from('magazine_settings').insert([payload]);
      error = res.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/magazine');
    revalidatePath('/admin/magazine-settings');
    return { success: true };
  } catch (err: any) {
    console.error('saveMagazineSettingsAction error:', err);
    return { success: false, error: err.message || 'Server action error' };
  }
}

export async function saveCustomCodeAction(payload: {
  header_code: string;
  body_top_code: string;
  footer_code: string;
}) {
  try {
    const db = await getAdminDb();
    const { data: existing, error: selectError } = await db.from('custom_code').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    let error;
    if (existing && existing.length > 0) {
      const res = await db.from('custom_code').update(payload).eq('id', existing[0].id);
      error = res.error;
    } else {
      const res = await db.from('custom_code').insert([payload]);
      error = res.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/custom-code');
    return { success: true };
  } catch (err: any) {
    console.error('saveCustomCodeAction error:', err);
    return { success: false, error: err.message || 'Server action error' };
  }
}
