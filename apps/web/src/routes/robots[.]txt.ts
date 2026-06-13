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
        const body = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${sitemapUrl}\n`;
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
