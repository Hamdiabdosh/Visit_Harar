export const SITE_LOGO_SRC = "/logo.webp";

const sizeClass = {
  sm: "w-9 h-9",
  md: "w-10 h-10",
  lg: "w-14 h-14",
} as const;

type SiteLogoProps = {
  size?: keyof typeof sizeClass;
  className?: string;
};

export function SiteLogo({ size = "md", className }: SiteLogoProps) {
  return (
    <img
      src={SITE_LOGO_SRC}
      alt="Visit Harar"
      width={size === "lg" ? 56 : size === "sm" ? 36 : 40}
      height={size === "lg" ? 56 : size === "sm" ? 36 : 40}
      className={`${sizeClass[size]} object-contain shrink-0 ${className ?? ""}`}
    />
  );
}
