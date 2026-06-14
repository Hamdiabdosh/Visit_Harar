import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { AnnouncementCard } from "@/components/public/AnnouncementCard";
import { EventsCalendar } from "@/components/public/EventsCalendar";
import { getAnnouncements } from "@/lib/announcements-fns";
import type { AnnouncementType } from "@/lib/types";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/news")({
  loader: async () => {
    const result = await getAnnouncements({
      data: { publishedOnly: true, page: 1, perPage: 50 },
    });
    const events = result.items.filter((a) => a.type === "Event");
    return { result, events };
  },
  head: async () =>
    buildHeadAsync({
      title: "News & Events",
      description:
        "Stay updated on events, notices, and stories from the Harari Tourism Commission.",
      canonicalPath: "/news",
    }),
  component: NewsPage,
});

type TabKey = "All" | AnnouncementType;

const tabs: { key: TabKey; label: string }[] = [
  { key: "All", label: "All" },
  { key: "News", label: "News" },
  { key: "Event", label: "Events" },
  { key: "Notice", label: "Notices" },
];

const views = ["List", "Calendar"] as const;

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function NewsPage() {
  const { result, events } = Route.useLoaderData();
  const [tab, setTab] = useState<TabKey>("All");
  const [view, setView] = useState<(typeof views)[number]>("List");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const items = result.items;
  const filtered =
    tab === "All" ? items : items.filter((a) => a.type === tab);
  const pinned = filtered.find((a) => a.is_pinned);
  const rest = filtered.filter((a) => !a.is_pinned);
  const showCalendar = view === "Calendar" && (tab === "All" || tab === "Event");

  const emptyMessage =
    items.length === 0
      ? "News and events will be published here soon."
      : `No ${tabs.find((t) => t.key === tab)?.label.toLowerCase() ?? "items"} yet.`;

  return (
    <PublicLayout>
      <PageHero
        title="News & Events"
        subtitle="Official updates, festival dates, and notices from the Tourism Commission."
      />
      <section className="max-w-5xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  tab === key
                    ? "bg-brand text-white border-brand"
                    : "bg-white border-border hover:border-brand"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {(tab === "All" || tab === "Event") && (
            <div className="flex gap-1 rounded-full border border-border p-1 bg-white">
              {views.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    view === v ? "bg-brand text-white" : "text-ink-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        {showCalendar ? (
          <EventsCalendar
            events={events}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
          />
        ) : filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-12">{emptyMessage}</p>
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
