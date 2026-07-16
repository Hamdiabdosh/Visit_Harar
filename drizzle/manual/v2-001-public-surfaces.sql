-- V2-001 public surfaces (L-005). Safe to re-run for ADD COLUMN.
-- Public booking / event RSVP / PWA install / app promo flags.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS event_rsvp_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS pwa_install_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS app_promo_enabled boolean NOT NULL DEFAULT false;

-- One-time: force V2 surface lock (booking / RSVP / PWA / app promo OFF).
-- Prefer Admin → Settings, or run ops-v2-lock-and-rewrite-urls.sql which includes this.

UPDATE site_settings
SET booking_enabled = false,
    event_rsvp_enabled = false,
    pwa_install_enabled = false,
    app_promo_enabled = false;