ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS etsy_url text,
ADD COLUMN IF NOT EXISTS is_etsy_enabled boolean NOT NULL DEFAULT false;
