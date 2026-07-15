-- Simple slugify function in Postgres
CREATE OR REPLACE FUNCTION slugify(value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(
      lower(value),
      '[^a-z0-9\s-]', '', 'g'
    ),
    '[-\s]+', '-', 'g'
  );
END;
$$ LANGUAGE plpgsql;

-- Slug helper for series
CREATE OR REPLACE FUNCTION get_unique_series_slug(title_val TEXT, current_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  base_slug := slugify(title_val);
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'series';
  END IF;
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM series WHERE slug = final_slug AND id <> current_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Slug helper for videos
CREATE OR REPLACE FUNCTION get_unique_videos_slug(title_val TEXT, current_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  base_slug := slugify(title_val);
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'video';
  END IF;
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM videos WHERE slug = final_slug AND id <> current_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Add slug column to series
ALTER TABLE series ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add slug column to videos
ALTER TABLE videos ADD COLUMN IF NOT EXISTS slug TEXT;

-- Populate existing rows
UPDATE series SET slug = get_unique_series_slug(title, id) WHERE slug IS NULL OR slug = '';
UPDATE videos SET slug = get_unique_videos_slug(title, id) WHERE slug IS NULL OR slug = '';

-- Alter series slug to be UNIQUE and NOT NULL
ALTER TABLE series ALTER COLUMN slug SET NOT NULL;
ALTER TABLE series ADD CONSTRAINT series_slug_unique UNIQUE (slug);

-- Alter videos slug to be UNIQUE and NOT NULL
ALTER TABLE videos ALTER COLUMN slug SET NOT NULL;
ALTER TABLE videos ADD CONSTRAINT videos_slug_unique UNIQUE (slug);

-- Triggers for series
CREATE OR REPLACE FUNCTION series_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.slug IS NULL OR NEW.slug = '' OR NEW.title <> OLD.title THEN
    NEW.slug := get_unique_series_slug(NEW.title, COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_series_slug ON series;
CREATE TRIGGER trigger_series_slug
BEFORE INSERT OR UPDATE ON series
FOR EACH ROW EXECUTE FUNCTION series_slug_trigger();

-- Triggers for videos
CREATE OR REPLACE FUNCTION videos_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.slug IS NULL OR NEW.slug = '' OR NEW.title <> OLD.title THEN
    NEW.slug := get_unique_videos_slug(NEW.title, COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_videos_slug ON videos;
CREATE TRIGGER trigger_videos_slug
BEFORE INSERT OR UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION videos_slug_trigger();
