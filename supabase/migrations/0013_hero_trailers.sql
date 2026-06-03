-- Add trailer support to hero slides
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS is_trailer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trailer_url text;
