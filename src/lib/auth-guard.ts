import { redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-session";
import type { UserRole } from "@/lib/types";

/** Auth pages live under /admin layout but must not trigger requireAuth (redirect loop). */
export const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
] as const;

export function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PATHS.includes(
    pathname as (typeof PUBLIC_ADMIN_PATHS)[number],
  );
}

const EDITOR_BLOCKED_PREFIXES = [
  "/admin/users",
  "/admin/settings",
  "/admin/audit",
] as const;

const EDITOR_ALLOWED_PREFIXES = [
  "/admin",
  "/admin/hero",
  "/admin/attractions",
  "/admin/map-places",
  "/admin/gallery",
  "/admin/pages",
  "/admin/announcements",
  "/admin/guides",
  "/admin/contact",
  "/admin/bookings",
  "/admin/media",
] as const;

function isEditorPathAllowed(pathname: string) {
  if (
    EDITOR_BLOCKED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  ) {
    return false;
  }
  if (pathname === "/admin" || pathname === "/admin/") return true;
  return EDITOR_ALLOWED_PREFIXES.some(
    (p) => p !== "/admin" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

export async function requireAuth(
  pathname: string,
  options?: { roles?: UserRole[] },
) {
  const session = await getSession();
  if (!session?.user) {
    throw redirect({ to: "/admin/login" });
  }

  if (options?.roles && !options.roles.includes(session.user.role)) {
    throw redirect({ to: "/admin", search: { denied: true } });
  }

  if (session.user.role === "editor" && !isEditorPathAllowed(pathname)) {
    throw redirect({ to: "/admin", search: { denied: true } });
  }

  return session;
}

export function redirectIfAuthenticated() {
  return async () => {
    const session = await getSession();
    if (session?.user) {
      throw redirect({ to: "/admin" });
    }
  };
}
