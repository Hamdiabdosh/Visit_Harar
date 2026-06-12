CREATE TABLE IF NOT EXISTS map_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  place_type text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  address text,
  phone text,
  website text,
  short_desc text,
  image text,
  linked_attraction_id uuid REFERENCES attractions(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by text REFERENCES "user"(id),
  updated_by text REFERENCES "user"(id),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS map_places_published_idx ON map_places (is_published);
CREATE INDEX IF NOT EXISTS map_places_type_idx ON map_places (place_type);
