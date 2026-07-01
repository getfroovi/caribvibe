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

function cleanUrlInput(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export async function saveStoreSettingsAction(payload: {
  is_enabled: boolean;
  store_url: string;
  is_etsy_enabled: boolean;
  etsy_url: string;
}) {
  try {
    const db = await getAdminDb();
    const cleanedPayload = {
      ...payload,
      store_url: cleanUrlInput(payload.store_url),
      etsy_url: cleanUrlInput(payload.etsy_url),
    };

    const { data: existing, error: selectError } = await db.from('store_settings').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    let error;
    if (existing && existing.length > 0) {
      const res = await db.from('store_settings').update(cleanedPayload).eq('id', existing[0].id).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Database update blocked by Supabase Row-Level Security (RLS). Please execute the master SQL sync script in your Supabase SQL Editor so your account has UPDATE permissions.' };
      }
      error = res.error;
    } else {
      const res = await db.from('store_settings').insert([cleanedPayload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Database insert blocked by Supabase Row-Level Security (RLS). Please execute the master SQL sync script in your Supabase SQL Editor.' };
      }
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
    const cleanedPayload = {
      ...payload,
      embed_url: cleanUrlInput(payload.embed_url),
    };

    const { data: existing, error: selectError } = await db.from('magazine_settings').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    let error;
    if (existing && existing.length > 0) {
      const res = await db.from('magazine_settings').update(cleanedPayload).eq('id', existing[0].id).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Database update blocked by Supabase Row-Level Security (RLS). Please execute the master SQL sync script in your Supabase SQL Editor so your account has UPDATE permissions.' };
      }
      error = res.error;
    } else {
      const res = await db.from('magazine_settings').insert([cleanedPayload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Database insert blocked by Supabase Row-Level Security (RLS). Please execute the master SQL sync script in your Supabase SQL Editor.' };
      }
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
      const res = await db.from('custom_code').update(payload).eq('id', existing[0].id).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Database update blocked by Supabase Row-Level Security (RLS). Please execute the master SQL sync script in your Supabase SQL Editor.' };
      }
      error = res.error;
    } else {
      const res = await db.from('custom_code').insert([payload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Database insert blocked by Supabase Row-Level Security (RLS). Please execute the master SQL sync script in your Supabase SQL Editor.' };
      }
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
