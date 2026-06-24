ALTER TABLE public.custom_code 
ADD COLUMN IF NOT EXISTS body_top_code text DEFAULT '';
