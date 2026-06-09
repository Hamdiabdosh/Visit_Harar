import { getPublishedHero } from "@/lib/hero-fns";

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };
type LinkTag = { rel: string; href: string };

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
};

const DEFAULT_TITLE = "Visit Harar — Official Tourism Website";
const DEFAULT_DESCRIPTION =
  "Discover Harar, Ethiopia's UNESCO World Heritage City of Saints. Plan your visit with the official Harari Tourism Bureau.";

/** Public site origin for canonical/OG URLs (safe in route `head` on server + client). */
function publicAppOrigin() {
  return import.meta.env.VITE_APP_URL?.replace(/\/+$/, "") ?? "";
}

function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://"))
    return pathOrUrl;
  const base = publicAppOrigin();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return base ? `${base}${path}` : path;
}

export function buildHead(overrides?: BuildMetadataOverrides): {
  meta: MetaTag[];
  links: LinkTag[];
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
  ];

  if (ogImage) meta.push({ property: "og:image", content: ogImage });
  const links: LinkTag[] = canonical
    ? [{ rel: "canonical", href: canonical }]
    : [];

  return { meta, links };
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
