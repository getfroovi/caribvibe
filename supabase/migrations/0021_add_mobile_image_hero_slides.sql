-- Add mobile image support to hero slides for portrait/mobile screen layout auto-detection
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS mobile_image_url text;
