import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { defaultHeroInput, dtoToPreviewProps } from "@/lib/hero-map";
import type { HeroDto } from "@/lib/hero-map";
import type { HeroInput } from "@/lib/validators/hero";
import { optimizeImage } from "@/lib/cloudinary-url";

export type HeroSectionProps = {
  hero?: Partial<HeroInput> | HeroDto | null;
  compact?: boolean;
};

function CtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function HeroSection({ hero, compact }: HeroSectionProps) {
  const p = dtoToPreviewProps(hero ?? defaultHeroInput);
  const minH = compact ? "min-h-[480px]" : "min-h-screen";
  const bg = p.backgroundImage
    ? optimizeImage(p.backgroundImage, { width: 2200 })
    : null;

  return (
    <section
      className={`relative ${minH} flex items-center text-white overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-[#1a3a24] to-[#3a2e1a]" />
      {bg ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        />
      ) : null}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(30deg, transparent 0 22px, rgba(200,169,106,0.5) 22px 23px), repeating-linear-gradient(-30deg, transparent 0 22px, rgba(200,169,106,0.5) 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, rgba(200,169,106,0.3) 22px 23px)",
        }}
      />
      <div
        className="absolute inset-0 bg-black/15 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25 pointer-events-none"
        aria-hidden
      />

      <div
        className={`relative max-w-7xl mx-auto px-5 lg:px-8 w-full ${compact ? "py-12" : "pt-32 pb-24"}`}
      >
        {p.badgeText ? (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/5 backdrop-blur text-xs font-medium tracking-wide">
            🌍 {p.badgeText}
          </span>
        ) : null}
        <h1
          className={`font-serif font-bold mt-6 leading-[1.05] max-w-3xl ${compact ? "text-2xl" : "text-5xl md:text-7xl"}`}
        >
          {p.headline}{" "}
          {p.headlineItalic ? (
            <span className="italic text-gold font-medium whitespace-pre-line">
              {p.headlineItalic}
            </span>
          ) : null}
        </h1>
        {p.subheading ? (
          <p
            className={`mt-6 text-white/80 max-w-xl leading-relaxed ${compact ? "text-[10px]" : "text-base md:text-lg"}`}
          >
            {p.subheading}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          {p.ctaPrimaryText && p.ctaPrimaryUrl ? (
            <CtaLink
              href={p.ctaPrimaryUrl}
              className="px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors"
            >
              {p.ctaPrimaryText}
            </CtaLink>
          ) : null}
          {p.ctaGhostText && p.ctaGhostUrl ? (
            <CtaLink
              href={p.ctaGhostUrl}
              className="px-6 py-3 rounded-md border border-white/40 text-white hover:bg-white/10 font-medium transition-colors inline-flex items-center gap-2"
            >
              {p.ctaGhostText} <ArrowRight className="w-4 h-4" />
            </CtaLink>
          ) : null}
        </div>

        <div
          className={`grid grid-cols-3 max-w-2xl gap-6 border-t border-white/15 pt-8 ${compact ? "mt-8" : "mt-20"}`}
        >
          {p.stats.map((s) => (
            <div key={s.label}>
              <div
                className={`font-serif text-gold font-bold ${compact ? "text-sm" : "text-3xl md:text-4xl"}`}
              >
                {s.number}
              </div>
              <div
                className={`uppercase tracking-wider text-white/60 mt-1 ${compact ? "text-[8px]" : "text-xs"}`}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
