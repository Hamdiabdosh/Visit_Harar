import { lazy, Suspense } from "react";
import { MapSkeleton } from "./MapSkeleton";

export const LazyTourismMap = lazy(() =>
  import("./TourismMap").then((m) => ({ default: m.TourismMap })),
);

export const LazySingleLocationMap = lazy(() =>
  import("./TourismMap").then((m) => ({ default: m.SingleLocationMap })),
);

export const LazyAttractionRoutesMap = lazy(() =>
  import("./TourismMap").then((m) => ({ default: m.AttractionRoutesMap })),
);

export const LazyMapPicker = lazy(() =>
  import("./MapPicker").then((m) => ({ default: m.MapPicker })),
);

export function MapSuspense({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Suspense fallback={<MapSkeleton className={className} />}>
      {children}
    </Suspense>
  );
}
