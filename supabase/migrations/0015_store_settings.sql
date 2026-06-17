CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled boolean NOT NULL DEFAULT false,
  store_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Setup Policies
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

-- Insert default row if the table is empty
INSERT INTO public.store_settings (is_enabled, store_url)
SELECT false, ''
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);
