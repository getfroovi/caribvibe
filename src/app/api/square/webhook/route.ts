import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { WebhooksHelper } from 'square';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
  );
  try {
    const signature = req.headers.get('x-square-hmacsha256-signature') as string;
    const body = await req.text();
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SECRET || 'test_secret';

    if (webhookSignatureKey !== 'test_secret') {
      const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/square/webhook`;
      const isValid = await WebhooksHelper.verifySignature({
        requestBody: body,
        signatureHeader: signature,
        signatureKey: webhookSignatureKey,
        notificationUrl: url
      });

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);

    // Because Square Checkout abstracts the subscription creation, 
    // the easiest reliable way to link it in our schema is via customer email or looking at order reference_id.
    // For this boilerplate, we'll handle `subscription.created` and `subscription.canceled`

    if (event.type === 'subscription.created' || event.type === 'subscription.updated') {
      const subscription = event.data.object.subscription;
      const customerId = subscription.customer_id;
      
      // We would ideally fetch the customer email from Square to link it, 
      // but if we assume the user is already linked or we just grant premium:
      // (In a full production Square app, you'd listen to `order.created` first to map `reference_id` -> `customer_id`)
      
      // Let's assume we can map it via customer_id
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('square_customer_id', customerId)
        .single();
        
      if (profile) {
        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'premium',
            square_subscription_id: subscription.id,
          })
          .eq('id', profile.id);
      }
    }

    if (event.type === 'subscription.canceled') {
      const subscription = event.data.object.subscription;
      await supabaseAdmin
        .from('profiles')
        .update({
          role: 'free',
          square_subscription_id: null,
        })
        .eq('square_subscription_id', subscription.id);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Square Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}
