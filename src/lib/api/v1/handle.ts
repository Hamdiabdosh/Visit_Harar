import { isPublicPageKey } from "@visit-harar/shared";
import { getAnnouncements, getAnnouncementBySlug } from "@/lib/announcements-fns";
import {
  getAttractionBySlug,
  getAttractions,
} from "@/lib/attractions-fns";
import { createBooking, getBookingByRef } from "@/lib/bookings-fns";
import { sendChatMessage, getChatEnabled } from "@/lib/chat-fns";
import { getPublishedContactInfo } from "@/lib/contact-fns";
import {
  getPublishedAlbumItems,
  getPublishedAlbums,
} from "@/lib/gallery-fns";
import { getGuideBySlug, getGuides } from "@/lib/guides-fns";
import { getPublishedHero } from "@/lib/hero-fns";
import { submitInquiry } from "@/lib/inquiry-fns";
import {
  getItineraryBySlug,
  getItineraries,
} from "@/lib/itineraries-fns";
import { getPartners } from "@/lib/partners-fns";
import { getPublishedPage } from "@/lib/pages-fns";
import { searchPublished } from "@/lib/search-fns";
import { createError } from "@/lib/errors";
import {
  CACHE_PUBLIC_LONG,
  CACHE_PUBLIC_SHORT,
  jsonError,
  jsonFromError,
  jsonOk,
  readJsonBody,
} from "@/lib/api/http";
import { checkRateLimit, clientIp } from "@/lib/api/rate-limit";

const ENDPOINTS = [
  "GET  /api/v1",
  "GET  /api/v1/attractions",
  "GET  /api/v1/attractions/:slug",
  "GET  /api/v1/guides",
  "GET  /api/v1/guides/:slug",
  "GET  /api/v1/gallery/albums",
  "GET  /api/v1/gallery/albums/:id",
  "GET  /api/v1/announcements",
  "GET  /api/v1/announcements/:slug",
  "GET  /api/v1/pages/:key",
  "GET  /api/v1/contact",
  "GET  /api/v1/hero",
  "GET  /api/v1/map/pois",
  "GET  /api/v1/partners",
  "GET  /api/v1/itineraries",
  "GET  /api/v1/itineraries/:slug",
  "GET  /api/v1/search?q=",
  "GET  /api/v1/chat/enabled",
  "POST /api/v1/bookings",
  "POST /api/v1/bookings/status",
  "POST /api/v1/inquiries",
  "POST /api/v1/chat",
] as const;

function segments(path: string): string[] {
  return path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
}

