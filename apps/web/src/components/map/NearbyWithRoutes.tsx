"use client";

import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Footprints, Loader2 } from "lucide-react";
import type { AttractionDto } from "@/lib/attraction-map";
import { formatDistanceKm } from "@/lib/geo";
import {
  formatWalkDistance,
  formatWalkDuration,
  getWalkingRoute,
  type WalkingRoute,
} from "@/lib/routing-fns";
import { ClientOnly } from "@/components/admin/ClientOnly";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import {
  LazyAttractionRoutesMap,
  MapSuspense,
} from "@/components/map/lazy-maps";

type NearbyItem = AttractionDto & { distance_km: number };

type NearbyWithRoutesProps = {
  origin: { lat: number; lng: number; title: string };
  nearby: NearbyItem[];
};

export function NearbyWithRoutes({ origin, nearby }: NearbyWithRoutesProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [route, setRoute] = useState<WalkingRoute | null>(null);

  const routeMutation = useMutation({
    mutationFn: async (target: NearbyItem) => {
      const result = await getWalkingRoute({
        data: {
          from_lat: origin.lat,
          from_lng: origin.lng,
          to_lat: target.latitude!,
          to_lng: target.longitude!,
        },
      });
      return { target, result };
    },
    onSuccess: ({ target, result }) => {
      setActiveId(target.id);
      setRoute(result);
    },
  });

  const nearbyPoints = nearby.map((n) => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    lat: n.latitude!,
    lng: n.longitude!,
  }));

  const activeNearby = nearby.find((n) => n.id === activeId);

  return (
    <section className="mt-10 pt-8 border-t border-border">
      <h2 className="font-serif text-2xl font-bold">Nearby Attractions</h2>
      <p className="text-sm text-ink-muted mt-1">
        Select an attraction to see a walking route from here.
      </p>

      <div className="mt-4">
        <ClientOnly fallback={<MapSkeleton className="h-[320px]" />}>
          <MapSuspense className="h-[320px]">
            <LazyAttractionRoutesMap
              lat={origin.lat}
              lng={origin.lng}
              nearby={nearbyPoints}
              activeNearbyId={activeId}
              route={route}
              className="h-[320px]"
            />
          </MapSuspense>
        </ClientOnly>
      </div>

      {route && activeNearby ? (
        <p className="mt-2 text-xs text-ink-muted">
          Walking to <strong>{activeNearby.title}</strong>:{" "}
          {formatWalkDistance(route.distance_m)} · {formatWalkDuration(route.duration_s)}
        </p>
      ) : null}

      <ul className="mt-4 space-y-2">
        {nearby.map((n) => {
          const isActive = activeId === n.id;
          const isLoading = routeMutation.isPending && routeMutation.variables?.id === n.id;
          return (
            <li key={n.id} className="flex gap-2">
              <button
                type="button"
                disabled={routeMutation.isPending}
                onClick={() => routeMutation.mutate(n)}
                aria-pressed={isActive}
                className={`flex-1 flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "border-brand bg-brand/5"
                    : "border-border hover:border-brand/40 hover:bg-surface"
                }`}
              >
                <span className="font-medium text-sm">{n.title}</span>
                <span className="text-xs text-ink-muted shrink-0 flex items-center gap-1">
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Footprints className="w-3.5 h-3.5" aria-hidden />
                  )}
                  {formatDistanceKm(n.distance_km)}
                </span>
              </button>
              <Link
                to="/attractions/$slug"
                params={{ slug: n.slug }}
                className="shrink-0 px-3 py-3 rounded-md border border-border text-xs font-semibold hover:bg-surface transition-colors grid place-items-center"
              >
                View
              </Link>
            </li>
          );
        })}
      </ul>

      {routeMutation.isError ? (
        <p className="mt-2 text-xs text-red-600">
          Could not load walking route. Try again or use Google Maps directions.
        </p>
      ) : null}
    </section>
  );
}
