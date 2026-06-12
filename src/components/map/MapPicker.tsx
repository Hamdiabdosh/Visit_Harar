"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HARAR_CENTER } from "@/lib/geo";
import { fixLeafletIcons, officeMarkerIcon } from "./leaflet-icons";

type MapPickerProps = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onPick: (lat: number, lng: number) => void;
  className?: string;
};

function RecenterOnCoords({
  lat,
  lng,
}: {
  lat: number | null | undefined;
  lng: number | null | undefined;
}) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], map.getZoom(), { animate: false });
    }
  }, [lat, lng, map]);
  return null;
}

function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapPicker({
  latitude,
  longitude,
  onPick,
  className = "h-[280px]",
}: MapPickerProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const center: [number, number] =
    latitude != null && longitude != null
      ? [latitude, longitude]
      : [HARAR_CENTER.lat, HARAR_CENTER.lng];

  return (
    <div
      className={`rounded-lg overflow-hidden border border-border ${className}`}
    >
      <MapContainer
        center={center}
        zoom={latitude != null && longitude != null ? 16 : 14}
        scrollWheelZoom
        className="h-full w-full z-0"
        aria-label="Click the map to set coordinates"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPick onPick={onPick} />
        <RecenterOnCoords lat={latitude} lng={longitude} />
        {latitude != null && longitude != null ? (
          <Marker position={[latitude, longitude]} icon={officeMarkerIcon()} />
        ) : null}
      </MapContainer>
    </div>
  );
}

/** Fit map bounds to all provided points. */
export function FitBounds({
  points,
}: {
  points: Array<{ lat: number; lng: number }>;
}) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0]!.lat, points[0]!.lng], 15);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
  }, [map, points]);
  return null;
}
