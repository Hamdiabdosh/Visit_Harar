"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { createRoot, type Root } from "react-dom/client";
import type { AttractionDto } from "@/lib/attraction-map";
import type { AttractionCategory } from "@/lib/attraction-styles";
import { HARAR_CENTER } from "@/lib/geo";
import { ORG_NAME } from "@/lib/org";
import type { WalkingRoute } from "@/lib/routing-fns";
import { AttractionPopupContent, OfficePopupContent } from "./MapPopups";
import {
  CATEGORY_MARKER_COLORS,
  attractionMarkerIcon,
  fixLeafletIcons,
  officeMarkerIcon,
} from "./leaflet-icons";
import { FitBounds } from "./MapPicker";

export type OfficeMarker = {
  office_name: string;
  address_line1?: string | null;
  address_line2?: string | null;
  country?: string | null;
  lat: number;
  lng: number;
};

type TourismMapProps = {
  attractions: AttractionDto[];
  office?: OfficeMarker | null;
  showOffice?: boolean;
  selectedCategories?: Set<AttractionCategory>;
  className?: string;
};

function MarkerClusterLayer({
  attractions,
}: {
  attractions: AttractionDto[];
}) {
  const map = useMap();

  useEffect(() => {
    fixLeafletIcons();
    const roots: Root[] = [];
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    });

    for (const a of attractions) {
      if (a.latitude == null || a.longitude == null) continue;
      const color =
        CATEGORY_MARKER_COLORS[a.category] ?? CATEGORY_MARKER_COLORS.Heritage!;
      const marker = L.marker([a.latitude, a.longitude], {
        icon: attractionMarkerIcon(color),
      });

      marker.bindPopup("", { maxWidth: 280 });
      marker.on("popupopen", () => {
        const content = marker.getPopup()?.getContent();
        if (!(content instanceof HTMLElement) || content.dataset.enhanced === "1") {
          return;
        }
        content.dataset.enhanced = "1";
        content.innerHTML = "";
        const mount = document.createElement("div");
        content.appendChild(mount);
        const root = createRoot(mount);
        roots.push(root);
        root.render(<AttractionPopupContent attraction={a} />);
      });

      group.addLayer(marker);
    }

    map.addLayer(group);
    return () => {
      for (const root of roots) root.unmount();
      map.removeLayer(group);
    };
  }, [map, attractions]);

  return null;
}

/** Full tourism map with clustering — attractions + optional office marker. */
export function TourismMap({
  attractions,
  office,
  showOffice = true,
  selectedCategories,
  className = "h-[min(70vh,640px)]",
}: TourismMapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const filtered = useMemo(() => {
    let list = attractions.filter(
      (a) => a.latitude != null && a.longitude != null,
    );
    if (selectedCategories && selectedCategories.size > 0) {
      list = list.filter((a) =>
        selectedCategories.has(a.category as AttractionCategory),
      );
    }
    return list;
  }, [attractions, selectedCategories]);

  const boundsPoints = useMemo(() => {
    const pts = filtered.map((a) => ({
      lat: a.latitude!,
      lng: a.longitude!,
    }));
    if (showOffice && office) pts.push({ lat: office.lat, lng: office.lng });
    return pts;
  }, [filtered, office, showOffice]);

  return (
    <div
      className={`rounded-lg overflow-hidden border border-border ${className}`}
    >
      <MapContainer
        center={[HARAR_CENTER.lat, HARAR_CENTER.lng]}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full z-0"
        aria-label="Harar tourism map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={boundsPoints} />
        <MarkerClusterLayer attractions={filtered} />
        {showOffice && office ? (
          <Marker position={[office.lat, office.lng]} icon={officeMarkerIcon()}>
            <Popup maxWidth={280}>
              <OfficePopupContent
                officeName={office.office_name || ORG_NAME}
                addressLine1={office.address_line1}
                addressLine2={office.address_line2}
                country={office.country}
                lat={office.lat}
                lng={office.lng}
              />
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}

type NearbyPoint = {
  id: string;
  title: string;
  slug: string;
  lat: number;
  lng: number;
};

/** Attraction detail map with optional walking route to a selected nearby place. */
export function AttractionRoutesMap({
  lat,
  lng,
  nearby,
  activeNearbyId,
  route,
  className = "h-[320px]",
}: {
  lat: number;
  lng: number;
  nearby: NearbyPoint[];
  activeNearbyId?: string | null;
  route?: WalkingRoute | null;
  label?: string;
  className?: string;
}) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const boundsPoints = useMemo(() => {
    const pts = [{ lat, lng }, ...nearby.map((n) => ({ lat: n.lat, lng: n.lng }))];
    if (route?.path.length) {
      for (const [plat, plng] of route.path) {
        pts.push({ lat: plat, lng: plng });
      }
    }
    return pts;
  }, [lat, lng, nearby, route]);

  return (
    <div
      className={`rounded-lg overflow-hidden border border-border ${className}`}
      role="region"
      aria-label="Location and walking routes map"
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={boundsPoints} />
        <Marker position={[lat, lng]} icon={attractionMarkerIcon("#5C3317")} />
        {nearby.map((n) => (
          <Marker
            key={n.id}
            position={[n.lat, n.lng]}
            icon={attractionMarkerIcon(
              n.id === activeNearbyId ? "#F9B200" : "#1A99B1",
            )}
          />
        ))}
        {route?.path.length ? (
          <Polyline
            positions={route.path}
            pathOptions={{
              color: "#5C3317",
              weight: 4,
              opacity: 0.85,
              dashArray: undefined,
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}

/** Single-marker map for simple location display. */
export function SingleLocationMap({
  lat,
  lng,
  label,
  className = "h-[280px]",
}: {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
}) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const touchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  return (
    <div
      className={`rounded-lg overflow-hidden border border-border ${className}`}
      role="region"
      aria-label={label ?? "Location map"}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        dragging={!touchDevice}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={attractionMarkerIcon()} />
      </MapContainer>
    </div>
  );
}
