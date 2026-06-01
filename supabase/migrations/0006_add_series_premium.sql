-- Add is_premium to series
ALTER TABLE series ADD COLUMN is_premium BOOLEAN DEFAULT false;
