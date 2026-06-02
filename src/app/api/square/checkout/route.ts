import { NextResponse } from 'next/server';
import { Client, Environment } from 'square';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN || 'sq0idp-mock';
    
    // Fallback if the user hasn't put their real token in .env.local yet
    if (squareAccessToken === 'sq0idp-mock') {
      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${origin}/feed?success=true`, { status: 303 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to upgrade' }, { status: 401 });
    }

    const { data: vipSettings } = await supabase.from('vip_settings').select('square_plan_id').limit(1).single();
    const squarePlanId = vipSettings?.square_plan_id;

    if (!squarePlanId) {
      return NextResponse.json({ error: 'Square Plan ID is not configured in Admin Settings' }, { status: 500 });
    }

    const client = new Client({
      accessToken: squareAccessToken,
      environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
    });

    const idempotencyKey = crypto.randomUUID();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey,
      checkoutOptions: {
        subscriptionPlanId: squarePlanId,
        redirectUrl: `${origin}/feed?success=true`,
      },
      order: {
        locationId: process.env.SQUARE_LOCATION_ID || '',
        referenceId: user.id, // We'll use this in the webhook to map back to the Supabase user
      }
    });

    if (response.result.paymentLink?.url) {
      return NextResponse.redirect(response.result.paymentLink.url, { status: 303 });
    }
    
    return NextResponse.json({ error: 'Failed to create Square payment link' }, { status: 500 });
  } catch (err: any) {
    console.error('Square Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
