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

    if (existing && existing.length > 0) {
      const res = await db.rpc('admin_update_store_settings', {
        p_id: existing[0].id,
        p_is_enabled: cleanedPayload.is_enabled,
        p_store_url: cleanedPayload.store_url,
        p_is_etsy_enabled: cleanedPayload.is_etsy_enabled,
        p_etsy_url: cleanedPayload.etsy_url
      });
      if (res.error) {
        return { success: false, error: 'RPC Error: Please run the updated SQL script in Supabase to enable Admin Saving. ' + res.error.message };
      }
    } else {
      const res = await db.from('store_settings').insert([cleanedPayload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Insert blocked by RLS. Run the SQL script.' };
      }
      if (res.error) return { success: false, error: res.error.message };
    }

    revalidatePath('/shop');
    revalidatePath('/admin/store-settings');
    return { success: true };
  } catch (err: any) {
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

    if (existing && existing.length > 0) {
      const res = await db.rpc('admin_update_magazine_settings', {
        p_id: existing[0].id,
        p_is_enabled: cleanedPayload.is_enabled,
        p_embed_url: cleanedPayload.embed_url,
        p_embed_code: cleanedPayload.embed_code || ''
      });
      if (res.error) {
        return { success: false, error: 'RPC Error: Please run the updated SQL script in Supabase to enable Admin Saving. ' + res.error.message };
      }
    } else {
      const res = await db.from('magazine_settings').insert([cleanedPayload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Insert blocked by RLS. Run the SQL script.' };
      }
      if (res.error) return { success: false, error: res.error.message };
    }

    revalidatePath('/magazine');
    revalidatePath('/admin/magazine-settings');
    return { success: true };
  } catch (err: any) {
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

    if (existing && existing.length > 0) {
      const res = await db.rpc('admin_update_custom_code', {
        p_id: existing[0].id,
        p_header_code: payload.header_code || '',
        p_body_top_code: payload.body_top_code || '',
        p_footer_code: payload.footer_code || ''
      });
      if (res.error) {
        return { success: false, error: 'RPC Error: Please run the updated SQL script in Supabase to enable Admin Saving. ' + res.error.message };
      }
    } else {
      const res = await db.from('custom_code').insert([payload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Insert blocked by RLS. Run the SQL script.' };
      }
      if (res.error) return { success: false, error: res.error.message };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/custom-code');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server action error' };
  }
}
