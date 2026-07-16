import { getPublishedHero } from "@/lib/hero-fns";
import { toMediaSrc } from "@/lib/media-url";
import { ORG_NAME } from "@/lib/org";

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };
type LinkTag = { rel: string; href: string };
type ScriptTag = {
  type?: string;
  children?: string;
  src?: string;
  async?: boolean;
};

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFromHtml(html: string | null | undefined, max = 160) {
  if (!html) return undefined;
  const text = stripHtml(html);
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export type BuildMetadataOverrides = {
  title?: string;
  description?: string;
  ogImage?: string | null;
  canonicalPath?: string;
  noindex?: boolean;
  /** Extra head scripts (e.g. JSON-LD). */
  scripts?: ScriptTag[];
};

const DEFAULT_TITLE = "Visit Harar — Official Tourism Website";
const DEFAULT_DESCRIPTION =
  `Discover Harar, Ethiopia's UNESCO World Heritage City of Saints. Plan your visit with the official ${ORG_NAME}.`;

/** Public site origin for canonical/OG URLs (safe in route `head` on server + client). */
export function publicAppOrigin() {
  return import.meta.env.VITE_APP_URL?.replace(/\/+$/, "") ?? "";
}

export function absoluteUrl(pathOrUrl: string) {
  // Rewrite stale absolute /uploads hosts, then absolutize for OG/canonical.
  const normalized = toMediaSrc(pathOrUrl) ?? pathOrUrl;
  if (normalized.startsWith("http://") || normalized.startsWith("https://"))
    return normalized;
  const base = publicAppOrigin();
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return base ? `${base}${path}` : path;
}

export function buildHead(overrides?: BuildMetadataOverrides): {
  meta: MetaTag[];
  links: LinkTag[];
  scripts?: ScriptTag[];
} {
  const title = overrides?.title
    ? `${overrides.title} — Visit Harar`
    : DEFAULT_TITLE;
  const description = overrides?.description ?? DEFAULT_DESCRIPTION;

  const ogImage = overrides?.ogImage ?? null;

  const canonical = overrides?.canonicalPath
    ? absoluteUrl(overrides.canonicalPath)
    : undefined;

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Visit Harar" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  if (overrides?.noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  if (canonical) {
    meta.push({ property: "og:url", content: canonical });
  }

  if (ogImage) {
    const imageUrl = absoluteUrl(ogImage);
    meta.push({ property: "og:image", content: imageUrl });
    meta.push({ name: "twitter:image", content: imageUrl });
  }

  const links: LinkTag[] = canonical
    ? [{ rel: "canonical", href: canonical }]
    : [];

  const scripts = overrides?.scripts?.length
    ? overrides.scripts
    : undefined;

  return { meta, links, ...(scripts ? { scripts } : {}) };
}

/** Like buildHead, but loads published hero background as default og:image when none is set. */
export async function buildHeadAsync(overrides?: BuildMetadataOverrides) {
  let ogImage = overrides?.ogImage ?? null;
  if (!ogImage) {
    const hero = await getPublishedHero();
    ogImage = hero?.background_image ?? null;
  }
  return buildHead({ ...overrides, ogImage });
}
