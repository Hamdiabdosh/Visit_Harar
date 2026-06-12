-- Add map coordinates to attractions (nullable for backward compatibility)
ALTER TABLE attractions
  ADD COLUMN IF NOT EXISTS latitude DECIMAL,
  ADD COLUMN IF NOT EXISTS longitude DECIMAL;
