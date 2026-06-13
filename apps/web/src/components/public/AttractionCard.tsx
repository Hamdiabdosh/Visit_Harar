import { Link } from "@tanstack/react-router";
import {
  categoryColor,
  categoryGradient,
  type AttractionCategory,
} from "@/lib/attraction-styles";
import { optimizeImage } from "@/lib/media-url";

export type AttractionCardData = {
  title: string;
  slug: string;
  category: AttractionCategory;
  short_desc: string | null;
  image: string | null;
};

export function AttractionCard({
  title,
  slug,
  category,
  short_desc,
  image,
}: AttractionCardData) {
  const bg = image ? optimizeImage(image, { width: 1200 }) : null;
  return (
    <Link
      to="/attractions/$slug"
      params={{ slug }}
      className="group rounded-lg overflow-hidden border border-border bg-white hover:shadow-lg transition-shadow"
    >
      <div
        className={`aspect-[4/3] bg-gradient-to-br ${categoryGradient[category]} relative bg-cover bg-center`}
        style={bg ? { backgroundImage: `url(${bg})` } : undefined}
      >
        {!image && <div className="absolute inset-0 bg-black/10" />}
        <span className="absolute bottom-3 left-3 px-2 py-1 rounded text-[10px] uppercase tracking-wider bg-black/40 text-white backdrop-blur-sm">
          {category}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-serif text-xl font-bold text-ink leading-snug group-hover:text-brand transition-colors">
            {title}
          </h3>
          <span
            className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-medium ${categoryColor[category]}`}
          >
            {category}
          </span>
        </div>
        {short_desc && (
          <p className="text-sm text-ink-muted line-clamp-2">{short_desc}</p>
        )}
      </div>
    </Link>
  );
}
