/** Harar Jugol — shared by web, PWA, Expo, and Flutter clients. */

export const HARAR_CENTER = { lat: 9.3133, lng: 42.1261 } as const;

/** Tight bounds around Jugol for offline map tile prefetch. */
export const JUGOL_BOUNDS = {
  north: 9.3185,
  south: 9.308,
  east: 42.132,
  west: 42.12,
} as const;

export const DEFAULT_MAP_DELTA = {
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
} as const;
