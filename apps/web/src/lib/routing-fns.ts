import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createError } from "@/lib/errors";

export type WalkingRoute = {
  distance_m: number;
  duration_s: number;
  /** [lat, lng] pairs for Leaflet Polyline */
  path: Array<[number, number]>;
};

const routeInputSchema = z.object({
  from_lat: z.number().min(-90).max(90),
  from_lng: z.number().min(-180).max(180),
  to_lat: z.number().min(-90).max(90),
  to_lng: z.number().min(-180).max(180),
});

export const getWalkingRoute = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => routeInputSchema.parse(raw))
  .handler(async ({ data }): Promise<WalkingRoute | null> => {
    const coords = `${data.from_lng},${data.from_lat};${data.to_lng},${data.to_lat}`;
    const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      routes?: Array<{
        distance: number;
        duration: number;
        geometry?: { coordinates?: Array<[number, number]> };
      }>;
    };

    const route = json.routes?.[0];
    if (!route?.geometry?.coordinates?.length) return null;

    return {
      distance_m: route.distance,
      duration_s: route.duration,
      path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    };
  });

export function formatWalkDuration(seconds: number): string {
  if (seconds < 60) return "< 1 min walk";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min walk`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m walk` : `${h}h walk`;
}

export function formatWalkDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
