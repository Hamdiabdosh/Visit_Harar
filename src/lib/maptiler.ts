/** MapTiler key for client-side map tiles (public, domain-restricted in MapTiler dashboard). */
export function getMapTilerKey(): string {
  return import.meta.env.VITE_MAPTILER_API_KEY?.trim() ?? "";
}

export function getMapTilerStyleUrl(style = "streets-v2"): string {
  const key = getMapTilerKey();
  if (!key) return "";
  return `https://api.maptiler.com/maps/${style}/style.json?key=${key}`;
}

export function hasMapTilerKey(): boolean {
  return getMapTilerKey().length > 0;
}

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function appleMapsDirectionsUrl(lat: number, lng: number, label?: string) {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://maps.apple.com/?daddr=${lat},${lng}&q=${q}`;
}
