import { createFileRoute } from "@tanstack/react-router";
import { getServerConfig } from "@/lib/config.server";

function absolute(path: string) {
  const { appUrl } = getServerConfig();
  const base = appUrl?.replace(/\/+$/, "") ?? "";
  return base ? `${base}${path}` : path;
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const sitemapUrl = absolute("/sitemap.xml");
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /book",
          "Disallow: /book/",
          "Disallow: /events/status",
          "Disallow: /events/ticket",
          "",
          `Sitemap: ${sitemapUrl}`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
