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
import { ArrowLeft, ArrowRight, Clock, ExternalLink, Lightbulb, MapPin, Volume2 } from "lucide-react";
import { optimizeImage } from "@/lib/media-url";
import { buildHeadAsync, excerptFromHtml } from "@/lib/metadata";
import {
  jsonLdScript,
  touristAttractionJsonLd,
} from "@/lib/json-ld";
import {
  formatCoordinates,
  googleMapsDirectionsUrl,
  hasCoordinates,
} from "@/lib/geo";
import { ClientOnly } from "@/components/admin/ClientOnly";
import { AttractionQr } from "@/components/public/AttractionQr";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { MapSuspense, LazySingleLocationMap } from "@/components/map/lazy-maps";
import { usePublicSurfaces } from "@/components/public/surfaces-context";
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
    const description =
      item?.short_desc ||
      excerptFromHtml(item?.full_desc ?? "") ||
      `Explore ${item?.title ?? "Harar"} in Harar Jugol.`;
    return buildHeadAsync({
      title: item?.title ?? "Attraction",
      description,
      ogImage: item?.image,
      canonicalPath: item ? `/attractions/${item.slug}` : "/attractions",
      scripts: item
        ? [
            jsonLdScript(
              touristAttractionJsonLd({
                name: item.title,
                description,
                slug: item.slug,
                image: item.image,
                latitude: item.latitude,
                longitude: item.longitude,
              }),
            ),
          ]
        : undefined,
    });
  },
  component: AttractionDetail,
});

function AttractionDetail() {
  const { item, nearby } = Route.useLoaderData();
  const { bookingEnabled } = usePublicSurfaces();
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

          {(item.opening_hours ||
            item.best_time_to_visit ||
            item.visitor_tips ||
            item.audio_url) && (
            <section className="mt-10 pt-8 border-t border-border space-y-4">
              <h2 className="font-serif text-2xl font-bold">Plan your visit</h2>
              {item.opening_hours ? (
                <p className="flex items-start gap-2 text-sm text-ink-muted">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
                  <span>
                    <strong className="text-ink">Hours:</strong>{" "}
                    {item.opening_hours}
                  </span>
                </p>
              ) : null}
              {item.best_time_to_visit ? (
                <p className="flex items-start gap-2 text-sm text-ink-muted">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-gold" />
                  <span>
                    <strong className="text-ink">Best time:</strong>{" "}
                    {item.best_time_to_visit}
                  </span>
                </p>
              ) : null}
              {item.visitor_tips ? (
                <p className="flex items-start gap-2 text-sm text-ink-muted">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{item.visitor_tips}</span>
                </p>
              ) : null}
              {item.audio_url ? (
                <div className="mt-2">
                  <p className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-brand" /> Audio guide
                  </p>
                  <audio controls className="w-full max-w-md" src={item.audio_url}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : null}
            </section>
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

          <section className="mt-10 pt-8 border-t border-border">
            <h2 className="font-serif text-2xl font-bold mb-4">Share & print</h2>
            <ClientOnly
              fallback={
                <p className="text-sm text-ink-muted">Loading QR code…</p>
              }
            >
              <AttractionQr
                path={`/attractions/${item.slug}`}
                title={item.title}
              />
            </ClientOnly>
          </section>

          <Link
            to={bookingEnabled ? "/book" : "/guides"}
            className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors"
          >
            {bookingEnabled
              ? "Book a Guide for This Attraction"
              : "Meet Guides for This Attraction"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}
