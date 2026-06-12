import { Link } from "@tanstack/react-router";
import type { MapPlaceDto } from "@/lib/map-places-fns";
import { mapPlaceTypeLabel } from "@/lib/map-place-styles";
import {
  appleMapsDirectionsUrl,
  googleMapsDirectionsUrl,
} from "@/lib/maptiler";
import { ExternalLink, MapPin, Phone, Star } from "lucide-react";
import { optimizeImage } from "@/lib/media-url";

type Props = {
  place: MapPlaceDto;
  compact?: boolean;
  onClose?: () => void;
};

export function MapPlaceCard({ place, compact = false }: Props) {
  return (
    <article
      className={`bg-white border border-border rounded-lg overflow-hidden ${
        compact ? "" : "shadow-sm"
      }`}
    >
      {place.image ? (
        <div className="aspect-[16/9] bg-surface relative overflow-hidden">
          <img
            src={optimizeImage(place.image, { width: 600 }) ?? place.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand">
              {mapPlaceTypeLabel(place.place_type)}
            </span>
            <h3 className="font-serif font-bold text-ink mt-0.5 line-clamp-2">
              {place.title}
            </h3>
          </div>
          {place.is_featured ? (
            <Star
              className="w-4 h-4 text-gold shrink-0 fill-gold"
              aria-label="Featured"
            />
          ) : null}
        </div>
        {place.short_desc ? (
          <p className="text-sm text-ink-muted mt-2 line-clamp-3">
            {place.short_desc}
          </p>
        ) : null}
        {place.address ? (
          <p className="text-xs text-ink-muted mt-2 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
            {place.address}
          </p>
        ) : null}
        {place.phone ? (
          <a
            href={`tel:${place.phone}`}
            className="text-xs text-brand mt-2 flex items-center gap-1.5 hover:text-gold"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden />
            {place.phone}
          </a>
        ) : null}
        <div className="flex flex-wrap gap-2 mt-4">
          {place.linked_attraction_slug ? (
            <Link
              to="/attractions/$slug"
              params={{ slug: place.linked_attraction_slug }}
              className="text-xs font-semibold text-brand hover:text-gold"
            >
              View attraction →
            </Link>
          ) : null}
          <a
            href={googleMapsDirectionsUrl(place.lat, place.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-brand"
          >
            Directions <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={appleMapsDirectionsUrl(place.lat, place.lng, place.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-brand sr-only sm:not-sr-only"
          >
            Apple Maps
          </a>
        </div>
      </div>
    </article>
  );
}
