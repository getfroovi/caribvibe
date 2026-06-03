CREATE TABLE IF NOT EXISTS public.ad_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled boolean NOT NULL DEFAULT false,
  google_ad_client text,
  feed_ad_slot text,
  video_ad_slot text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Setup Policies
DROP POLICY IF EXISTS "Public ad_settings are viewable by everyone" ON public.ad_settings;
CREATE POLICY "Public ad_settings are viewable by everyone"
  ON public.ad_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update ad_settings" ON public.ad_settings;
CREATE POLICY "Admins can update ad_settings"
  ON public.ad_settings FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert ad_settings" ON public.ad_settings;
CREATE POLICY "Admins can insert ad_settings"
  ON public.ad_settings FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Insert default row if the table is empty
INSERT INTO public.ad_settings (is_enabled, google_ad_client, feed_ad_slot, video_ad_slot)
SELECT false, '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.ad_settings);
