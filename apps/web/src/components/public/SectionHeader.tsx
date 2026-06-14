export function SectionHeader({
  title,
  subtitle,
  align = "left",
  eyebrow,
  className = "",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  eyebrow?: string;
  className?: string;
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  return (
    <div className={`max-w-2xl mb-12 ${alignClass} ${className}`}>
      {eyebrow ? (
        <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-ink-muted mt-3 leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  );
}
