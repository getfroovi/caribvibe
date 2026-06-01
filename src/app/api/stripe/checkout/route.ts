import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
    
    // Fallback if the user hasn't put their real test secret in .env.local yet
    if (stripeKey === 'sk_test_mock') {
      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${origin}/feed?success=true`, { status: 303 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16' as any,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'VIP TV Subscription',
              description: 'Unlock all premium ad-free content.',
            },
            unit_amount: 999, // $9.99/month
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/feed?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/feed?canceled=true`,
    });

    if (session.url) {
      return NextResponse.redirect(session.url, { status: 303 });
    }
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
