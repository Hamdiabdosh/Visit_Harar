import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { AnnouncementCard } from "@/components/public/AnnouncementCard";
import { getAnnouncements } from "@/lib/announcements-fns";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/news")({
  loader: async () => {
    const result = await getAnnouncements({
      data: { publishedOnly: true, page: 1, perPage: 50 },
    });
    return { result };
  },
  head: async () =>
    buildHeadAsync({
      title: "News & Announcements",
      description:
        "Stay updated on events, notices, and stories from the Harari Tourism Commission.",
      canonicalPath: "/news",
    }),
  component: NewsPage,
});

const tabs = ["All", "News", "Event", "Notice"] as const;

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function NewsPage() {
  const { result } = Route.useLoaderData();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");

  const items = result.items;
  const filtered = tab === "All" ? items : items.filter((a) => a.type === tab);
  const pinned = filtered.find((a) => a.is_pinned);
  const rest = filtered.filter((a) => !a.is_pinned);

  return (
    <PublicLayout>
      <PageHero
        title="News & Announcements"
        subtitle="Stay updated on events, notices and stories from the Commission."
      />
      <section className="max-w-5xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                tab === t
                  ? "bg-brand text-white border-brand"
                  : "bg-white border-border hover:border-brand"
              }`}
            >
              {t}
              {t !== "All" ? "s" : ""}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="text-center text-ink-muted py-12">
            News and announcements will be published here soon.
          </p>
        ) : (
          <>
            {pinned && (
              <div className="mb-8">
                <AnnouncementCard
                  slug={pinned.slug}
                  title={pinned.title}
                  type={pinned.type}
                  published_at={pinned.published_at}
                  cover_image={pinned.cover_image}
                  excerpt={
                    stripHtml(pinned.body ?? "").slice(0, 180) || "Read more…"
                  }
                  pinned
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {rest.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  slug={a.slug}
                  title={a.title}
                  type={a.type}
                  published_at={a.published_at}
                  cover_image={a.cover_image}
                  excerpt={
                    stripHtml(a.body ?? "").slice(0, 140) || "Read more…"
                  }
                  pinned={a.is_pinned}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </PublicLayout>
  );
}
