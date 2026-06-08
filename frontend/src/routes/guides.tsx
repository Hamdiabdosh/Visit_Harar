import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { GuideCard } from "@/components/public/GuideCard";
import { getGuides } from "@/lib/guides-fns";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/guides")({
  loader: async () => {
    const items = await getGuides({ data: { published: true } });
    return { items };
  },
  head: async () =>
    buildHeadAsync({
      title: "Licensed Guides",
      description:
        "Book bureau-certified local guides who grew up inside the walls of Harar Jugol.",
      canonicalPath: "/guides",
    }),
  component: GuidesPage,
});

function GuidesPage() {
  const { items } = Route.useLoaderData();
  const [lang, setLang] = useState("All");
  const [spec, setSpec] = useState("All");

  const langs = useMemo(
    () => ["All", ...Array.from(new Set(items.flatMap((g) => g.languages)))],
    [items],
  );
  const specs = useMemo(
    () => ["All", ...Array.from(new Set(items.flatMap((g) => g.specialties)))],
    [items],
  );

  const filtered = items.filter(
    (g) =>
      (lang === "All" || g.languages.includes(lang)) &&
      (spec === "All" || g.specialties.includes(spec)),
  );

  return (
    <PublicLayout>
      <PageHero
        title="Licensed Local Guides"
        subtitle="Bureau-certified guides ready to share their city."
      />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        {items.length === 0 ? (
          <p className="text-center text-ink-muted py-12">
            Licensed guides will appear here once published by the bureau.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-8">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="rounded border border-border bg-white px-3 py-2 text-sm"
              >
                {langs.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <select
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                className="rounded border border-border bg-white px-3 py-2 text-sm"
              >
                {specs.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((g) => (
                <GuideCard key={g.id} {...g} />
              ))}
            </div>
          </>
        )}
      </section>
    </PublicLayout>
  );
}
