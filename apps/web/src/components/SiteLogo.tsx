export const SITE_LOGO_EMBLEM_SRC = "/brand/logo-emblem.webp";
export const SITE_LOGO_HORIZONTAL_SRC = "/brand/logo-horizontal-800.webp";

const emblemSizeClass = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-14 w-14",
} as const;

const horizontalSizeClass = {
  sm: "h-8 w-auto max-w-[160px]",
  md: "h-9 w-auto max-w-[200px]",
  lg: "h-12 w-auto max-w-[280px]",
} as const;

type SiteLogoProps = {
  variant?: "emblem" | "horizontal";
  size?: keyof typeof emblemSizeClass;
  className?: string;
};

export function SiteLogo({
  variant = "emblem",
  size = "md",
  className,
}: SiteLogoProps) {
  if (variant === "horizontal") {
    return (
      <img
        src={SITE_LOGO_HORIZONTAL_SRC}
        alt="Harari Tourism Commission"
        width={200}
        height={48}
        className={`${horizontalSizeClass[size]} object-contain shrink-0 ${className ?? ""}`}
      />
    );
  }

  const px = size === "lg" ? 56 : size === "sm" ? 36 : 40;

  return (
    <img
      src={SITE_LOGO_EMBLEM_SRC}
      alt="Harari Tourism Commission"
      width={px}
      height={px}
      className={`${emblemSizeClass[size]} object-contain shrink-0 ${className ?? ""}`}
    />
  );
}
