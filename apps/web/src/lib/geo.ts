/** Harar Jugol approximate center — default map viewport. */
export const HARAR_CENTER = { lat: 9.3133, lng: 42.1261 } as const;

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** Great-circle distance in kilometres (Haversine). */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type GeoPoint = { latitude: number; longitude: number };

export function hasCoordinates(
  item: { latitude?: number | null; longitude?: number | null },
): item is GeoPoint {
  return item.latitude != null && item.longitude != null;
}

export function nearestPoints<T extends GeoPoint & { id: string }>(
  origin: GeoPoint,
  items: T[],
  options?: { excludeId?: string; limit?: number },
): Array<T & { distance_km: number }> {
  const limit = options?.limit ?? 3;
  return items
    .filter(
      (item) =>
        item.id !== options?.excludeId &&
        hasCoordinates(item),
    )
    .map((item) => ({
      ...item,
      distance_km: haversineKm(
        origin.latitude,
        origin.longitude,
        item.latitude,
        item.longitude,
      ),
    }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
}
