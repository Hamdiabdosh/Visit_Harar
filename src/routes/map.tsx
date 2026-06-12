import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { getAttractions } from "@/lib/attractions-fns";
import { getPublishedContactInfo } from "@/lib/contact-fns";
import { buildHeadAsync } from "@/lib/metadata";
import { ORG_NAME } from "@/lib/org";
import { MapPin } from "lucide-react";
import { ClientOnly } from "@/components/admin/ClientOnly";
import { LazyTourismMap, MapSuspense } from "@/components/map/lazy-maps";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import {
  MapCategoryChips,
  MapCategoryFilter,
} from "@/components/map/MapCategoryFilter";
import type { OfficeMarker } from "@/components/map/TourismMap";
import {
  ATTRACTION_CATEGORIES,
  type AttractionCategory,
} from "@/lib/attraction-styles";

export const Route = createFileRoute("/map")({
  loader: async () => {
    const [attractions, contact] = await Promise.all([
      getAttractions({ data: { published: true, withCoordinates: true } }),
      getPublishedContactInfo(),
    ]);

    let office: OfficeMarker | null = null;
    if (
      contact?.is_published &&
      contact.map_lat != null &&
      contact.map_lng != null
    ) {
      office = {
        office_name: contact.office_name ?? ORG_NAME,
        address_line1: contact.address_line1,
        address_line2: contact.address_line2,
        country: contact.country,
        lat: contact.map_lat,
        lng: contact.map_lng,
      };
    }

    return { attractions, office };
  },
  head: async () =>
    buildHeadAsync({
      title: "Map",
      description:
        "Explore Harar's attractions and the tourism commission office on an interactive map.",
      canonicalPath: "/map",
    }),
  component: MapPage,
});

function MapPage() {
  const { attractions, office } = Route.useLoaderData();
  const hasMarkers = attractions.length > 0 || office != null;

  const categoriesWithData = useMemo(
    () =>
      new Set(
        attractions
          .map((a) => a.category)
          .filter((c): c is AttractionCategory =>
            ATTRACTION_CATEGORIES.includes(c as AttractionCategory),
          ),
      ),
    [attractions],
  );

  const [selected, setSelected] = useState<Set<AttractionCategory>>(
    () => new Set(categoriesWithData),
  );
  const [showOffice, setShowOffice] = useState(true);

  const visibleCount = useMemo(
    () => attractions.filter((a) => selected.has(a.category as AttractionCategory)).length,
    [attractions, selected],
  );

  function toggleCategory(cat: AttractionCategory) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(categoriesWithData));
  }

  const filterProps = {
    attractions,
    selected,
    onToggle: toggleCategory,
    onSelectAll: selectAll,
    showOffice,
    onToggleOffice: setShowOffice,
    hasOffice: office != null,
  };

  return (
    <PublicLayout>
      <PageHero
        title="Explore Harar on the Map"
        subtitle="Find attractions, plan your route, and locate the tourism commission office."
      />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10 pb-16">
        {!hasMarkers ? (
          <div className="rounded-lg border border-border bg-surface p-10 text-center">
            <MapPin className="w-10 h-10 text-brand mx-auto mb-3" aria-hidden />
            <h2 className="font-serif text-xl font-bold">Map coming soon</h2>
            <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
              Attraction locations will appear here once the commission adds
              coordinates in the CMS.
            </p>
          </div>
        ) : (
          <>
            <MapCategoryChips {...filterProps} />
            <p className="text-sm text-ink-muted mb-4 mt-2 lg:mt-0">
              {visibleCount} attraction{visibleCount === 1 ? "" : "s"} shown
              {showOffice && office ? " · Tourism office marked with ★" : ""}
            </p>
            <div className="grid lg:grid-cols-[240px_1fr] gap-6">
              <MapCategoryFilter
                {...filterProps}
                className="hidden lg:block h-fit sticky top-24"
              />
              <ClientOnly
                fallback={<MapSkeleton className="h-[min(70vh,640px)]" />}
              >
                <MapSuspense className="h-[min(70vh,640px)]">
                  <LazyTourismMap
                    attractions={attractions}
                    office={office}
                    showOffice={showOffice}
                    selectedCategories={selected}
                    className="h-[min(70vh,640px)]"
                  />
                </MapSuspense>
              </ClientOnly>
            </div>
          </>
        )}
      </section>
    </PublicLayout>
  );
}
