-- Visit Harar performance indexes (run after migrations)

-- Auth user
CREATE INDEX IF NOT EXISTS idx_user_is_active ON "user" (is_active);

-- Attractions
CREATE INDEX IF NOT EXISTS idx_attractions_published_sort ON attractions (is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_attractions_featured_published ON attractions (is_featured, is_published);
CREATE INDEX IF NOT EXISTS idx_attractions_category ON attractions (category);

-- Gallery
CREATE INDEX IF NOT EXISTS idx_gallery_albums_published_sort ON gallery_albums (is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_items_album ON gallery_items (album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_published_sort ON gallery_items (is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_items_type ON gallery_items (type);

-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements (is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements (type);

-- Guides
CREATE INDEX IF NOT EXISTS idx_guides_published_sort ON guides (is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_guides_available ON guides (is_available);
CREATE INDEX IF NOT EXISTS idx_guides_languages_gin ON guides USING GIN (languages);
CREATE INDEX IF NOT EXISTS idx_guides_specialties_gin ON guides USING GIN (specialties);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_guide ON bookings (guide_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_visitor_email ON bookings (visitor_email);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_date ON bookings (tour_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);

-- Media
CREATE INDEX IF NOT EXISTS idx_media_type ON media_assets (type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media_assets (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_used_in_gin ON media_assets USING GIN (used_in);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs (module);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs (created_at DESC);
