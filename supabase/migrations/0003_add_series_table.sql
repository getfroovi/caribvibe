-- Create Series Table
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'Trending Now',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Series are viewable by everyone."
  ON series FOR SELECT USING (true);

-- Add foreign key and episode number to videos
ALTER TABLE videos
ADD COLUMN series_id UUID REFERENCES series(id) ON DELETE CASCADE,
ADD COLUMN episode_number INTEGER DEFAULT 1;
