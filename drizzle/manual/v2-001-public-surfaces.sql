-- V2-001 public surfaces (L-005). Safe to re-run for ADD COLUMN.
-- Public booking / event RSVP / PWA install / app promo flags.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS event_rsvp_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS pwa_install_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS app_promo_enabled boolean NOT NULL DEFAULT false;

-- One-time (optional): align existing production with V2 product stance.
-- Uncomment and run once if booking_enabled is still true after deploy:
--
-- UPDATE site_settings
-- SET booking_enabled = false,
--     event_rsvp_enabled = false,
--     pwa_install_enabled = false,
--     app_promo_enabled = false;
--
-- Or toggle off in Admin → Settings (preferred).
