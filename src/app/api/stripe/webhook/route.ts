import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
  apiVersion: '2025-02-24.acacia' as any,
});

// Use service role key to bypass RLS for updating roles
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    if (session.client_reference_id) {
      await supabaseAdmin
        .from('profiles')
        .update({
          role: 'premium',
          stripe_customer_id: session.customer as string,
        })
        .eq('id', session.client_reference_id);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'free' })
      .eq('stripe_customer_id', subscription.customer as string);
  }

  return new NextResponse('Webhook received', { status: 200 });
}
