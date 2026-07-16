import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { HeroSection } from "@/components/public/HeroSection";
import { AttractionCard } from "@/components/public/AttractionCard";
import { getPublishedHero } from "@/lib/hero-fns";
import { getAttractions } from "@/lib/attractions-fns";
import { isAttractionCategory } from "@/lib/attraction-styles";
import { getLatestAnnouncements } from "@/lib/announcements-fns";
import { getGuides } from "@/lib/guides-fns";
import { getLatestGalleryItems } from "@/lib/gallery-fns";
import { ErrorBoundary } from "@/components/public/ErrorBoundary";
import { SectionHeader } from "@/components/public/SectionHeader";
import { AnnouncementCard } from "@/components/public/AnnouncementCard";
import { GuideCard } from "@/components/public/GuideCard";
import { GalleryThumb } from "@/components/public/GalleryThumb";
import { HomeMapStrip } from "@/components/public/HomeMapStrip";
import { useLocale } from "@/lib/contexts/LocaleContext";
import { usePublicSurfaces } from "@/components/public/surfaces-context";
import type { AttractionDto } from "@/lib/attraction-map";
import type { AnnouncementDto } from "@/lib/announcements-fns";
import type { GuideDto } from "@/lib/guides-fns";
import type { GalleryItemDto } from "@/lib/gallery-fns";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [hero, featured, latestAnnouncements, featuredGuides, galleryItems] =
      await Promise.all([
        getPublishedHero(),
        getAttractions({ data: { featured: true, published: true, limit: 6 } }),
        getLatestAnnouncements({ data: 3 }),
        getGuides({ data: { published: true, limit: 3 } }),
        getLatestGalleryItems({ data: 8 }),
      ]);
    return { hero, featured, latestAnnouncements, featuredGuides, galleryItems };
  },
  head: async ({ loaderData }) =>
    buildHeadAsync({
      title: "Visit Harar",
      description:
        "Discover Harar, Ethiopia — UNESCO World Heritage Walled City of Saints. Plan your visit, book licensed guides and explore the cultural heart of eastern Ethiopia.",
      ogImage: loaderData?.hero?.background_image ?? null,
      canonicalPath: "/",
    }),
  component: Index,
});

function Index() {
  const { hero, featured, latestAnnouncements, featuredGuides, galleryItems } =
    Route.useLoaderData();

  return (
    <PublicLayout transparentNav>
      <ErrorBoundary>
        <HeroSection hero={hero} />
      </ErrorBoundary>
      <ErrorBoundary>
        <HomeMapStrip />
      </ErrorBoundary>
      <ErrorBoundary>
        <FeaturedAttractions items={featured} />
      </ErrorBoundary>
      {latestAnnouncements.length > 0 ? (
        <ErrorBoundary>
          <Announcements items={latestAnnouncements} />
        </ErrorBoundary>
      ) : null}
      {featuredGuides.length > 0 ? (
        <ErrorBoundary>
          <FeaturedGuides items={featuredGuides} />
        </ErrorBoundary>
      ) : null}
      {galleryItems.length > 0 ? (
        <ErrorBoundary>
          <GalleryTeaser items={galleryItems} />
        </ErrorBoundary>
      ) : null}
    </PublicLayout>
  );
}

function FeaturedAttractions({ items }: { items: AttractionDto[] }) {
  const { t } = useLocale();
  if (items.length === 0) return null;

  const cards = items.map((a) => ({
    title: a.title,
    slug: a.slug,
    category: isAttractionCategory(a.category)
      ? a.category
      : ("Heritage" as const),
    short_desc: a.short_desc,
    image: a.image,
  }));

  return (
    <section className="py-16 md:py-20 max-w-7xl mx-auto px-5 lg:px-8">
      <div className="flex items-end justify-between gap-4 mb-10">
        <SectionHeader
          eyebrow={t("home.attractions.eyebrow")}
          title={t("home.attractions.title")}
          subtitle={t("home.attractions.subtitle")}
          className="mb-0"
        />
        <Link
          to="/attractions"
          className="hidden sm:inline-flex shrink-0 text-sm font-semibold text-brand hover:text-gold items-center gap-1"
        >
          {t("home.attractions.viewAll")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((a) => (
          <AttractionCard key={a.slug} {...a} />
        ))}
      </div>
      <div className="sm:hidden mt-6 text-center">
        <Link
          to="/attractions"
          className="text-sm font-semibold text-brand hover:text-gold inline-flex items-center gap-1"
        >
          {t("home.attractions.viewAll")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function Announcements({ items }: { items: AnnouncementDto[] }) {
  const { t } = useLocale();
  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">
              {t("home.news.latest")}
            </div>
            <h2 className="font-serif text-3xl font-bold">
              {t("home.news.title")}
            </h2>
          </div>
          <Link
            to="/news"
            className="text-sm font-semibold text-brand hover:text-gold shrink-0"
          >
            {t("home.news.viewAll")}
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((a) => (
            <AnnouncementCard
              key={a.id}
              slug={a.slug}
              title={a.title}
              type={a.type}
              published_at={a.published_at}
              cover_image={a.cover_image}
              excerpt={stripHtml(a.body ?? "").slice(0, 140) || "Read more…"}
              pinned={a.is_pinned}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedGuides({ items }: { items: GuideDto[] }) {
  const { t } = useLocale();
  const { bookingEnabled } = usePublicSurfaces();
  return (
    <section className="py-16 md:py-20 max-w-7xl mx-auto px-5 lg:px-8">
      <SectionHeader
        eyebrow={t("home.guides.eyebrow")}
        title={t("home.guides.title")}
        subtitle={t("home.guides.subtitle")}
      />
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((g) => (
          <GuideCard
            key={g.id}
            id={g.id}
            slug={g.slug}
            name={g.name}
            photo={g.photo}
            languages={g.languages}
            specialties={g.specialties}
            experience_years={g.experience_years}
            is_available={g.is_available}
          />
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {bookingEnabled ? (
          <>
            <Link
              to="/book"
              className="px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark transition-colors"
            >
              {t("home.cta.button")}
            </Link>
            <Link
              to="/guides"
              className="px-6 py-3 rounded-md border border-border text-ink font-medium hover:bg-surface transition-colors inline-flex items-center gap-2"
            >
              {t("nav.guides")} <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <Link
            to="/guides"
            className="px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark transition-colors inline-flex items-center gap-2"
          >
            {t("home.cta.buttonGuides")} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </section>
  );
}

function GalleryTeaser({ items }: { items: GalleryItemDto[] }) {
  const { t } = useLocale();
  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeader
          eyebrow={t("home.gallery.eyebrow")}
          title={t("home.gallery.title")}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((it) => (
            <GalleryThumb
              key={it.id}
              url={it.url}
              thumbnail_url={it.thumbnail_url}
              caption={it.caption}
              alt={it.alt_text}
              type={it.type}
              albumId={it.album_id}
            />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/gallery"
            className="text-brand font-semibold inline-flex items-center gap-1 hover:text-gold"
          >
            {t("home.gallery.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
