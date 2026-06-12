import {
  ATTRACTION_CATEGORIES,
  categoryColor,
  type AttractionCategory,
} from "@/lib/attraction-styles";
import type { AttractionDto } from "@/lib/attraction-map";
import { cn } from "@/lib/utils";

type MapCategoryFilterProps = {
  attractions: AttractionDto[];
  selected: Set<AttractionCategory>;
  onToggle: (category: AttractionCategory) => void;
  onSelectAll: () => void;
  showOffice: boolean;
  onToggleOffice: (show: boolean) => void;
  hasOffice: boolean;
  className?: string;
};

export function MapCategoryFilter({
  attractions,
  selected,
  onToggle,
  onSelectAll,
  showOffice,
  onToggleOffice,
  hasOffice,
  className,
}: MapCategoryFilterProps) {
  const counts = ATTRACTION_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = attractions.filter((a) => a.category === cat).length;
      return acc;
    },
    {} as Record<AttractionCategory, number>,
  );

  const visibleCount = attractions.filter((a) =>
    selected.has(a.category as AttractionCategory),
  ).length;

  return (
    <aside
      className={cn(
        "rounded-lg border border-border bg-white p-4 space-y-4",
        className,
      )}
      aria-label="Filter map by category"
    >
      <div>
        <h2 className="font-serif font-bold text-lg">Filter</h2>
        <p className="text-xs text-ink-muted mt-1">
          {visibleCount} of {attractions.length} shown
        </p>
      </div>

      <button
        type="button"
        onClick={onSelectAll}
        className="text-xs font-semibold text-brand hover:underline"
      >
        Show all categories
      </button>

      <ul className="space-y-1.5">
        {ATTRACTION_CATEGORIES.map((cat) => {
          const count = counts[cat];
          if (count === 0) return null;
          const active = selected.has(cat);
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => onToggle(cat)}
                aria-pressed={active}
                className={cn(
                  "w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors border",
                  active
                    ? "border-brand/30 bg-brand/5"
                    : "border-transparent opacity-50 hover:opacity-80",
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium",
                      categoryColor[cat],
                    )}
                  >
                    {cat}
                  </span>
                </span>
                <span className="text-xs text-ink-muted tabular-nums">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {hasOffice ? (
        <div className="pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => onToggleOffice(!showOffice)}
            aria-pressed={showOffice}
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors border",
              showOffice
                ? "border-brand/30 bg-brand/5"
                : "border-transparent opacity-50 hover:opacity-80",
            )}
          >
            <span className="text-brand font-bold" aria-hidden>
              ★
            </span>
            <span className="font-medium">Tourism Office</span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}

/** Horizontal chip row for mobile map filters. */
export function MapCategoryChips({
  attractions,
  selected,
  onToggle,
  onSelectAll,
  showOffice,
  onToggleOffice,
  hasOffice,
}: MapCategoryFilterProps) {
  const counts = ATTRACTION_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = attractions.filter((a) => a.category === cat).length;
      return acc;
    },
    {} as Record<AttractionCategory, number>,
  );

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin lg:hidden"
      aria-label="Filter map by category"
    >
      <button
        type="button"
        onClick={onSelectAll}
        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-white"
      >
        All
      </button>
      {ATTRACTION_CATEGORIES.map((cat) => {
        if (counts[cat] === 0) return null;
        const active = selected.has(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onToggle(cat)}
            aria-pressed={active}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-opacity",
              categoryColor[cat],
              active ? "opacity-100" : "opacity-40",
            )}
          >
            {cat} ({counts[cat]})
          </button>
        );
      })}
      {hasOffice ? (
        <button
          type="button"
          onClick={() => onToggleOffice(!showOffice)}
          aria-pressed={showOffice}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand/30 bg-brand/5",
            showOffice ? "opacity-100" : "opacity-40",
          )}
        >
          ★ Office
        </button>
      ) : null}
    </div>
  );
}
