CREATE TABLE IF NOT EXISTS public.magazine_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled boolean NOT NULL DEFAULT false,
  embed_url text DEFAULT '',
  embed_code text DEFAULT '',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.magazine_settings ENABLE ROW LEVEL SECURITY;

-- Setup Policies
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

-- Insert default row if the table is empty
INSERT INTO public.magazine_settings (is_enabled, embed_url, embed_code)
SELECT false, '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.magazine_settings);
