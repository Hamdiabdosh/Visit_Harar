import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { count, desc, eq, gte } from "drizzle-orm";
import { db } from "../../db/index";
import {
  announcements,
  attractions,
  bookings,
  guides,
  inquiries,
  itineraries,
  partners,
  siteSettings,
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

export type AdminAnalytics = {
  analytics_id: string | null;
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    last_30_days: number;
  };
  inquiries: {
    total: number;
    unread: number;
    last_30_days: number;
  };
  content: {
    published_attractions: number;
    published_guides: number;
    published_announcements: number;
    published_partners: number;
    published_itineraries: number;
  };
  top_guides: { name: string; slug: string; bookings: number }[];
  recent_bookings: {
    reference: string;
    visitor_name: string;
    status: string;
    created_at: Date;
  }[];
};

export const getAdminAnalytics = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminAnalytics> => {
    try {
      await requireEditorSession();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        [settings],
        [totalBookings],
        [pendingBookings],
        [confirmedBookings],
        [cancelledBookings],
        [recentBookingsCount],
        [totalInquiries],
        [unreadInquiries],
        [recentInquiriesCount],
        [pubAttractions],
        [pubGuides],
        [pubAnnouncements],
        [pubPartners],
        [pubItineraries],
        topGuideRows,
        recentBookingRows,
      ] = await Promise.all([
        db.select().from(siteSettings).limit(1),
        db.select({ n: count() }).from(bookings),
        db
          .select({ n: count() })
          .from(bookings)
          .where(eq(bookings.status, "Pending")),
        db
          .select({ n: count() })
          .from(bookings)
          .where(eq(bookings.status, "Confirmed")),
        db
          .select({ n: count() })
          .from(bookings)
          .where(eq(bookings.status, "Cancelled")),
        db
          .select({ n: count() })
          .from(bookings)
          .where(gte(bookings.createdAt, thirtyDaysAgo)),
        db.select({ n: count() }).from(inquiries),
        db
          .select({ n: count() })
          .from(inquiries)
          .where(eq(inquiries.isRead, false)),
        db
          .select({ n: count() })
          .from(inquiries)
          .where(gte(inquiries.createdAt, thirtyDaysAgo)),
        db
          .select({ n: count() })
          .from(attractions)
          .where(eq(attractions.isPublished, true)),
        db
          .select({ n: count() })
          .from(guides)
          .where(eq(guides.isPublished, true)),
        db
          .select({ n: count() })
          .from(announcements)
          .where(eq(announcements.isPublished, true)),
        db
          .select({ n: count() })
          .from(partners)
          .where(eq(partners.isPublished, true)),
        db
          .select({ n: count() })
          .from(itineraries)
          .where(eq(itineraries.isPublished, true)),
        db
          .select({
            name: guides.name,
            slug: guides.slug,
            bookings: count(bookings.id),
          })
          .from(guides)
          .leftJoin(bookings, eq(bookings.guideId, guides.id))
          .where(eq(guides.isPublished, true))
          .groupBy(guides.id, guides.name, guides.slug)
          .orderBy(desc(count(bookings.id)))
          .limit(5),
        db
          .select({
            reference: bookings.bookingRef,
            visitor_name: bookings.visitorName,
            status: bookings.status,
            created_at: bookings.createdAt,
          })
          .from(bookings)
          .orderBy(desc(bookings.createdAt))
          .limit(8),
      ]);

      return {
        analytics_id: settings?.analyticsId ?? null,
        bookings: {
          total: Number(totalBookings?.n ?? 0),
          pending: Number(pendingBookings?.n ?? 0),
          confirmed: Number(confirmedBookings?.n ?? 0),
          cancelled: Number(cancelledBookings?.n ?? 0),
          last_30_days: Number(recentBookingsCount?.n ?? 0),
        },
        inquiries: {
          total: Number(totalInquiries?.n ?? 0),
          unread: Number(unreadInquiries?.n ?? 0),
          last_30_days: Number(recentInquiriesCount?.n ?? 0),
        },
        content: {
          published_attractions: Number(pubAttractions?.n ?? 0),
          published_guides: Number(pubGuides?.n ?? 0),
          published_announcements: Number(pubAnnouncements?.n ?? 0),
          published_partners: Number(pubPartners?.n ?? 0),
          published_itineraries: Number(pubItineraries?.n ?? 0),
        },
        top_guides: topGuideRows.map((g) => ({
          name: g.name,
          slug: g.slug,
          bookings: Number(g.bookings),
        })),
        recent_bookings: recentBookingRows.map((b) => ({
          reference: b.reference,
          visitor_name: b.visitor_name,
          status: b.status,
          created_at: b.created_at,
        })),
      };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to load analytics",
      );
    }
  },
);
