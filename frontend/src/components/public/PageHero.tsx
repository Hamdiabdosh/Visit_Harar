import { optimizeImage } from "@/lib/cloudinary-url";

export function PageHero({
  title,
  subtitle,
  backgroundImage,
  overlayOpacity = 0.55,
}: {
  title: string;
  subtitle?: string;
  backgroundImage?: string | null;
  overlayOpacity?: number;
}) {
  const bg = backgroundImage
    ? optimizeImage(backgroundImage, { width: 1600 })
    : null;

  return (
    <section className="relative pt-32 pb-16 text-white overflow-hidden">
      {bg ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-brand-dark" />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"
        style={{ opacity: overlayOpacity }}
      />
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,255,255,0.35) 14px 15px), repeating-linear-gradient(-45deg, transparent 0 14px, rgba(255,255,255,0.35) 14px 15px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold">{title}</h1>
        {subtitle ? (
          <p className="mt-3 text-white/75 max-w-2xl">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
