import { Link } from "@tanstack/react-router";
import { ClientOnly } from "@/components/admin/ClientOnly";
import { HararMap } from "@/components/map/HararMap";
import type { MapPlaceDto } from "@/lib/map-places-fns";
import { HARAR_MAP_DEFAULT_ZOOM } from "@/lib/map-place-styles";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
};

/** Small embedded map for contact / bureau location. */
export function ContactMapEmbed({ lat, lng, title, className }: Props) {
  const place: MapPlaceDto = {
    id: "bureau",
    title: title ?? "Tourism Commission",
    place_type: "bureau",
    lat,
    lng,
    address: null,
    phone: null,
    website: null,
    short_desc: null,
    image: null,
    linked_attraction_id: null,
    linked_attraction_slug: null,
    is_featured: true,
    is_published: true,
    sort_order: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  return (
    <div className={className ?? "mt-6 h-56 rounded-lg overflow-hidden border border-border"}>
      <ClientOnly fallback={<Skeleton className="h-full w-full" />}>
        <HararMap
          places={[place]}
          selectedId="bureau"
          interactive
          showNavigation={false}
          initialZoom={HARAR_MAP_DEFAULT_ZOOM + 1}
          className="h-full w-full"
        />
      </ClientOnly>
      <Link
        to="/map"
        search={{ filter: "essentials" }}
        className="block text-center text-xs font-semibold text-brand hover:text-gold py-2 bg-surface border-t border-border"
      >
        Open full map →
      </Link>
    </div>
  );
}
