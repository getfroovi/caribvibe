CREATE TABLE hero_slides (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  series_id uuid REFERENCES series(id) ON DELETE SET NULL,
  link_url text,
  button_text text DEFAULT 'Play',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public hero_slides are viewable by everyone."
  ON hero_slides FOR SELECT
  USING (true);

-- Allow admins to manage slides
CREATE POLICY "Admins can manage hero_slides"
  ON hero_slides FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Insert some default slides if empty
INSERT INTO hero_slides (title, description, image_url, button_text, order_index, link_url)
VALUES (
  'Island Whispers',
  'When a mysterious traveler arrives at the most exclusive resort in the Caribbean, secrets begin to wash ashore.',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop',
  'Watch Trailer',
  0,
  '/feed'
),
(
  'Carnival Nights',
  'Experience the heat, the passion, and the rhythm of the biggest street party in the world.',
  'https://images.unsplash.com/photo-1533174000255-120eb5003b41?q=80&w=2000&auto=format&fit=crop',
  'Explore More',
  1,
  '/magazine'
);
