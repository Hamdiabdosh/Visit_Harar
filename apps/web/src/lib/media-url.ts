export type OptimizeImageOptions = {
  width?: number;
  quality?: string | number;
  format?: string;
};

export function isCloudinaryUrl(url: string) {
  return /(^|\/\/)res\.cloudinary\.com\//.test(url) && url.includes("/upload/");
}

/** Drop router junk like `?denied=false` from local media paths. */
function uploadsPathOnly(pathWithOptionalQuery: string): string {
  const q = pathWithOptionalQuery.indexOf("?");
  const path =
    q === -1 ? pathWithOptionalQuery : pathWithOptionalQuery.slice(0, q);
  return path.startsWith("/uploads/") ? path : pathWithOptionalQuery;
}

/**
 * Recover `/uploads/…` from TanStack resolvePath mangling:
 * `/admin` + `https://host/uploads/…` → `/admin/https:/host/uploads/…`
 * (cleanPath collapses `://` to `:/`).
 */
function uploadsFromMangled(url: string): string | null {
  const m = url.match(/\/uploads\/[^?#\s]*/);
  if (!m) return null;
  if (
    url.includes("https:/") ||
    url.includes("http:/") ||
    url.startsWith("/admin/")
  ) {
    return m[0];
  }
  return null;
}

/**
 * Strip host from local upload URLs so images load from the current origin.
 * Fixes DB rows saved with an old APP_URL host, and router-joined absolute URLs.
 */
export function toMediaSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return uploadsPathOnly(url);

  const recovered = uploadsFromMangled(url);
  if (recovered) return recovered;

  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/uploads/")) return u.pathname;
    // Single-slash scheme (`https:/host/…`) still parses; path may be wrong — try recover.
    const fromHref = uploadsFromMangled(u.href) ?? uploadsFromMangled(u.pathname);
    if (fromHref) return fromHref;
  } catch {
    /* not absolute */
  }

  // Relative `https:/host/uploads/…` (invalid absolute, path-relative to /admin)
  try {
    const u = new URL(url, "https://local.invalid/");
    if (u.pathname.startsWith("/uploads/")) return u.pathname;
    const fromPath = uploadsFromMangled(u.pathname);
    if (fromPath) return fromPath;
  } catch {
    /* give up */
  }

  return url;
}

export function isLocalMediaUrl(url: string) {
  const src = toMediaSrc(url) ?? url;
  if (src.startsWith("/uploads/")) return true;
  try {
    return new URL(src).pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

export function isMediaUrl(url: string) {
  return isLocalMediaUrl(url) || isCloudinaryUrl(url);
}

/** Derive the `-thumb.webp` sibling for locally stored WebP files. */
export function localThumbUrl(url: string | null | undefined) {
  const src = toMediaSrc(url);
  if (!src || !isLocalMediaUrl(src)) return null;
  if (/-thumb\.webp$/i.test(src)) return src;
  if (!/\.webp$/i.test(src)) return null;
  return src.replace(/\.webp$/i, "-thumb.webp");
}

/** Prefer an explicit thumbnail, then a derived local thumb, then Cloudinary resize. */
export function pickListImageUrl(
  url: string | null | undefined,
  thumbnailUrl?: string | null,
  width = 400,
) {
  const thumb = toMediaSrc(thumbnailUrl);
  if (thumb) return thumb;
  const derived = localThumbUrl(url);
  if (derived) return derived;
  const src = toMediaSrc(url);
  if (src && isCloudinaryUrl(src)) {
    return optimizeImage(src, { width }) ?? src;
  }
  return src;
}

/**
 * Cloudinary URLs get on-the-fly transforms. Local VPS uploads are served as-is.
 */
export function optimizeImage(
  url: string | null | undefined,
  options?: OptimizeImageOptions,
) {
  const src = toMediaSrc(url);
  if (!src) return null;
  if (!isCloudinaryUrl(src)) return src;

  const width = options?.width ?? 800;
  const quality = options?.quality ?? "auto";
  const format = options?.format ?? "auto";
  const transformation = `f_${format},q_${quality},w_${width}`;
  return src.replace("/upload/", `/upload/${transformation}/`);
}

export function downloadImageUrl(url: string): string {
  const src = toMediaSrc(url) ?? url;
  if (isLocalMediaUrl(src)) {
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}download=1`;
  }
  if (!isCloudinaryUrl(src)) return src;
  return src.replace("/upload/", "/upload/fl_attachment/");
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
