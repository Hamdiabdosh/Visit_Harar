import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { count, eq } from "drizzle-orm";
import { db } from "../../db/index";
import {
  announcements,
  attractions,
  bookings,
  contactInfo,
  guides,
  heroContent,
  inquiries,
  pages,
} from "../../drizzle/schema/index";
import { auth } from "@/lib/auth.server";
import { createError, isAppError } from "@/lib/errors";
import type { UserRole } from "@/lib/types";

async function requireEditorSession() {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user)
    throw createError("UNAUTHORIZED", "Authentication required");
  const role = (session.user as { role?: string }).role as UserRole;
  const isActive = (session.user as { isActive?: boolean }).isActive ?? true;
  if (!isActive) throw createError("FORBIDDEN", "Account is disabled");
  if (role !== "superadmin" && role !== "editor") {
    throw createError("FORBIDDEN", "Insufficient permissions");
  }
  return { id: session.user.id };
}

export type AdminDashboardStats = {
  pending_bookings: number;
  unread_inquiries: number;
  unpublished_attractions: number;
  unpublished_guides: number;
  unpublished_announcements: number;
  unpublished_pages: number;
  hero_unpublished: boolean;
  contact_unpublished: boolean;
};

export const getAdminDashboardStats = createServerFn({
  method: "GET",
}).handler(async (): Promise<AdminDashboardStats> => {
  try {
    await requireEditorSession();

    const [
      [pendingBookings],
      [unreadInquiries],
      [unpublishedAttractions],
      [unpublishedGuides],
      [unpublishedAnnouncements],
      [unpublishedPages],
      [hero],
      [contact],
    ] = await Promise.all([
      db
        .select({ n: count() })
        .from(bookings)
        .where(eq(bookings.status, "Pending")),
      db
        .select({ n: count() })
        .from(inquiries)
        .where(eq(inquiries.isRead, false)),
      db
        .select({ n: count() })
        .from(attractions)
        .where(eq(attractions.isPublished, false)),
      db
        .select({ n: count() })
        .from(guides)
        .where(eq(guides.isPublished, false)),
      db
        .select({ n: count() })
        .from(announcements)
        .where(eq(announcements.isPublished, false)),
      db
        .select({ n: count() })
        .from(pages)
        .where(eq(pages.isPublished, false)),
      db.select().from(heroContent).limit(1),
      db.select().from(contactInfo).limit(1),
    ]);

    return {
      pending_bookings: Number(pendingBookings?.n ?? 0),
      unread_inquiries: Number(unreadInquiries?.n ?? 0),
      unpublished_attractions: Number(unpublishedAttractions?.n ?? 0),
      unpublished_guides: Number(unpublishedGuides?.n ?? 0),
      unpublished_announcements: Number(unpublishedAnnouncements?.n ?? 0),
      unpublished_pages: Number(unpublishedPages?.n ?? 0),
      hero_unpublished: hero ? !hero.isPublished : true,
      contact_unpublished: contact ? !contact.isPublished : true,
    };
  } catch (err) {
    if (isAppError(err)) throw err;
    throw createError(
      "INTERNAL",
      err instanceof Error ? err.message : "Failed to load dashboard stats",
    );
  }
});
