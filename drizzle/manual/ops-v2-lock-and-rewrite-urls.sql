-- Ops: V2 surface lock + relative upload URLs.
-- Run once on production Postgres AFTER deploying the relative media-URL code.
-- Safe to re-run.

BEGIN;

-- 4 & 5: keep booking / RSVP / PWA / app promo OFF
UPDATE site_settings
SET
  booking_enabled = false,
  event_rsvp_enabled = false,
  pwa_install_enabled = false,
  app_promo_enabled = false;

-- 2: strip absolute hosts from local upload URLs
UPDATE media_assets
SET
  url = regexp_replace(url, '^https?://[^/]+', ''),
  thumbnail_url = CASE
    WHEN thumbnail_url IS NULL THEN NULL
    ELSE regexp_replace(thumbnail_url, '^https?://[^/]+', '')
  END
WHERE url ~ '^https?://.*/uploads/'
   OR thumbnail_url ~ '^https?://.*/uploads/';

UPDATE gallery_items
SET
  url = regexp_replace(url, '^https?://[^/]+', ''),
  thumbnail_url = CASE
    WHEN thumbnail_url IS NULL THEN NULL
    ELSE regexp_replace(thumbnail_url, '^https?://[^/]+', '')
  END
WHERE url ~ '^https?://.*/uploads/'
   OR thumbnail_url ~ '^https?://.*/uploads/';

UPDATE gallery_albums
SET cover_image = regexp_replace(cover_image, '^https?://[^/]+', '')
WHERE cover_image ~ '^https?://.*/uploads/';

UPDATE attractions
SET image = regexp_replace(image, '^https?://[^/]+', '')
WHERE image ~ '^https?://.*/uploads/';

UPDATE announcements
SET cover_image = regexp_replace(cover_image, '^https?://[^/]+', '')
WHERE cover_image ~ '^https?://.*/uploads/';

UPDATE guides
SET photo = regexp_replace(photo, '^https?://[^/]+', '')
WHERE photo ~ '^https?://.*/uploads/';

UPDATE partners
SET image = regexp_replace(image, '^https?://[^/]+', '')
WHERE image ~ '^https?://.*/uploads/';

UPDATE pages
SET hero_image = regexp_replace(hero_image, '^https?://[^/]+', '')
WHERE hero_image ~ '^https?://.*/uploads/';

UPDATE hero_content
SET background_image = regexp_replace(background_image, '^https?://[^/]+', '')
WHERE background_image ~ '^https?://.*/uploads/';

UPDATE site_settings
SET default_og_image = regexp_replace(default_og_image, '^https?://[^/]+', '')
WHERE default_og_image ~ '^https?://.*/uploads/';

COMMIT;
