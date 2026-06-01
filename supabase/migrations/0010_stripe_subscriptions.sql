-- Run this snippet in your Supabase SQL Editor to support Stripe subscriptions

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add indexes for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

ALTER TABLE public.vip_settings
ADD COLUMN IF NOT EXISTS monthly_price numeric(10,2) DEFAULT 9.99;