export async function handleV1Request(
  request: Request,
  splat: string,
  method: string,
): Promise<Response> {
  try {
    const parts = segments(splat);
    const url = new URL(request.url);

    if (method === "GET" && parts.length === 0) {
      return jsonOk(
        {
          name: "Visit Harar Public API",
          version: "v1",
          documentation: "/docs/09-api-v1.md",
          endpoints: ENDPOINTS,
        },
        { cache: CACHE_PUBLIC_LONG },
      );
    }

    if (method === "GET" && parts[0] === "attractions") {
      if (parts.length === 1) {
        const data = await getAttractions({ data: { published: true } });
        return jsonOk(data, { cache: CACHE_PUBLIC_SHORT });
      }
      if (parts.length === 2) {
        const item = await getAttractionBySlug({ data: parts[1]! });
        if (!item) return jsonError("NOT_FOUND", "Attraction not found", 404);
        return jsonOk(item, { cache: CACHE_PUBLIC_SHORT });
      }
    }

    if (method === "GET" && parts[0] === "guides") {
      if (parts.length === 1) {
        const data = await getGuides({ data: { published: true } });
        return jsonOk(data, { cache: CACHE_PUBLIC_SHORT });
      }
      if (parts.length === 2) {
        const item = await getGuideBySlug({ data: parts[1]! });
        if (!item) return jsonError("NOT_FOUND", "Guide not found", 404);
        return jsonOk(item, { cache: CACHE_PUBLIC_SHORT });
      }
    }

    if (method === "GET" && parts[0] === "gallery" && parts[1] === "albums") {
      if (parts.length === 2) {
        const data = await getPublishedAlbums();
        return jsonOk(data, { cache: CACHE_PUBLIC_SHORT });
      }
      if (parts.length === 3) {
        const data = await getPublishedAlbumItems({ data: parts[2]! });
        if (!data) return jsonError("NOT_FOUND", "Album not found", 404);
        return jsonOk(data, { cache: CACHE_PUBLIC_SHORT });
      }
    }

    if (method === "GET" && parts[0] === "announcements") {
      if (parts.length === 1) {
        const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
        const perPage = Math.min(
          50,
          Math.max(1, Number(url.searchParams.get("per_page") ?? 20)),
        );
        const type = url.searchParams.get("type") ?? undefined;
        const result = await getAnnouncements({
          data: {
            publishedOnly: true,
            page,
            perPage,
            type: type as "News" | "Event" | "Notice" | undefined,
          },
        });
        return jsonOk(result, { cache: CACHE_PUBLIC_SHORT });
      }
      if (parts.length === 2) {
        const item = await getAnnouncementBySlug({ data: parts[1]! });
        if (!item) return jsonError("NOT_FOUND", "Announcement not found", 404);
        return jsonOk(item, { cache: CACHE_PUBLIC_SHORT });
      }
    }

    if (method === "GET" && parts[0] === "pages" && parts.length === 2) {
      const key = parts[1]!;
      if (!isPublicPageKey(key)) {
        return jsonError("NOT_FOUND", "Unknown page key", 404);
      }
      const page = await getPublishedPage({ data: key });
      if (!page) return jsonError("NOT_FOUND", "Page not published", 404);
      return jsonOk(page, { cache: CACHE_PUBLIC_SHORT });
    }

    if (method === "GET" && parts[0] === "contact" && parts.length === 1) {
      const contact = await getPublishedContactInfo();
      if (!contact) return jsonError("NOT_FOUND", "Contact not published", 404);
      return jsonOk(contact, { cache: CACHE_PUBLIC_SHORT });
    }

    if (method === "GET" && parts[0] === "hero" && parts.length === 1) {
      const hero = await getPublishedHero();
      if (!hero) return jsonError("NOT_FOUND", "Hero not published", 404);
      return jsonOk(hero, { cache: CACHE_PUBLIC_SHORT });
    }

    if (method === "GET" && parts[0] === "map" && parts[1] === "pois") {
      const pois = await getAttractions({
        data: { published: true, withCoordinates: true },
      });
      return jsonOk(
        pois.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          category: a.category,
          short_desc: a.short_desc,
          image: a.image,
          latitude: a.latitude,
          longitude: a.longitude,
          is_featured: a.is_featured,
        })),
        { cache: CACHE_PUBLIC_SHORT },
      );
    }

    if (method === "GET" && parts[0] === "partners" && parts.length === 1) {
      const category = url.searchParams.get("category") ?? undefined;
      const data = await getPartners({
        data: { published: true, category },
      });
      return jsonOk(data, { cache: CACHE_PUBLIC_SHORT });
    }

    if (method === "GET" && parts[0] === "itineraries") {
      if (parts.length === 1) {
        const data = await getItineraries({ data: { published: true } });
        return jsonOk(data, { cache: CACHE_PUBLIC_SHORT });
      }
      if (parts.length === 2) {
        const item = await getItineraryBySlug({ data: parts[1]! });
        if (!item) return jsonError("NOT_FOUND", "Itinerary not found", 404);
        return jsonOk(item, { cache: CACHE_PUBLIC_SHORT });
      }
    }

    if (method === "GET" && parts[0] === "search" && parts.length === 1) {
      const q = url.searchParams.get("q")?.trim() ?? "";
      if (q.length < 2) {
        return jsonError(
          "VALIDATION_ERROR",
          "Query parameter q must be at least 2 characters",
          422,
        );
      }
      const limit = Math.min(
        30,
        Math.max(1, Number(url.searchParams.get("limit") ?? 15)),
      );
      const result = await searchPublished({ data: { q, limit } });
      return jsonOk(result, { cache: CACHE_PUBLIC_SHORT });
    }

    if (method === "GET" && parts[0] === "chat" && parts[1] === "enabled") {
      const data = await getChatEnabled();
      return jsonOk(data, { cache: CACHE_PUBLIC_SHORT });
    }

    if (method === "POST" && parts[0] === "bookings") {
      const ip = clientIp(request);
      if (parts.length === 1) {
        checkRateLimit(`bookings:${ip}`, 10, 60_000);
        const body = await readJsonBody(request);
        const result = await createBooking({ data: body });
        return jsonOk(result);
      }
      if (parts.length === 2 && parts[1] === "status") {
        checkRateLimit(`booking-status:${ip}`, 20, 60_000);
        const body = await readJsonBody(request);
        const result = await getBookingByRef({ data: body });
        if (!result) return jsonError("NOT_FOUND", "Booking not found", 404);
        return jsonOk(result);
      }
    }

    if (method === "POST" && parts[0] === "inquiries" && parts.length === 1) {
      checkRateLimit(`inquiries:${clientIp(request)}`, 5, 60_000);
      const body = await readJsonBody(request);
      await submitInquiry({ data: body });
      return jsonOk({ ok: true });
    }

    if (method === "POST" && parts[0] === "chat" && parts.length === 1) {
      checkRateLimit(`chat:${clientIp(request)}`, 20, 60_000);
      const body = await readJsonBody(request);
      const result = await sendChatMessage({ data: body });
      return jsonOk(result);
    }

    throw createError("NOT_FOUND", "Unknown API route", 404);
  } catch (err) {
    return jsonFromError(err);
  }
}
