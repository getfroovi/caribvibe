import { NextResponse } from 'next/server';
import { muxVideo } from '@/lib/mux/client';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const upload = await muxVideo.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
      },
      cors_origin: '*', 
    });
    
    return NextResponse.json({ url: upload.url, uploadId: upload.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
