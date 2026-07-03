'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function verifyAdminRole() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
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

  return user.id;
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
    await verifyAdminRole(); // Validate admin role
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
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({
          is_enabled: cleanedPayload.is_enabled,
          store_url: cleanedPayload.store_url,
          is_etsy_enabled: cleanedPayload.is_etsy_enabled,
          etsy_url: cleanedPayload.etsy_url
        })
        .eq('id', existing[0].id);

      if (updateError) throw updateError;
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
    return { success: false, error: 'Save Error: ' + (err.message || 'Server action error') };
  }
}

export async function saveMagazineSettingsAction(payload: {
  is_enabled: boolean;
  embed_url: string;
  embed_code?: string;
}) {
  try {
    await verifyAdminRole(); // Validate admin role
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
      const { error: updateError } = await supabase
        .from('magazine_settings')
        .update({
          is_enabled: cleanedPayload.is_enabled,
          embed_url: cleanedPayload.embed_url,
          embed_code: cleanedPayload.embed_code || ''
        })
        .eq('id', existing[0].id);

      if (updateError) throw updateError;
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
    return { success: false, error: 'Save Error: ' + (err.message || 'Server action error') };
  }
}

export async function saveCustomCodeAction(payload: {
  header_code: string;
  body_top_code: string;
  footer_code: string;
}) {
  try {
    await verifyAdminRole(); // Validate admin role
    const supabase = await createClient();
    
    const { data: existing, error: selectError } = await supabase.from('custom_code').select('id').limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      return { success: false, error: selectError.message };
    }

    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from('custom_code')
        .update({
          header_code: payload.header_code || '',
          body_top_code: payload.body_top_code || '',
          footer_code: payload.footer_code || ''
        })
        .eq('id', existing[0].id);

      if (updateError) throw updateError;
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
    return { success: false, error: 'Save Error: ' + (err.message || 'Server action error') };
  }
}

export async function saveHeroSlidesAction(slides: any[], deletedIds: string[]) {
  try {
    await verifyAdminRole(); // Validate admin role
    const supabase = await createClient();

    // 1. Delete removed slides
    if (deletedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('hero_slides')
        .delete()
        .in('id', deletedIds);
      if (deleteError) throw deleteError;
    }

    // 2. Upsert slides
    if (slides.length > 0) {
      const slidesToSave = slides.map(slide => {
        let id = slide.id;
        if (id.startsWith('temp-')) {
          id = id.replace('temp-', '');
        }
        return {
          id,
          title: slide.title,
          description: slide.description || null,
          image_url: slide.image_url,
          series_id: slide.series_id || null,
          link_url: slide.link_url || null,
          button_text: slide.button_text || 'Play',
          order_index: slide.order_index,
          is_trailer: !!slide.is_trailer,
          trailer_url: slide.trailer_url || null
        };
      });

      const { error: upsertError } = await supabase
        .from('hero_slides')
        .upsert(slidesToSave);
      if (upsertError) throw upsertError;
    }

    revalidatePath('/');
    revalidatePath('/admin/hero-slider');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Save Error: ' + (err.message || 'Server action error') };
  }
}
