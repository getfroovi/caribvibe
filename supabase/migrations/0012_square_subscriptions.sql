-- Run this snippet in your Supabase SQL Editor to support Square subscriptions

-- Rename Stripe columns to Square in profiles
ALTER TABLE public.profiles
RENAME COLUMN stripe_customer_id TO square_customer_id;

ALTER TABLE public.profiles
RENAME COLUMN stripe_subscription_id TO square_subscription_id;

-- Drop old Stripe index and create a new one for Square
DROP INDEX IF EXISTS idx_profiles_stripe_customer;
CREATE INDEX IF NOT EXISTS idx_profiles_square_customer ON public.profiles(square_customer_id);

-- Update VIP settings for Square Plan ID instead of dynamic pricing
ALTER TABLE public.vip_settings
DROP COLUMN IF EXISTS monthly_price;

ALTER TABLE public.vip_settings
ADD COLUMN IF NOT EXISTS square_plan_id text;
