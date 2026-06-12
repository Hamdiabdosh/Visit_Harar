import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { ClientOnly } from "@/components/admin/ClientOnly";
import { HararMap } from "@/components/map/HararMap";
import { MapPlaceCard } from "@/components/map/MapPlaceCard";
import { getPublishedMapPlaces } from "@/lib/map-places-fns";
import {
  MAP_FILTER_GROUPS,
  mapPlaceTypeLabel,
  type MapPlaceType,
} from "@/lib/map-place-styles";
import { buildHeadAsync } from "@/lib/metadata";
import { Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type MapFilter = (typeof MAP_FILTER_GROUPS)[number]["id"];

export const Route = createFileRoute("/map")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter:
      typeof search.filter === "string" &&
      MAP_FILTER_GROUPS.some((g) => g.id === search.filter)
        ? (search.filter as MapFilter)
        : ("all" as MapFilter),
    q: typeof search.q === "string" ? search.q.trim() : "",
  }),
  loader: async () => {
    const places = await getPublishedMapPlaces();
    return { places };
  },
  head: async () =>
    buildHeadAsync({
      title: "Explore Harar Map",
      description:
        "Interactive map of Harar Jugol — museums, hotels, gates, essentials, and attractions to help you find your way.",
      canonicalPath: "/map",
    }),
  component: MapPage,
});

function MapSkeleton() {
  return (
    <div className="grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-4 min-h-[520px]">
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="min-h-[520px] w-full rounded-lg" />
    </div>
  );
}

function MapPage() {
  const { places } = Route.useLoaderData();
  const { filter, q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(q);

  const filterGroup =
    MAP_FILTER_GROUPS.find((g) => g.id === filter) ?? MAP_FILTER_GROUPS[0];

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return places.filter((p) => {
      const typeOk =
        filter === "all" || filterGroup.types.includes(p.place_type);
      if (!typeOk) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.short_desc?.toLowerCase().includes(query) ||
        p.address?.toLowerCase().includes(query) ||
        mapPlaceTypeLabel(p.place_type).toLowerCase().includes(query)
      );
    });
  }, [places, filter, filterGroup.types, q]);

  const selected = selectedId
    ? (filtered.find((p) => p.id === selectedId) ??
      places.find((p) => p.id === selectedId) ??
      null)
    : null;

  function setFilter(next: MapFilter) {
    void navigate({ search: { filter: next, q: q || undefined }, replace: true });
    setSelectedId(null);
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    void navigate({
      search: { filter, q: searchInput.trim() || undefined },
      replace: true,
    });
  }

  return (
    <PublicLayout>
      <PageHero
        title="Explore Harar"
        subtitle="Find museums, hotels, gates, and essentials on the map."
      />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 pb-16">
        <div
          role="tablist"
          aria-label="Map filters"
          className="flex flex-wrap gap-2 mb-4"
        >
          {MAP_FILTER_GROUPS.map((g) => {
            const active = filter === g.id;
            const count =
              g.id === "all"
                ? places.length
                : places.filter((p) => g.types.includes(p.place_type)).length;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(g.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  active
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-ink-muted border-border hover:border-brand/40"
                }`}
              >
                {g.label}
                <span className="ml-1.5 text-[10px] opacity-80">{count}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={submitSearch} className="relative mb-6 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
            aria-hidden
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search places…"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Search map places"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                void navigate({ search: { filter, q: undefined }, replace: true });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </form>

        {places.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-10 text-center max-w-lg mx-auto">
            <h2 className="font-serif text-xl font-bold">Map coming soon</h2>
            <p className="text-ink-muted mt-2 text-sm">
              Places will appear here once the commission publishes them on the map.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-4 lg:min-h-[560px]">
            <div className="flex flex-col gap-3 max-h-[420px] lg:max-h-none lg:overflow-y-auto order-2 lg:order-1">
              <p className="text-xs text-ink-muted shrink-0">
                {filtered.length}{" "}
                {filtered.length === 1 ? "place" : "places"}
                {q ? ` matching “${q}”` : ""}
              </p>
              {filtered.length === 0 ? (
                <p className="text-sm text-ink-muted py-8 text-center">
                  No places match your filters.
                </p>
              ) : (
                filtered.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setSelectedId(place.id)}
                    className={`text-left rounded-lg border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                      selectedId === place.id
                        ? "border-brand bg-brand/5"
                        : "border-border bg-white hover:border-brand/30"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                      {mapPlaceTypeLabel(place.place_type)}
                    </span>
                    <div className="font-serif font-bold text-sm mt-0.5">
                      {place.title}
                    </div>
                    {place.short_desc ? (
                      <p className="text-xs text-ink-muted mt-1 line-clamp-2">
                        {place.short_desc}
                      </p>
                    ) : null}
                  </button>
                ))
              )}
            </div>

            <div className="order-1 lg:order-2 flex flex-col gap-4 min-h-[360px] lg:min-h-[560px]">
              <ClientOnly fallback={<MapSkeleton />}>
                <HararMap
                  places={filtered}
                  selectedId={selectedId}
                  onSelect={(p) => setSelectedId(p?.id ?? null)}
                  className="flex-1 min-h-[360px] lg:min-h-[480px] w-full rounded-xl overflow-hidden border border-border shadow-sm"
                />
              </ClientOnly>
              {selected ? (
                <MapPlaceCard place={selected} compact />
              ) : null}
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
