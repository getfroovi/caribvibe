'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getSessionToken() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.access_token) {
    throw new Error('Not authenticated. Please log in again.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required.');
  }

  return session.access_token;
}

async function callRpc(rpcName: string, payload: any, token: string) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/${rpcName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let errMsg = res.statusText;
    try {
      const errBody = await res.json();
      errMsg = errBody.message || errBody.details || errMsg;
    } catch (e) {
      const errText = await res.text();
      errMsg = errText || errMsg;
    }
    throw new Error(errMsg);
  }
  
  return true;
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
    const token = await getSessionToken();
    const supabase = await createClient();
    
    const cleanedPayload = {
      ...payload,
      store_url: cleanUrlInput(payload.store_url),
      etsy_url: cleanUrlInput(payload.etsy_url),
    };

    const { data: existing, error: selectError } = await supabase.from('store_settings').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    if (existing && existing.length > 0) {
      await callRpc('admin_update_store_settings', {
        p_id: existing[0].id,
        p_is_enabled: cleanedPayload.is_enabled,
        p_store_url: cleanedPayload.store_url,
        p_is_etsy_enabled: cleanedPayload.is_etsy_enabled,
        p_etsy_url: cleanedPayload.etsy_url
      }, token);
    } else {
      const res = await supabase.from('store_settings').insert([cleanedPayload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Insert blocked by RLS. Run the SQL script.' };
      }
      if (res.error) return { success: false, error: res.error.message };
    }

    revalidatePath('/shop');
    revalidatePath('/admin/store-settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'RPC Error: ' + (err.message || 'Server action error') };
  }
}

export async function saveMagazineSettingsAction(payload: {
  is_enabled: boolean;
  embed_url: string;
  embed_code?: string;
}) {
  try {
    const token = await getSessionToken();
    const supabase = await createClient();
    
    const cleanedPayload = {
      ...payload,
      embed_url: cleanUrlInput(payload.embed_url),
    };

    const { data: existing, error: selectError } = await supabase.from('magazine_settings').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    if (existing && existing.length > 0) {
      await callRpc('admin_update_magazine_settings', {
        p_id: existing[0].id,
        p_is_enabled: cleanedPayload.is_enabled,
        p_embed_url: cleanedPayload.embed_url,
        p_embed_code: cleanedPayload.embed_code || ''
      }, token);
    } else {
      const res = await supabase.from('magazine_settings').insert([cleanedPayload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Insert blocked by RLS. Run the SQL script.' };
      }
      if (res.error) return { success: false, error: res.error.message };
    }

    revalidatePath('/magazine');
    revalidatePath('/admin/magazine-settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'RPC Error: ' + (err.message || 'Server action error') };
  }
}

export async function saveCustomCodeAction(payload: {
  header_code: string;
  body_top_code: string;
  footer_code: string;
}) {
  try {
    const token = await getSessionToken();
    const supabase = await createClient();
    
    const { data: existing, error: selectError } = await supabase.from('custom_code').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    if (existing && existing.length > 0) {
      await callRpc('admin_update_custom_code', {
        p_id: existing[0].id,
        p_header_code: payload.header_code || '',
        p_body_top_code: payload.body_top_code || '',
        p_footer_code: payload.footer_code || ''
      }, token);
    } else {
      const res = await supabase.from('custom_code').insert([payload]).select();
      if (!res.error && (!res.data || res.data.length === 0)) {
        return { success: false, error: 'Insert blocked by RLS. Run the SQL script.' };
      }
      if (res.error) return { success: false, error: res.error.message };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/custom-code');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'RPC Error: ' + (err.message || 'Server action error') };
  }
}
