import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { getGuideBySlug } from "@/lib/guides-fns";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft } from "lucide-react";
import { optimizeImage } from "@/lib/cloudinary-url";
import { buildHeadAsync, excerptFromHtml } from "@/lib/metadata";

export const Route = createFileRoute("/guides/$slug")({
  loader: async ({ params }) => {
    const item = await getGuideBySlug({ data: params.slug });
    if (!item) throw notFound();
    return { item };
  },
  head: async ({ loaderData }) => {
    const item = loaderData?.item;
    return buildHeadAsync({
      title: item?.name ?? "Guide",
      description:
        excerptFromHtml(item?.bio) ??
        `Licensed guide in Harar — ${item?.languages?.join(", ") || "multilingual"} tours.`,
      ogImage: item?.photo,
      canonicalPath: item ? `/guides/${item.slug}` : "/guides",
    });
  },
  component: GuideDetail,
});

function GuideDetail() {
  const { item } = Route.useLoaderData();
  const safeBio = DOMPurify.sanitize(item.bio ?? "");
  const photoSrc = item.photo
    ? optimizeImage(item.photo, { width: 600 })
    : null;

  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-surface">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <Link
            to="/guides"
            className="text-ink-muted text-sm inline-flex items-center gap-1 hover:text-brand mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> All guides
          </Link>
          <div className="bg-white rounded-lg border border-border p-10 grid md:grid-cols-[120px_1fr] gap-8">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt=""
                className="w-[120px] h-[120px] rounded-full object-cover"
              />
            ) : (
              <span className="w-[120px] h-[120px] rounded-full bg-brand text-white grid place-items-center font-serif text-4xl font-bold">
                {item.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
            <div>
              <h1 className="font-serif text-4xl font-bold">{item.name}</h1>
              {item.license_number ? (
                <span className="inline-block mt-2 px-2 py-1 rounded bg-brand/10 text-brand text-xs font-semibold">
                  Licensed #{item.license_number}
                </span>
              ) : null}
              <div
                className="mt-5 text-ink-muted leading-relaxed prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{ __html: safeBio }}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border text-sm">
                <Info
                  label="Languages"
                  value={item.languages.join(", ") || "—"}
                />
                <Info
                  label="Specialties"
                  value={item.specialties.join(", ") || "—"}
                />
                <Info
                  label="Experience"
                  value={
                    item.experience_years != null
                      ? `${item.experience_years} years`
                      : "—"
                  }
                />
                <Info
                  label="Availability"
                  value={item.is_available ? "Available" : "Unavailable"}
                />
              </div>
              <Link
                to="/book"
                search={{ guideId: item.id } as never}
                className="mt-8 inline-flex items-center px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors"
              >
                Book This Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
        {label}
      </div>
      <div className="text-ink mt-1">{value}</div>
    </div>
  );
}
