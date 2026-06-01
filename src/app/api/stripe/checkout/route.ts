import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
    
    // Fallback if the user hasn't put their real test secret in .env.local yet
    if (stripeKey === 'sk_test_mock') {
      return NextResponse.json({ url: '/feed?success=true' });
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

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
