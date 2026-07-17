/**
 * Public gate while the site is unfinished.
 * Admin (/admin/*) and static/API paths stay open.
 *
 * Launch: set VITE_PUBLIC_SITE_LIVE=true (build-time) and rebuild.
 * Do not use VITE_PUBLIC_COMING_SOON=false — Coolify had that set and it
 * baked the gate off permanently until rebuild.
 */
export function isPublicComingSoonEnabled() {
  const live = import.meta.env.VITE_PUBLIC_SITE_LIVE;
  return live !== "true" && live !== "1";
}
