import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import {
  getAttractionBySlug,
  getNearbyAttractions,
} from "@/lib/attractions-fns";
import { fullDescParagraphs } from "@/lib/attraction-map";
import {
  categoryColor,
  categoryGradient,
  isAttractionCategory,
} from "@/lib/attraction-styles";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { ArrowLeft, ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { optimizeImage } from "@/lib/media-url";
import { buildHeadAsync, excerptFromHtml } from "@/lib/metadata";
import {
  formatCoordinates,
  googleMapsDirectionsUrl,
  hasCoordinates,
} from "@/lib/geo";
import { ClientOnly } from "@/components/admin/ClientOnly";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { MapSuspense, LazySingleLocationMap } from "@/components/map/lazy-maps";
import { NearbyWithRoutes } from "@/components/map/NearbyWithRoutes";

export const Route = createFileRoute("/attractions/$slug")({
  loader: async ({ params }) => {
    const item = await getAttractionBySlug({ data: params.slug });
    if (!item) throw notFound();
    const nearby = hasCoordinates(item)
      ? await getNearbyAttractions({ data: { slug: params.slug, limit: 3 } })
      : [];
    return { item, nearby };
  },
  head: async ({ loaderData }) => {
    const item = loaderData?.item;
    return buildHeadAsync({
      title: item?.title ?? "Attraction",
      description:
        item?.short_desc ||
        excerptFromHtml(item?.full_desc ?? "") ||
        `Explore ${item?.title ?? "Harar"} in Harar Jugol.`,
      ogImage: item?.image,
      canonicalPath: item ? `/attractions/${item.slug}` : "/attractions",
    });
  },
  component: AttractionDetail,
});

function AttractionDetail() {
  const { item, nearby } = Route.useLoaderData();
  const cat = isAttractionCategory(item.category) ? item.category : "Heritage";
  const paragraphs = fullDescParagraphs(item.full_desc);
  const isHtml = Boolean(
    item.full_desc && /<\/?[a-z][\s\S]*>/i.test(item.full_desc),
  );
  const safeHtml = isHtml ? sanitizeRichHtml(item.full_desc ?? "") : null;
  const heroBg = item.image ? optimizeImage(item.image, { width: 1600 }) : null;
  const showLocation = hasCoordinates(item);

  return (
    <PublicLayout>
      <div
        className={`h-[55vh] bg-gradient-to-br ${categoryGradient[cat]} relative bg-cover bg-center`}
        style={heroBg ? { backgroundImage: `url(${heroBg})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
      </div>
      <article className="max-w-3xl mx-auto px-5 lg:px-8 -mt-32 relative pb-20">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 border border-border">
          <Link
            to="/attractions"
            className="text-ink-muted text-sm inline-flex items-center gap-1 hover:text-brand mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> All attractions
          </Link>
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${categoryColor[cat]}`}
          >
            {cat}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mt-4 leading-tight">
            {item.title}
          </h1>
          {paragraphs.length > 0 ? (
            isHtml && safeHtml ? (
              <div
                className="mt-8 text-ink-muted leading-relaxed prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />
            ) : (
              <div className="mt-8 space-y-5 text-ink-muted leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )
          ) : (
            <div className="mt-8 text-ink-muted leading-relaxed">
              <p>Description coming soon.</p>
            </div>
          )}

          {showLocation ? (
            <section className="mt-10 pt-8 border-t border-border">
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand" aria-hidden />
                Location
              </h2>
              <p className="text-sm text-ink-muted mt-2 font-mono">
                {formatCoordinates(item.latitude!, item.longitude!)}
              </p>
              <div className="mt-4">
                <ClientOnly fallback={<MapSkeleton className="h-[280px]" />}>
                  <MapSuspense className="h-[280px]">
                    <LazySingleLocationMap
                      lat={item.latitude!}
                      lng={item.longitude!}
                      label={`Map showing ${item.title}`}
                      className="h-[280px]"
                    />
                  </MapSuspense>
                </ClientOnly>
              </div>
              <a
                href={googleMapsDirectionsUrl(item.latitude!, item.longitude!)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                <ExternalLink className="w-4 h-4" aria-hidden />
                Open in Google Maps
              </a>
            </section>
          ) : null}

          {nearby.length > 0 && showLocation ? (
            <NearbyWithRoutes
              origin={{
                lat: item.latitude!,
                lng: item.longitude!,
                title: item.title,
              }}
              nearby={nearby}
            />
          ) : null}

          <Link
            to="/book"
            className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors"
          >
            Book a Guide for This Attraction <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}
