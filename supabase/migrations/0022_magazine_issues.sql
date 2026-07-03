-- Create magazine issues table for holding historical publications
CREATE TABLE IF NOT EXISTS public.magazine_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_image_url text NOT NULL,
  embed_url text DEFAULT '',
  embed_code text DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  published_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;

-- Select policy: viewable by everyone
DROP POLICY IF EXISTS "Public magazine_issues are viewable by everyone" ON public.magazine_issues;
CREATE POLICY "Public magazine_issues are viewable by everyone"
  ON public.magazine_issues FOR SELECT
  USING (true);

-- Insert policy: admins only
DROP POLICY IF EXISTS "Admins can insert magazine_issues" ON public.magazine_issues;
CREATE POLICY "Admins can insert magazine_issues"
  ON public.magazine_issues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update policy: admins only
DROP POLICY IF EXISTS "Admins can update magazine_issues" ON public.magazine_issues;
CREATE POLICY "Admins can update magazine_issues"
  ON public.magazine_issues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Delete policy: admins only
DROP POLICY IF EXISTS "Admins can delete magazine_issues" ON public.magazine_issues;
CREATE POLICY "Admins can delete magazine_issues"
  ON public.magazine_issues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Migrate current magazine embed config to the first issue if table is empty
INSERT INTO public.magazine_issues (title, description, cover_image_url, embed_url, embed_code, is_published, published_date)
SELECT 
  'Current Issue' as title, 
  'Browse the latest interactive edition.' as description, 
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600' as cover_image_url, 
  embed_url, 
  embed_code, 
  true as is_published, 
  now() as published_date
FROM public.magazine_settings
WHERE EXISTS (SELECT 1 FROM public.magazine_settings)
  AND NOT EXISTS (SELECT 1 FROM public.magazine_issues)
LIMIT 1;
