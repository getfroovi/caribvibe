-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'free', 'premium');
CREATE TYPE post_status AS ENUM ('draft', 'published');

-- Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'free' NOT NULL,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    mux_asset_id TEXT,
    mux_playback_id TEXT,
    preview_duration_seconds INTEGER DEFAULT 30,
    is_premium BOOLEAN DEFAULT TRUE,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB,
    cover_image TEXT,
    status post_status DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    event_date TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    linked_video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own, Admins can read all.
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Videos: Everyone can read. Admins can insert/update/delete.
CREATE POLICY "Videos are viewable by everyone."
  ON videos FOR SELECT USING (true);

-- Blog Posts: Everyone can read published posts. Admins can read all and insert/update/delete.
CREATE POLICY "Published blog posts are viewable by everyone."
  ON blog_posts FOR SELECT USING (status = 'published');

-- Timeline Events: Everyone can read events for published posts. Admins manage all.
CREATE POLICY "Timeline events viewable by everyone."
  ON timeline_events FOR SELECT USING (true);
