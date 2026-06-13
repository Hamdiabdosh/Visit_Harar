import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { HeroSection } from "@/components/public/HeroSection";
import { AttractionCard } from "@/components/public/AttractionCard";
import { getPublishedHero } from "@/lib/hero-fns";
import { getAttractions } from "@/lib/attractions-fns";
import { isAttractionCategory } from "@/lib/attraction-styles";
import { getLatestAnnouncements } from "@/lib/announcements-fns";
import { getGuides } from "@/lib/guides-fns";
import { getLatestGalleryItems } from "@/lib/gallery-fns";
import { getPublishedPage } from "@/lib/pages-fns";
import {
  Pin,
  Mountain,
  Globe,
  Users,
  ArrowRight,
  Landmark,
} from "lucide-react";
import { ErrorBoundary } from "@/components/public/ErrorBoundary";
import { SectionHeader } from "@/components/public/SectionHeader";
import { AnnouncementCard } from "@/components/public/AnnouncementCard";
import { GuideCard } from "@/components/public/GuideCard";
import { GalleryThumb } from "@/components/public/GalleryThumb";
import { useLocale } from "@/lib/contexts/LocaleContext";
import { HomeMapStrip } from "@/components/public/HomeMapStrip";
import { HomeAppPromo } from "@/components/public/HomeAppPromo";
import type { AttractionDto } from "@/lib/attraction-map";
import type { AnnouncementDto } from "@/lib/announcements-fns";
import type { GuideDto } from "@/lib/guides-fns";
import type { GalleryItemDto } from "@/lib/gallery-fns";
import type { PageDto } from "@/lib/pages-fns";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [
      hero,
      featured,
      latestAnnouncements,
      featuredGuides,
      galleryItems,
      aboutPage,
    ] = await Promise.all([
      getPublishedHero(),
      getAttractions({ data: { featured: true, published: true, limit: 6 } }),
      getLatestAnnouncements({ data: 3 }),
      getGuides({ data: { published: true, limit: 3 } }),
      getLatestGalleryItems({ data: 8 }),
      getPublishedPage({ data: "about" }),
    ]);
    return {
      hero,
      featured,
      latestAnnouncements,
      featuredGuides,
      galleryItems,
      aboutPage,
    };
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
  const {
    hero,
    featured,
    latestAnnouncements,
    featuredGuides,
    galleryItems,
    aboutPage,
  } = Route.useLoaderData();
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
      <ErrorBoundary>
        <Announcements items={latestAnnouncements} />
      </ErrorBoundary>
      <ErrorBoundary>
        <FeaturedGuides items={featuredGuides} />
      </ErrorBoundary>
      <ErrorBoundary>
        <GalleryTeaser items={galleryItems} />
      </ErrorBoundary>
      <ErrorBoundary>
        <AboutTeaser page={aboutPage} />
      </ErrorBoundary>
      <ErrorBoundary>
        <HomeAppPromo />
      </ErrorBoundary>
      <ErrorBoundary>
        <CTABanner />
      </ErrorBoundary>
    </PublicLayout>
  );
}

function FeaturedAttractions({ items }: { items: AttractionDto[] }) {
  const { t } = useLocale();
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
    <section className="py-24 max-w-7xl mx-auto px-5 lg:px-8">
      <SectionHeader
        eyebrow={t("home.attractions.eyebrow")}
        title={t("home.attractions.title")}
        subtitle={t("home.attractions.subtitle")}
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((a) => (
          <AttractionCard key={a.slug} {...a} />
        ))}
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
    <section className="py-20 bg-surface">
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
            className="text-sm font-semibold text-brand hover:text-gold"
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
  return (
    <section className="py-24 max-w-7xl mx-auto px-5 lg:px-8">
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
    </section>
  );
}

function GalleryTeaser({ items }: { items: GalleryItemDto[] }) {
  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeader eyebrow="Visual Stories" title="Gallery" />
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
            View Full Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutTeaser({ page }: { page: PageDto | null }) {
  const content = (page?.content ?? {}) as Record<string, unknown>;
  const intro =
    typeof content.intro_text === "string" ? content.intro_text : null;
  const facts: { label: string; value: string }[] = Array.isArray(
    content.quick_facts,
  )
    ? content.quick_facts
    : [];

  return (
    <section className="py-24 max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">
          About Harar
        </div>
        <h2 className="font-serif text-4xl font-bold text-ink leading-tight">
          The Walled City of Saints
        </h2>
        <div className="mt-5 space-y-4 text-ink-muted leading-relaxed">
          {intro ? (
            <p className="line-clamp-4">{stripHtml(intro)}</p>
          ) : (
            <>
              <p>
                Founded in the 7th century, Harar grew into the most important
                trading and Islamic centre on the Horn of Africa. Its fortified
                walls were built in the 16th century to defend against attack —
                and they remain largely intact today.
              </p>
              <p>
                Step inside the gates and time slows. Bright doors, narrow
                alleys, calls to prayer and the smell of incense and freshly
                roasted coffee greet you.
              </p>
            </>
          )}
        </div>
      </div>
      <div className="aspect-[4/5] rounded-lg bg-gradient-to-br from-brand-dark via-brand to-gold relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(60deg, transparent 0 18px, rgba(255,255,255,0.4) 18px 19px), repeating-linear-gradient(-60deg, transparent 0 18px, rgba(255,255,255,0.4) 18px 19px)",
          }}
        />
      </div>
      <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
        {(facts.length > 0
          ? facts
              .slice(0, 4)
              .map((f) => ({ icon: Globe, label: `${f.label}: ${f.value}` }))
          : [
              { icon: Mountain, label: "1,885m elevation" },
              { icon: Landmark, label: "1,000+ years old" },
              { icon: Globe, label: "UNESCO 2006" },
              { icon: Users, label: "~99,000 residents" },
            ]
        ).map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-lg bg-surface"
          >
            <Icon className="w-5 h-5 text-brand" />
            <span className="text-sm font-medium text-ink">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTABanner() {
  const { t } = useLocale();
  return (
    <section className="py-20 bg-brand-dark text-white">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-gold">
          {t("home.cta.title")}
        </h2>
        <p className="mt-4 text-white/75 max-w-xl mx-auto">
          {t("home.cta.subtitle")}
        </p>
        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <Link
            to="/book"
            className="px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors"
          >
            {t("home.cta.button")}
          </Link>
          <Link
            to="/plan-your-trip"
            className="px-6 py-3 rounded-md border border-white/40 hover:bg-white/10 transition-colors font-medium"
          >
            {t("nav.plan")}
          </Link>
        </div>
      </div>
    </section>
  );
}
