import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Landmark, Megaphone, Route as RouteIcon, Search, Store, Users } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { PublicSearchDialog } from "@/components/public/PublicSearch";
import { searchPublished } from "@/lib/search-fns";
import { buildHeadAsync } from "@/lib/metadata";
import { useLocale } from "@/lib/contexts/LocaleContext";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: async () =>
    buildHeadAsync({
      title: "Search",
      description:
        "Search attractions, licensed guides, and news on Visit Harar.",
      canonicalPath: "/search",
    }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useLocale();
  const [dialogOpen, setDialogOpen] = useState(false);
  const trimmed = q.trim();

  const typeLabels = {
    attraction: t("search.type.attraction"),
    guide: t("search.type.guide"),
    announcement: t("search.type.announcement"),
    partner: t("search.type.partner"),
    itinerary: t("search.type.itinerary"),
  } as const;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "search", "page", trimmed],
    queryFn: () => searchPublished({ data: { q: trimmed, limit: 30 } }),
    enabled: trimmed.length >= 2,
  });

  return (
    <PublicLayout>
      <PublicSearchDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <div className="bg-surface border-b border-border pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <h1 className="font-serif text-3xl font-bold mb-2">{t("search.title")}</h1>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const next = String(fd.get("q") ?? "").trim();
              if (next.length >= 2) {
                void navigate({ to: "/search", search: { q: next } });
              }
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              <input
                name="q"
                defaultValue={trimmed}
                placeholder={t("search.placeholder")}
                className="w-full rounded-md border border-border bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              {t("nav.search")}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10">
        {trimmed.length < 2 ? (
          <p className="text-sm text-ink-muted">
            Enter at least 2 characters to search attractions, guides, and news.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-ink-muted">Searching…</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Search failed. Please try again.</p>
        ) : !data?.results.length ? (
          <p className="text-sm text-ink-muted">{t("search.noResults")}</p>
        ) : (
          <ul className="space-y-4">
            {data.results.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  to={item.href}
                  className="flex gap-4 rounded-lg border border-border p-4 hover:border-brand/30 hover:bg-surface transition-colors"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="h-16 w-20 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-20 rounded bg-surface border border-border shrink-0 grid place-items-center text-ink-muted">
                      {item.type === "attraction" ? (
                        <Landmark className="h-5 w-5" />
                      ) : item.type === "guide" ? (
                        <Users className="h-5 w-5" />
                      ) : item.type === "partner" ? (
                        <Store className="h-5 w-5" />
                      ) : item.type === "itinerary" ? (
                        <RouteIcon className="h-5 w-5" />
                      ) : (
                        <Megaphone className="h-5 w-5" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                        {typeLabels[item.type]}
                      </span>
                      {item.meta ? (
                        <span className="text-[10px] text-ink-muted">
                          {item.meta}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="font-serif font-bold text-lg">{item.title}</h2>
                    {item.excerpt ? (
                      <p className="text-sm text-ink-muted mt-1 line-clamp-2">
                        {item.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PublicLayout>
  );
}
