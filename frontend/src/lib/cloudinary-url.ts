export type OptimizeImageOptions = {
  width?: number;
  quality?: string | number;
  format?: string;
};

export function isCloudinaryUrl(url: string) {
  return /(^|\/\/)res\.cloudinary\.com\//.test(url) && url.includes("/upload/");
}

/**
 * Adds Cloudinary transformations to an existing Cloudinary URL.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function optimizeImage(
  url: string | null | undefined,
  options?: OptimizeImageOptions,
) {
  if (!url) return url ?? null;
  if (!isCloudinaryUrl(url)) return url;

  const width = options?.width ?? 800;
  const quality = options?.quality ?? "auto";
  const format = options?.format ?? "auto";

  const transformation = `f_${format},q_${quality},w_${width}`;

  // Cloudinary URL format:
  // https://res.cloudinary.com/<cloud>/image/upload/<transformations>/<public_id>.<ext>
  // If transformations already exist, we prepend ours so it remains predictable.
  return url.replace("/upload/", `/upload/${transformation}/`);
}

/** Cloudinary URL that triggers browser download (Content-Disposition: attachment). */
export function downloadImageUrl(url: string): string {
  if (!isCloudinaryUrl(url)) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
}

export function galleryDownloadFilename(
  caption: string | null | undefined,
  alt: string | null | undefined,
  index: number,
): string {
  const base =
    caption?.trim() ||
    alt?.trim() ||
    `harar-gallery-${String(index + 1).padStart(2, "0")}`;
  const safe = base.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
  return safe.includes(".") ? safe : `${safe}.jpg`;
}
