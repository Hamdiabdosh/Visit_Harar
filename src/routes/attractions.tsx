import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { AttractionCard } from "@/components/public/AttractionCard";
import { getAttractions } from "@/lib/attractions-fns";
import {
  ATTRACTION_CATEGORIES,
  isAttractionCategory,
  type AttractionCategory,
} from "@/lib/attraction-styles";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/attractions")({
  loader: async () => {
    const items = await getAttractions({ data: { published: true } });
    return { items };
  },
  head: async () =>
    buildHeadAsync({
      title: "Attractions",
      description:
        "Explore Harar's heritage sites, sacred shrines, wildlife encounters and cultural experiences.",
      canonicalPath: "/attractions",
    }),
  component: AttractionsPage,
});

type Filter = "All" | AttractionCategory;
const cats: Filter[] = ["All", ...ATTRACTION_CATEGORIES];

function AttractionsPage() {
  const { items } = Route.useLoaderData();
  const [active, setActive] = useState<Filter>("All");

  const source = items.map((a) => ({
    title: a.title,
    slug: a.slug,
    category: isAttractionCategory(a.category)
      ? a.category
      : ("Heritage" as const),
    short_desc: a.short_desc,
    image: a.image,
  }));

  const filtered =
    active === "All" ? source : source.filter((a) => a.category === active);

  return (
    <PublicLayout>
      <PageHero
        title="Explore Harar's Attractions"
        subtitle="From ancient walls to nightly rituals — six worlds inside one city."
      />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-10">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                active === c
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-ink border-border hover:border-brand"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {source.length === 0 ? (
          <p className="text-center text-ink-muted py-12">
            Attractions will be published here soon. Check back after the bureau
            updates the CMS.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-12">
            No attractions in this category yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <AttractionCard key={a.slug} {...a} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
