import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { getAnnouncementBySlug } from "@/lib/announcements-fns";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/news/$id")({
  loader: async ({ params }) => {
    // Back-compat route: treat `id` as the announcement slug.
    const item = await getAnnouncementBySlug({ data: params.id });
    if (!item) throw notFound();
    return { item };
  },
  component: NewsDetailById,
});

function formatDate(input: Date | null) {
  if (!input) return "";
  return input.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function NewsDetailById() {
  const { item } = Route.useLoaderData();
  const safeBody = DOMPurify.sanitize(item.body ?? "");

  return (
    <PublicLayout>
      <div className="h-[40vh] bg-surface relative overflow-hidden">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-gold/10 to-surface" />
        )}
      </div>
      <article className="max-w-3xl mx-auto px-5 lg:px-8 -mt-24 relative pb-20">
        <div className="bg-white rounded-lg border border-border shadow-lg p-10">
          <Link
            to="/news"
            className="text-ink-muted text-sm inline-flex items-center gap-1 hover:text-brand mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> All news
          </Link>
          <div className="flex items-center gap-2 text-xs mb-3">
            <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand font-semibold">
              {item.type}
            </span>
            <span className="text-ink-muted">
              {formatDate(item.published_at)}
            </span>
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight">
            {item.title}
          </h1>
          {item.type === "Event" &&
            (item.event_date || item.event_location) && (
              <div className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm">
                <div className="font-semibold">Event details</div>
                <div className="text-ink-muted mt-1">
                  {item.event_date ? <div>Date: {item.event_date}</div> : null}
                  {item.event_location ? (
                    <div>Location: {item.event_location}</div>
                  ) : null}
                </div>
              </div>
            )}
          <div
            className="mt-6 text-ink-muted leading-relaxed prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: safeBody }}
          />
        </div>
      </article>
    </PublicLayout>
  );
}
