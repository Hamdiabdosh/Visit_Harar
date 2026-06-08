import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { getAttractionBySlug } from "@/lib/attractions-fns";
import { fullDescParagraphs } from "@/lib/attraction-map";
import {
  categoryColor,
  categoryGradient,
  isAttractionCategory,
} from "@/lib/attraction-styles";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { optimizeImage } from "@/lib/cloudinary-url";
import { buildHeadAsync, excerptFromHtml } from "@/lib/metadata";

export const Route = createFileRoute("/attractions/$slug")({
  loader: async ({ params }) => {
    const item = await getAttractionBySlug({ data: params.slug });
    if (!item) throw notFound();
    return { item };
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
  const { item } = Route.useLoaderData();
  const cat = isAttractionCategory(item.category) ? item.category : "Heritage";
  const paragraphs = fullDescParagraphs(item.full_desc);
  const isHtml = Boolean(
    item.full_desc && /<\/?[a-z][\s\S]*>/i.test(item.full_desc),
  );
  const safeHtml = isHtml ? DOMPurify.sanitize(item.full_desc ?? "") : null;
  const heroBg = item.image ? optimizeImage(item.image, { width: 1600 }) : null;

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
