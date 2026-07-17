/**
 * Public gate while the site is unfinished.
 * Admin (/admin/*) and static/API paths stay open.
 *
 * Launch: set VITE_PUBLIC_COMING_SOON=false and rebuild (or turn off in code).
 */
export function isPublicComingSoonEnabled() {
  const v = import.meta.env.VITE_PUBLIC_COMING_SOON;
  // Default ON so public never sees the unfinished site until you opt out.
  if (v === undefined || v === "") return true;
  return v !== "false" && v !== "0";
}
