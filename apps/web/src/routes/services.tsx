import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { getPartners } from "@/lib/partners-fns";
import { PARTNER_CATEGORIES } from "@/lib/validators/partners";
import { buildHeadAsync } from "@/lib/metadata";
import { optimizeImage } from "@/lib/media-url";
import { ExternalLink, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/services")({
  loader: async () => {
    const partners = await getPartners({ data: { published: true } });
    return { partners };
  },
  head: async () =>
    buildHeadAsync({
      title: "Local Services & Partners",
      description:
        "Hotels, restaurants, coffee houses, transport, and other trusted services in Harar.",
      canonicalPath: "/services",
    }),
  component: ServicesPage,
});

function ServicesPage() {
  const { partners } = Route.useLoaderData();
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    if (category === "All") return partners;
    return partners.filter((p) => p.category === category);
  }, [partners, category]);

  const featured = filtered.filter((p) => p.is_featured);
  const rest = filtered.filter((p) => !p.is_featured);

  return (
    <PublicLayout>
      <PageHero
        title="Local Services"
        subtitle="Hotels, dining, transport, and other trusted partners recommended by the commission."
      />
      <section className="max-w-5xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", ...PARTNER_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                category === c
                  ? "bg-brand text-white border-brand"
                  : "bg-white border-border hover:border-brand"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-12">
            Partner listings will appear here soon.
          </p>
        ) : (
          <div className="space-y-10">
            {featured.length > 0 ? (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-5">Featured</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  {featured.map((p) => (
                    <PartnerCard key={p.id} partner={p} />
                  ))}
                </div>
              </div>
            ) : null}
            {rest.length > 0 ? (
              <div>
                {featured.length > 0 ? (
                  <h2 className="font-serif text-2xl font-bold mb-5">All</h2>
                ) : null}
                <div className="grid md:grid-cols-2 gap-5">
                  {rest.map((p) => (
                    <PartnerCard key={p.id} partner={p} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function PartnerCard({
  partner: p,
}: {
  partner: Awaited<ReturnType<typeof getPartners>>[number];
}) {
  const img = p.image ? optimizeImage(p.image, { width: 600 }) : null;

  return (
    <article className="bg-white rounded-lg border border-border overflow-hidden flex flex-col">
      {img ? (
        <div
          className="h-40 bg-surface bg-cover bg-center"
          style={{ backgroundImage: `url(${img})` }}
        />
      ) : (
        <div className="h-24 bg-gradient-to-br from-brand/10 to-gold/10" />
      )}
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          {p.category}
        </span>
        <h3 className="font-serif text-xl font-bold mt-1">{p.name}</h3>
        {p.description ? (
          <p className="text-sm text-ink-muted mt-2 line-clamp-3">
            {p.description}
          </p>
        ) : null}
        <div className="mt-4 space-y-1.5 text-sm text-ink-muted">
          {p.address ? (
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              {p.address}
            </p>
          ) : null}
          {p.phone ? (
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              <a href={`tel:${p.phone}`} className="hover:text-brand">
                {p.phone}
              </a>
            </p>
          ) : null}
        </div>
        {p.website ? (
          <a
            href={p.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Visit website <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
