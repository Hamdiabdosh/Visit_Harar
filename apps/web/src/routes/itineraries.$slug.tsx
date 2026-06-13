import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { getItineraryBySlug } from "@/lib/itineraries-fns";
import { buildHeadAsync } from "@/lib/metadata";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/itineraries/$slug")({
  loader: async ({ params }) => {
    const item = await getItineraryBySlug({ data: params.slug });
    if (!item) throw notFound();
    return { item };
  },
  head: async ({ loaderData }) => {
    const item = loaderData?.item;
    return buildHeadAsync({
      title: item?.title ?? "Itinerary",
      description:
        item?.summary ??
        `${item?.duration ?? "Trip plan"} — suggested itinerary for Harar.`,
      canonicalPath: item ? `/itineraries/${item.slug}` : "/itineraries",
    });
  },
  component: ItineraryDetail,
});

function ItineraryDetail() {
  const { item } = Route.useLoaderData();

  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto px-5 lg:px-8 py-16">
        <Link
          to="/itineraries"
          className="text-ink-muted text-sm inline-flex items-center gap-1 hover:text-brand mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> All itineraries
        </Link>

        <span className="inline-block px-2.5 py-1 rounded-full bg-gold/20 text-amber-900 text-[11px] font-semibold">
          {item.duration}
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mt-4 leading-tight">
          {item.title}
        </h1>
        {item.summary ? (
          <p className="mt-4 text-lg text-ink-muted">{item.summary}</p>
        ) : null}

        <div className="mt-10 space-y-8">
          {item.days.map((day, i) => (
            <section
              key={i}
              className="bg-white rounded-lg border border-border p-6"
            >
              <h2 className="font-serif text-2xl font-bold">{day.label}</h2>
              <ul className="mt-4 space-y-4">
                {day.items.map((activity, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="text-gold font-bold shrink-0">●</span>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      {activity.description ? (
                        <p className="text-sm text-ink-muted mt-0.5">
                          {activity.description}
                        </p>
                      ) : null}
                      {activity.attraction_slug ? (
                        <Link
                          to="/attractions/$slug"
                          params={{ slug: activity.attraction_slug }}
                          className="mt-1 inline-flex items-center gap-1 text-sm text-brand hover:underline"
                        >
                          <MapPin className="w-3.5 h-3.5" /> View attraction
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors"
          >
            Book a Guide <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border font-semibold hover:border-brand transition-colors"
          >
            Open Map
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}
