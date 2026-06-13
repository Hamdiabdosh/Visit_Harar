import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let iconsFixed = false;

/** Leaflet default marker paths break under Vite bundling — call once on the client. */
export function fixLeafletIcons() {
  if (iconsFixed || typeof window === "undefined") return;
  iconsFixed = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
  });
}

export function officeMarkerIcon() {
  fixLeafletIcons();
  return L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;border-radius:50%;background:#5C3317;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:grid;place-items:center;color:#fff;font-size:16px;line-height:1">★</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

export function attractionMarkerIcon(color = "#1A99B1") {
  fixLeafletIcons();
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);transform:rotate(-45deg)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

export const CATEGORY_MARKER_COLORS: Record<string, string> = {
  Heritage: "#1A99B1",
  Wildlife: "#d97706",
  Spiritual: "#9333ea",
  Culture: "#2563eb",
  Shopping: "#0d9488",
  History: "#dc2626",
};
