-- Add columns to videos table for external hosting and categorization
ALTER TABLE public.videos
ADD COLUMN video_url TEXT,
ADD COLUMN video_type TEXT DEFAULT 'mux' CHECK (video_type IN ('mux', 'youtube', 'vimeo', 'external')),
ADD COLUMN category TEXT DEFAULT 'Uncategorized';
