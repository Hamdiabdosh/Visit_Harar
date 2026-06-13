import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { getItineraries } from "@/lib/itineraries-fns";
import { buildHeadAsync } from "@/lib/metadata";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/itineraries")({
  loader: async () => {
    const items = await getItineraries({ data: { published: true } });
    return { items };
  },
  head: async () =>
    buildHeadAsync({
      title: "Suggested Itineraries",
      description:
        "Pre-built day-by-day plans for exploring Harar — from weekend getaways to deep cultural dives.",
      canonicalPath: "/itineraries",
    }),
  component: ItinerariesPage,
});

function ItinerariesPage() {
  const { items } = Route.useLoaderData();

  return (
    <PublicLayout>
      <PageHero
        title="Suggested Itineraries"
        subtitle="Curated day-by-day plans from the Harari Tourism Commission."
      />
      <section className="max-w-5xl mx-auto px-5 lg:px-8 py-12">
        {items.length === 0 ? (
          <p className="text-center text-ink-muted py-12">
            Itineraries will be published here soon.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <Link
                key={it.id}
                to="/itineraries/$slug"
                params={{ slug: it.slug }}
                className="group bg-white rounded-lg border border-border p-6 hover:border-brand hover:shadow-md transition-all"
              >
                <span className="inline-block px-2 py-1 rounded bg-gold/20 text-amber-900 text-[11px] font-semibold mb-3">
                  {it.duration}
                </span>
                <h2 className="font-serif text-xl font-bold group-hover:text-brand transition-colors">
                  {it.title}
                </h2>
                {it.summary ? (
                  <p className="text-sm text-ink-muted mt-2 line-clamp-3">
                    {it.summary}
                  </p>
                ) : null}
                <p className="mt-4 text-sm font-semibold text-brand inline-flex items-center gap-1">
                  View plan <ArrowRight className="w-4 h-4" />
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/plan-your-trip"
            className="text-sm text-ink-muted hover:text-brand underline"
          >
            More planning tips on Plan Your Trip →
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
