-- Master Sync: Ensures all tables, columns, RLS policies, and default rows exist for Store, Magazine, and Custom Code settings.

-- 1. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled boolean NOT NULL DEFAULT false,
  store_url text DEFAULT '',
  etsy_url text DEFAULT '',
  is_etsy_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS store_url text DEFAULT '';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS etsy_url text DEFAULT '';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS is_etsy_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public store_settings are viewable by everyone" ON public.store_settings;
CREATE POLICY "Public store_settings are viewable by everyone"
  ON public.store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update store_settings" ON public.store_settings;
CREATE POLICY "Admins can update store_settings"
  ON public.store_settings FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert store_settings" ON public.store_settings;
CREATE POLICY "Admins can insert store_settings"
  ON public.store_settings FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

INSERT INTO public.store_settings (is_enabled, store_url, is_etsy_enabled, etsy_url)
SELECT false, '', false, ''
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);


-- 2. CUSTOM CODE
CREATE TABLE IF NOT EXISTS public.custom_code (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  header_code text DEFAULT '',
  body_top_code text DEFAULT '',
  footer_code text DEFAULT '',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.custom_code ADD COLUMN IF NOT EXISTS header_code text DEFAULT '';
ALTER TABLE public.custom_code ADD COLUMN IF NOT EXISTS body_top_code text DEFAULT '';
ALTER TABLE public.custom_code ADD COLUMN IF NOT EXISTS footer_code text DEFAULT '';

ALTER TABLE public.custom_code ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public custom_code is viewable by everyone" ON public.custom_code;
CREATE POLICY "Public custom_code is viewable by everyone"
  ON public.custom_code FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update custom_code" ON public.custom_code;
CREATE POLICY "Admins can update custom_code"
  ON public.custom_code FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert custom_code" ON public.custom_code;
CREATE POLICY "Admins can insert custom_code"
  ON public.custom_code FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

INSERT INTO public.custom_code (header_code, body_top_code, footer_code)
SELECT '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.custom_code);


-- 3. MAGAZINE SETTINGS
CREATE TABLE IF NOT EXISTS public.magazine_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled boolean NOT NULL DEFAULT false,
  embed_url text DEFAULT '',
  embed_code text DEFAULT '',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.magazine_settings ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.magazine_settings ADD COLUMN IF NOT EXISTS embed_url text DEFAULT '';
ALTER TABLE public.magazine_settings ADD COLUMN IF NOT EXISTS embed_code text DEFAULT '';

ALTER TABLE public.magazine_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public magazine_settings are viewable by everyone" ON public.magazine_settings;
CREATE POLICY "Public magazine_settings are viewable by everyone"
  ON public.magazine_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update magazine_settings" ON public.magazine_settings;
CREATE POLICY "Admins can update magazine_settings"
  ON public.magazine_settings FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert magazine_settings" ON public.magazine_settings;
CREATE POLICY "Admins can insert magazine_settings"
  ON public.magazine_settings FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

INSERT INTO public.magazine_settings (is_enabled, embed_url, embed_code)
SELECT false, '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.magazine_settings);
