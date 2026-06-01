CREATE TABLE vip_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  modal_title text NOT NULL DEFAULT 'Unlock Full Video',
  modal_description text NOT NULL DEFAULT 'You''ve reached the end of the free preview. Subscribe to watch the rest of this video and access our entire premium catalog.',
  benefits text[] NOT NULL DEFAULT ARRAY['Unlimited access to all premium videos', 'Ad-free viewing experience', 'Support your favorite creators'],
  page_title text NOT NULL DEFAULT 'Become a VIP Member',
  page_description text NOT NULL DEFAULT 'Get the ultimate theGriot.io experience. Gain unlimited access to premium exclusive content, ad-free viewing, and support local creators.',
  pricing_text text NOT NULL DEFAULT '$9.99/month',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE vip_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public profiles are viewable by everyone."
  ON vip_settings FOR SELECT
  USING (true);

-- Allow admin updates (assuming admins can modify, for simplicity allow authenticated for now, but usually requires role check)
-- Since we do role checks in the application layer or using a trigger, we can allow authenticated users to update or restrict strictly:
CREATE POLICY "Admins can update vip_settings"
  ON vip_settings FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can insert vip_settings"
  ON vip_settings FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Insert a default row
INSERT INTO vip_settings (modal_title, modal_description, benefits, page_title, page_description, pricing_text)
VALUES (
  'Unlock Full Video',
  'You''ve reached the end of the free preview. Subscribe to watch the rest of this video and access our entire premium catalog.',
  ARRAY['Unlimited access to all premium videos', 'Ad-free viewing experience', 'Support your favorite creators'],
  'Become a VIP Member',
  'Get the ultimate theGriot.io experience. Gain unlimited access to premium exclusive content, ad-free viewing, and support local creators.',
  '$9.99/month'
);
