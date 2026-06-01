-- 1. Create Video Likes Table
CREATE TABLE public.video_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, video_id)
);

-- 2. Create Video Comments Table
CREATE TABLE public.video_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) > 0),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for video_likes
-- Anyone can view likes
CREATE POLICY "Likes are viewable by everyone."
  ON public.video_likes FOR SELECT USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Users can insert their own likes."
  ON public.video_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own likes
CREATE POLICY "Users can delete their own likes."
  ON public.video_likes FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS Policies for video_comments
-- Anyone can view comments
CREATE POLICY "Comments are viewable by everyone."
  ON public.video_comments FOR SELECT USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments."
  ON public.video_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own comments
CREATE POLICY "Users can update their own comments."
  ON public.video_comments FOR UPDATE USING (auth.uid() = user_id);

-- Authenticated users can delete their own comments
CREATE POLICY "Users can delete their own comments."
  ON public.video_comments FOR DELETE USING (auth.uid() = user_id);

-- Note: Admins can be added via a separate policy if you want them to be able to delete any comment.
CREATE POLICY "Admins can delete any comment."
  ON public.video_comments FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );
