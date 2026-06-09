import { Link } from "@tanstack/react-router";
import type { AnnouncementType } from "@/lib/types";
import { optimizeImage } from "@/lib/media-url";

export type AnnouncementCardData = {
  slug: string;
  title: string;
  type: AnnouncementType;
  published_at: Date | string | null;
  cover_image: string | null;
  excerpt: string;
  pinned?: boolean;
};

function formatDate(input: Date | string | null | undefined) {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AnnouncementCard({
  slug,
  title,
  type,
  published_at,
  cover_image,
  excerpt,
  pinned,
}: AnnouncementCardData) {
  const src = cover_image ? optimizeImage(cover_image, { width: 1200 }) : null;
  return (
    <Link
      to="/news/$slug"
      params={{ slug }}
      className={`rounded-lg overflow-hidden border border-border bg-white hover:shadow-md transition-shadow ${
        pinned ? "border-l-4 border-l-gold" : ""
      }`}
    >
      <div className="h-40 bg-surface relative overflow-hidden">
        {src ? (
          <img
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-gold/10 to-surface" />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand font-semibold">
            {type}
          </span>
          <span className="text-ink-muted ml-auto">
            {formatDate(published_at)}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold mt-3">{title}</h3>
        <p className="text-sm text-ink-muted mt-2 line-clamp-2">{excerpt}</p>
      </div>
    </Link>
  );
}
