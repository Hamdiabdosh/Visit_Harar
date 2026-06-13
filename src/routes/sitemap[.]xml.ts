import { createFileRoute } from "@tanstack/react-router";
import { getServerConfig } from "@/lib/config.server";
import { getAttractions } from "@/lib/attractions-fns";
import { getGuides } from "@/lib/guides-fns";
import { getAnnouncements } from "@/lib/announcements-fns";
import { getPublishedAlbums } from "@/lib/gallery-fns";
import { getItineraries } from "@/lib/itineraries-fns";

function xmlEscape(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function absolute(path: string) {
  const { appUrl } = getServerConfig();
  const base = appUrl?.replace(/\/+$/, "") ?? "";
  return base ? `${base}${path}` : path;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticRoutes = [
          "/",
          "/attractions",
          "/map",
          "/guides",
          "/gallery",
          "/about",
          "/culture",
          "/plan-your-trip",
          "/plan-your-trip/guide",
          "/itineraries",
          "/services",
          "/news",
          "/contact",
          "/book",
          "/book/status",
          "/search",
        ];

        const [attractions, guides, announcements, albums, itineraries] =
          await Promise.all([
          getAttractions({ data: { published: true } }),
          getGuides({ data: { published: true } }),
          getAnnouncements({
            data: { publishedOnly: true, page: 1, perPage: 500 },
          }),
          getPublishedAlbums(),
          getItineraries({ data: { published: true } }),
        ]);

        const urls = [
          ...staticRoutes.map((p) => absolute(p)),
          ...attractions.map((a) => absolute(`/attractions/${a.slug}`)),
          ...guides.map((g) => absolute(`/guides/${g.slug}`)),
          ...announcements.items.map((a) => absolute(`/news/${a.slug}`)),
          ...albums.map((a) => absolute(`/gallery/${a.id}`)),
          ...itineraries.map((i) => absolute(`/itineraries/${i.slug}`)),
        ];

        const body =
          `<?xml version="1.0" encoding="UTF-8"?>` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
          urls.map((u) => `<url><loc>${xmlEscape(u)}</loc></url>`).join("") +
          `</urlset>`;

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
