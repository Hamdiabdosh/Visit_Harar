export type OptimizeImageOptions = {
  width?: number;
  quality?: string | number;
  format?: string;
};

export function isCloudinaryUrl(url: string) {
  return /(^|\/\/)res\.cloudinary\.com\//.test(url) && url.includes("/upload/");
}

export function isLocalMediaUrl(url: string) {
  if (url.startsWith("/uploads/")) return true;
  try {
    return new URL(url).pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

export function isMediaUrl(url: string) {
  return isLocalMediaUrl(url) || isCloudinaryUrl(url);
}

/**
 * Cloudinary URLs get on-the-fly transforms. Local VPS uploads are served as-is.
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
  return url.replace("/upload/", `/upload/${transformation}/`);
}

export function downloadImageUrl(url: string): string {
  if (isLocalMediaUrl(url)) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}download=1`;
  }
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
