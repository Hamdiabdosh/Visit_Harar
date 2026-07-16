import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { getPublishedPage } from "@/lib/pages-fns";
import { getItineraries } from "@/lib/itineraries-fns";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { ComingSoon } from "@/components/public/ComingSoon";
import { buildHeadAsync, excerptFromHtml } from "@/lib/metadata";
import { Download, FileText } from "lucide-react";
import { usePublicSurfaces } from "@/components/public/surfaces-context";

export const Route = createFileRoute("/plan-your-trip")({
  loader: async () => {
    const [page, itineraries] = await Promise.all([
      getPublishedPage({ data: "plan" }),
      getItineraries({ data: { published: true } }),
    ]);
    return { page, itineraries };
  },
  head: async ({ loaderData }) => {
    const page = loaderData?.page;
    const content = (page?.content ?? {}) as { getting_here?: string };
    return buildHeadAsync({
      title: page?.title ?? "Plan Your Trip",
      description:
        excerptFromHtml(content.getting_here) ??
        "Transport, seasons, itineraries, and practical tips for visiting Harar.",
      ogImage: page?.hero_image,
      canonicalPath: "/plan-your-trip",
    });
  },
  component: PlanYourTrip,
});

const NAV_SECTIONS = [
  { id: "getting-here", label: "Getting here" },
  { id: "best-time", label: "Best time" },
  { id: "visa", label: "Visa" },
  { id: "packing", label: "Packing" },
  { id: "costs", label: "Costs" },
  { id: "dire-dawa", label: "Dire Dawa" },
  { id: "itineraries", label: "Itineraries" },
  { id: "stay", label: "Where to stay" },
] as const;

function PlanSection({
  id,
  title,
  html,
}: {
  id: string;
  title: string;
  html: string;
}) {
  if (!html.trim()) return null;
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-serif text-2xl font-bold mb-3">{title}</h2>
      <div
        className="prose prose-stone max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
      />
    </section>
  );
}

function PlanYourTrip() {
  const { page, itineraries } = Route.useLoaderData();
  const { bookingEnabled } = usePublicSurfaces();
  const [active, setActive] = useState<string>("getting-here");

  const content = useMemo(() => {
    if (!page) return null;
    const c = page.content as Record<string, unknown>;
    return {
      gettingHere: typeof c.getting_here === "string" ? c.getting_here : "",
      bestTime: typeof c.best_time === "string" ? c.best_time : "",
      visa: typeof c.visa_info === "string" ? c.visa_info : "",
      packing: typeof c.packing_list === "string" ? c.packing_list : "",
      costs: typeof c.estimated_costs === "string" ? c.estimated_costs : "",
      direDawa:
        typeof c.dire_dawa_transfer === "string" ? c.dire_dawa_transfer : "",
      accommodation:
        typeof c.accommodation === "string" ? c.accommodation : "",
    };
  }, [page]);

  const visibleNav = useMemo(() => {
    if (!content) return [];
    const map: Record<string, boolean> = {
      "getting-here": !!content.gettingHere.trim(),
      "best-time": !!content.bestTime.trim(),
      visa: !!content.visa.trim(),
      packing: !!content.packing.trim(),
      costs: !!content.costs.trim(),
      "dire-dawa": !!content.direDawa.trim(),
      itineraries: itineraries.length > 0,
      stay: !!content.accommodation.trim(),
    };
    return NAV_SECTIONS.filter((s) => map[s.id]);
  }, [content, itineraries.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    for (const s of visibleNav) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [visibleNav]);

  if (!page || !content) {
    return (
      <PublicLayout>
        <PageHero
          title="Plan Your Trip"
          subtitle="Transport, seasons, and suggested itineraries."
        />
        <ComingSoon backTo="/" />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageHero
        title={page.title}
        subtitle="Everything you need for a smooth visit."
        backgroundImage={page.hero_image ?? undefined}
      />

      {visibleNav.length > 0 ? (
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
          <div className="max-w-5xl mx-auto px-5 lg:px-8 overflow-x-auto">
            <ul className="flex gap-1 py-2 min-w-max">
              {visibleNav.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`block px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      active === s.id
                        ? "bg-brand text-white"
                        : "text-ink-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}

      <section className="max-w-5xl mx-auto px-5 lg:px-8 py-16 space-y-10">
        <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-surface border border-border">
          <Link
            to="/plan-your-trip/guide"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-sm font-semibold hover:bg-brand-dark"
          >
            <Download className="w-4 h-4" /> Download visitor guide (PDF)
          </Link>
          <Link
            to="/itineraries"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-semibold hover:border-brand"
          >
            <FileText className="w-4 h-4" /> View all itineraries
          </Link>
        </div>

        <PlanSection
          id="getting-here"
          title="Getting here"
          html={content.gettingHere}
        />
        <PlanSection
          id="best-time"
          title="Best time to visit"
          html={content.bestTime}
        />
        <PlanSection id="visa" title="Visa info" html={content.visa} />
        <PlanSection id="packing" title="What to pack" html={content.packing} />
        <PlanSection
          id="costs"
          title="Estimated costs"
          html={content.costs}
        />
        <PlanSection
          id="dire-dawa"
          title="Dire Dawa transfer"
          html={content.direDawa}
        />

        {itineraries.length > 0 ? (
          <section id="itineraries" className="scroll-mt-28">
            <h2 className="font-serif text-2xl font-bold mb-6">
              Suggested itineraries
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {itineraries.map((it) => (
                <Link
                  key={it.id}
                  to="/itineraries/$slug"
                  params={{ slug: it.slug }}
                  className="bg-white rounded-lg border border-border p-6 hover:border-brand transition-colors"
                >
                  <span className="inline-block px-2 py-1 rounded bg-gold/20 text-amber-900 text-[11px] font-semibold mb-3">
                    {it.duration}
                  </span>
                  <h3 className="font-serif text-xl font-bold">{it.title}</h3>
                  {it.summary ? (
                    <p className="mt-2 text-sm text-ink-muted line-clamp-2">
                      {it.summary}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm font-semibold text-brand">
                    View full plan →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <PlanSection
          id="stay"
          title="Where to stay"
          html={content.accommodation}
        />

        <div className="text-center pt-6">
          <Link
            to={bookingEnabled ? "/book" : "/guides"}
            className="inline-flex items-center px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors"
          >
            {bookingEnabled ? "Book Your Guide Now" : "Meet Our Guides"}
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
