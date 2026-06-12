import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { ClientOnly } from "@/components/admin/ClientOnly";
import { Field, Input, Button } from "@/components/AdminLayout";
import { LazyMapPicker, MapSuspense } from "@/components/map/lazy-maps";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { geocodeAddress, type GeocodeResult } from "@/lib/geocode-fns";
import { formatCoordinates } from "@/lib/geo";

type LocationPickerFieldsProps = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onPick: (lat: number, lng: number) => void;
  addressQuery?: string;
  hint?: string;
  latError?: string;
  lngError?: string;
};

export function LocationPickerFields({
  latitude,
  longitude,
  onPick,
  addressQuery = "",
  hint = "Search an address or click the map to set coordinates.",
  latError,
  lngError,
}: LocationPickerFieldsProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);

  const geocode = useMutation({
    mutationFn: (query: string) => geocodeAddress({ data: { query } }),
    onSuccess: (rows) => setResults(rows),
  });

  const errorMessage = latError ?? lngError;

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-muted">{hint}</p>

      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search address or place name…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const q = search.trim() || addressQuery.trim();
              if (q.length >= 3) geocode.mutate(q);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={geocode.isPending}
          onClick={() => {
            const q = search.trim() || addressQuery.trim();
            if (q.length >= 3) geocode.mutate(q);
          }}
          className="shrink-0"
        >
          <Search className="w-4 h-4" />
          {geocode.isPending ? "…" : "Find"}
        </Button>
      </div>

      {geocode.isError ? (
        <p className="text-xs text-red-600">
          Could not geocode that address. Try a different search or pick on the
          map.
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul className="rounded-md border border-border divide-y divide-border max-h-36 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-xs hover:bg-surface transition-colors"
                onClick={() => {
                  onPick(r.lat, r.lng);
                  setResults([]);
                  setSearch(r.display_name.split(",")[0] ?? "");
                }}
              >
                <span className="font-medium block truncate">
                  {r.display_name.split(",")[0]}
                </span>
                <span className="text-ink-muted line-clamp-1">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude">
          <Input
            type="number"
            step="any"
            value={latitude ?? ""}
            readOnly
            className="font-mono text-xs bg-surface"
          />
        </Field>
        <Field label="Longitude">
          <Input
            type="number"
            step="any"
            value={longitude ?? ""}
            readOnly
            className="font-mono text-xs bg-surface"
          />
        </Field>
      </div>

      {errorMessage ? (
        <p className="text-xs text-red-600">{errorMessage}</p>
      ) : null}

      {latitude != null && longitude != null ? (
        <p className="text-[11px] text-ink-muted font-mono">
          {formatCoordinates(latitude, longitude)}
        </p>
      ) : null}

      <ClientOnly fallback={<MapSkeleton className="h-[280px]" />}>
        <MapSuspense className="h-[280px]">
          <LazyMapPicker
            latitude={latitude}
            longitude={longitude}
            onPick={onPick}
            className="h-[280px]"
          />
        </MapSuspense>
      </ClientOnly>
    </div>
  );
}
