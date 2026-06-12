import { Link } from "@tanstack/react-router";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import type { AttractionDto } from "@/lib/attraction-map";
import {
  categoryColor,
  isAttractionCategory,
} from "@/lib/attraction-styles";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import { optimizeImage } from "@/lib/media-url";

export function AttractionPopupContent({
  attraction,
}: {
  attraction: AttractionDto;
}) {
  const cat = isAttractionCategory(attraction.category)
    ? attraction.category
    : "Heritage";
  const lat = attraction.latitude;
  const lng = attraction.longitude;
  const thumb = attraction.image
    ? optimizeImage(attraction.image, { width: 320 })
    : null;

  return (
    <div className="min-w-[220px] max-w-[260px]">
      {thumb ? (
        <img
          src={thumb}
          alt=""
          className="w-full h-28 object-cover rounded-md mb-2"
        />
      ) : null}
      <span
        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColor[cat]}`}
      >
        {cat}
      </span>
      <h3 className="font-serif font-bold text-base mt-1 leading-snug">
        {attraction.title}
      </h3>
      {attraction.short_desc ? (
        <p className="text-xs text-ink-muted mt-1 line-clamp-3">
          {attraction.short_desc}
        </p>
      ) : null}
      <div className="mt-3 flex flex-col gap-1.5">
        <Link
          to="/attractions/$slug"
          params={{ slug: attraction.slug }}
          className="inline-flex items-center justify-center gap-1 rounded-md bg-brand text-white text-xs font-semibold px-3 py-2 hover:bg-brand-dark transition-colors"
        >
          View Details
        </Link>
        {lat != null && lng != null ? (
          <a
            href={googleMapsDirectionsUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-md border border-border text-xs font-semibold px-3 py-2 hover:bg-surface transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" aria-hidden />
            Get Directions
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function OfficePopupContent({
  officeName,
  addressLine1,
  addressLine2,
  country,
  lat,
  lng,
}: {
  officeName: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  country?: string | null;
  lat: number;
  lng: number;
}) {
  const address = [addressLine1, addressLine2, country].filter(Boolean).join(", ");

  return (
    <div className="min-w-[220px] max-w-[260px]">
      <div className="flex items-center gap-2 text-brand mb-1">
        <MapPin className="w-4 h-4" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          Tourism Office
        </span>
      </div>
      <h3 className="font-serif font-bold text-base leading-snug">{officeName}</h3>
      {address ? (
        <p className="text-xs text-ink-muted mt-1">{address}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-1.5">
        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-1 rounded-md bg-brand text-white text-xs font-semibold px-3 py-2 hover:bg-brand-dark transition-colors"
        >
          Contact
        </Link>
        <a
          href={googleMapsDirectionsUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-md border border-border text-xs font-semibold px-3 py-2 hover:bg-surface transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          Directions
        </a>
      </div>
    </div>
  );
}
