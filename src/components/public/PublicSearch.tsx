import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Landmark, Megaphone, Route, Search, Store, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { searchPublished, type SearchResultItem } from "@/lib/search-fns";
import { useLocale } from "@/lib/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/i18n";

const typeIcons = {
  attraction: Landmark,
  guide: Users,
  announcement: Megaphone,
  partner: Store,
  itinerary: Route,
} as const;

const typeLabelKeys: Record<
  keyof typeof typeIcons,
  TranslationKey
> = {
  attraction: "search.type.attraction",
  guide: "search.type.guide",
  announcement: "search.type.announcement",
  partner: "search.type.partner",
  itinerary: "search.type.itinerary",
};

function groupResults(items: SearchResultItem[]) {
  return {
    attraction: items.filter((i) => i.type === "attraction"),
    guide: items.filter((i) => i.type === "guide"),
    announcement: items.filter((i) => i.type === "announcement"),
    partner: items.filter((i) => i.type === "partner"),
    itinerary: items.filter((i) => i.type === "itinerary"),
  };
}

export function PublicSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  const { data, isFetching } = useQuery({
    queryKey: ["public", "search", query],
    queryFn: () => searchPublished({ data: { q: query, limit: 12 } }),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });

  const grouped = groupResults(data?.results ?? []);

  function go(href: string) {
    onOpenChange(false);
    void navigate({ to: href });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t("search.placeholder")}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.trim().length < 2 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search.
          </div>
        ) : isFetching ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Searching…
          </div>
        ) : !data?.results.length ? (
          <CommandEmpty>{t("search.noResults")}</CommandEmpty>
        ) : (
          <>
            {(
              [
                "attraction",
                "guide",
                "announcement",
                "partner",
                "itinerary",
              ] as const
            ).map((type, idx) => {
              const items = grouped[type];
              if (!items.length) return null;
              const Icon = typeIcons[type];
              return (
                <div key={type}>
                  {idx > 0 && <CommandSeparator />}
                  <CommandGroup heading={t(typeLabelKeys[type])}>
                    {items.map((item) => (
                      <CommandItem
                        key={`${item.type}-${item.id}`}
                        value={`${item.title} ${item.excerpt}`}
                        onSelect={() => go(item.href)}
                      >
                        <Icon className="text-brand" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {item.title}
                          </div>
                          {item.excerpt ? (
                            <div className="truncate text-xs text-muted-foreground">
                              {item.excerpt}
                            </div>
                          ) : null}
                        </div>
                        {item.meta ? (
                          <span className="text-[10px] text-muted-foreground">
                            {item.meta}
                          </span>
                        ) : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </div>
              );
            })}
            {query.trim().length >= 2 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onOpenChange(false);
                      void navigate({
                        to: "/search",
                        search: { q: query.trim() },
                      });
                    }}
                  >
                    <Search />
                    {t("search.viewAll")} “{query.trim()}”
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function PublicSearchButton({
  scrolled = true,
  open: controlledOpen,
  onOpenChange,
}: {
  scrolled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const isControlled = controlledOpen !== undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
          scrolled
            ? "border-border text-ink-muted hover:border-brand/30 hover:text-ink"
            : "border-white/25 text-white/80 hover:border-white/40 hover:text-white"
        }`}
        aria-label={t("nav.search")}
      >
        <Search className="h-4 w-4" />
        <span className="hidden xl:inline">{t("nav.search")}</span>
        <kbd className="hidden rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-medium xl:inline">
          ⌘K
        </kbd>
      </button>
      {!isControlled && (
        <PublicSearchDialog open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
