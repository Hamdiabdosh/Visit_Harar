export const MAP_PLACE_TYPES = [
  "museum",
  "hotel",
  "restaurant",
  "gate",
  "market",
  "bureau",
  "atm",
  "toilet",
  "parking",
  "viewpoint",
  "attraction",
  "other",
] as const;

export type MapPlaceType = (typeof MAP_PLACE_TYPES)[number];

export const MAP_PLACE_TYPE_LABELS: Record<MapPlaceType, string> = {
  museum: "Museums",
  hotel: "Hotels",
  restaurant: "Food & Drink",
  gate: "City Gates",
  market: "Markets",
  bureau: "Tourism Commission",
  atm: "ATMs",
  toilet: "Restrooms",
  parking: "Parking",
  viewpoint: "Viewpoints",
  attraction: "Attractions",
  other: "Other",
};

export const MAP_FILTER_GROUPS: {
  id: string;
  label: string;
  types: MapPlaceType[];
}[] = [
  { id: "all", label: "All", types: [...MAP_PLACE_TYPES] },
  {
    id: "essentials",
    label: "Essentials",
    types: ["bureau", "atm", "toilet", "parking"],
  },
  {
    id: "stay",
    label: "Stay & Eat",
    types: ["hotel", "restaurant"],
  },
  {
    id: "culture",
    label: "Culture",
    types: ["museum", "attraction", "viewpoint", "gate", "market"],
  },
];

export const mapPlaceTypeColor: Record<MapPlaceType, string> = {
  museum: "#7c3aed",
  hotel: "#2563eb",
  restaurant: "#ea580c",
  gate: "#b45309",
  market: "#0d9488",
  bureau: "#059669",
  atm: "#64748b",
  toilet: "#64748b",
  parking: "#64748b",
  viewpoint: "#db2777",
  attraction: "#16a34a",
  other: "#475569",
};

export function isMapPlaceType(v: string): v is MapPlaceType {
  return MAP_PLACE_TYPES.includes(v as MapPlaceType);
}

export function mapPlaceTypeLabel(type: MapPlaceType): string {
  return MAP_PLACE_TYPE_LABELS[type];
}

/** Harar Jugol — default map center */
export const HARAR_MAP_CENTER = {
  lat: 9.3125,
  lng: 42.1255,
} as const;

export const HARAR_MAP_DEFAULT_ZOOM = 15;
