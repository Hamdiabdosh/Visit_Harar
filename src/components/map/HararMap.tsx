import type { MapPlaceDto } from "@/lib/map-places-fns";
import {
  HARAR_MAP_CENTER,
  HARAR_MAP_DEFAULT_ZOOM,
  mapPlaceTypeColor,
  mapPlaceTypeLabel,
  type MapPlaceType,
} from "@/lib/map-place-styles";
import { getMapTilerStyleUrl, hasMapTilerKey } from "@/lib/maptiler";
import { MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  Marker,
  NavigationControl,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  places: MapPlaceDto[];
  selectedId?: string | null;
  onSelect?: (place: MapPlaceDto | null) => void;
  interactive?: boolean;
  className?: string;
  initialZoom?: number;
  showNavigation?: boolean;
  /** Click map to pick coordinates (admin) */
  pickMode?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPick?: (lat: number, lng: number) => void;
};

function PinMarker({
  type,
  selected,
  featured,
}: {
  type: MapPlaceType;
  selected?: boolean;
  featured?: boolean;
}) {
  const color = mapPlaceTypeColor[type];
  return (
    <div
      className={`relative flex items-center justify-center transition-transform ${
        selected ? "scale-125 z-10" : "scale-100"
      }`}
      style={{ filter: selected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" : undefined }}
    >
      <svg width="28" height="36" viewBox="0 0 28 36" aria-hidden>
        <path
          d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z"
          fill={color}
          stroke={selected ? "#fbbf24" : "#fff"}
          strokeWidth={selected ? 2.5 : 1.5}
        />
        <circle cx="14" cy="14" r="5" fill="#fff" />
      </svg>
      {featured ? (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold border border-white" />
      ) : null}
    </div>
  );
}

export function HararMap({
  places,
  selectedId,
  onSelect,
  interactive = true,
  className = "h-full min-h-[320px] w-full rounded-lg overflow-hidden",
  initialZoom = HARAR_MAP_DEFAULT_ZOOM,
  showNavigation = true,
  pickMode = false,
  pickedLocation,
  onPick,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const styleUrl = getMapTilerStyleUrl();
  const [viewState, setViewState] = useState({
    longitude: HARAR_MAP_CENTER.lng,
    latitude: HARAR_MAP_CENTER.lat,
    zoom: initialZoom,
  });

  const flyTo = useCallback((lat: number, lng: number, zoom = 16) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom,
      duration: 800,
    });
  }, []);

  const handleSelect = useCallback(
    (place: MapPlaceDto) => {
      onSelect?.(place);
      flyTo(place.lat, place.lng);
    },
    [flyTo, onSelect],
  );

  const visiblePlaces = useMemo(() => places, [places]);

  useEffect(() => {
    if (!selectedId) return;
    const place = places.find((p) => p.id === selectedId);
    if (place) flyTo(place.lat, place.lng);
  }, [selectedId, places, flyTo]);

  if (!hasMapTilerKey() || !styleUrl) {
    return (
      <div
        className={`${className} bg-surface border border-border grid place-items-center text-center p-6`}
      >
        <MapPin className="w-10 h-10 text-brand mb-3" />
        <p className="text-sm font-medium text-ink">Map unavailable</p>
        <p className="text-xs text-ink-muted mt-1 max-w-xs">
          Set <code className="text-[11px]">VITE_MAPTILER_API_KEY</code> in your
          environment to enable the interactive map.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={styleUrl}
        style={{ width: "100%", height: "100%" }}
        attributionControl={interactive}
        scrollZoom={interactive}
        dragPan={interactive}
        doubleClickZoom={interactive}
        touchZoomRotate={interactive}
        onClick={
          pickMode
            ? (evt) => {
                onPick?.(evt.lngLat.lat, evt.lngLat.lng);
              }
            : () => onSelect?.(null)
        }
        cursor={pickMode ? "crosshair" : undefined}
      >
        {showNavigation && interactive ? (
          <NavigationControl position="top-right" showCompass={false} />
        ) : null}

        {visiblePlaces.map((place) => (
          <Marker
            key={place.id}
            longitude={place.lng}
            latitude={place.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleSelect(place);
            }}
          >
            <button
              type="button"
              className="border-0 bg-transparent p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              aria-label={`${place.title} — ${mapPlaceTypeLabel(place.place_type)}`}
              title={place.title}
            >
              <PinMarker
                type={place.place_type}
                selected={selectedId === place.id}
                featured={place.is_featured}
              />
            </button>
          </Marker>
        ))}

        {pickMode && pickedLocation ? (
          <Marker
            longitude={pickedLocation.lng}
            latitude={pickedLocation.lat}
            anchor="bottom"
          >
            <PinMarker type="other" selected />
          </Marker>
        ) : null}
      </MapGL>
    </div>
  );
}
