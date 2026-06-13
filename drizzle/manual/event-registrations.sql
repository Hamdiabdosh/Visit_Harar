-- Event registration schema (run via `bun run db:push` or apply manually)

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS registration_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_capacity integer,
  ADD COLUMN IF NOT EXISTS registration_deadline date,
  ADD COLUMN IF NOT EXISTS registration_note text,
  ADD COLUMN IF NOT EXISTS registration_auto_confirm boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_ref text NOT NULL UNIQUE,
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE RESTRICT,
  visitor_name text NOT NULL,
  visitor_email text NOT NULL,
  visitor_phone text,
  visitor_country text NOT NULL,
  party_size integer NOT NULL,
  special_requests text,
  status text NOT NULL DEFAULT 'Pending',
  status_note text,
  qr_token text NOT NULL UNIQUE,
  notified_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_by text REFERENCES "user"(id),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_registrations_announcement_id_idx
  ON event_registrations (announcement_id);

CREATE INDEX IF NOT EXISTS event_registrations_status_idx
  ON event_registrations (status);
