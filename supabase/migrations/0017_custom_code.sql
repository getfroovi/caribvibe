CREATE TABLE IF NOT EXISTS public.custom_code (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  header_code text DEFAULT '',
  footer_code text DEFAULT '',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.custom_code ENABLE ROW LEVEL SECURITY;

-- Setup Policies
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

-- Insert default row if the table is empty
INSERT INTO public.custom_code (header_code, footer_code)
SELECT '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.custom_code);
