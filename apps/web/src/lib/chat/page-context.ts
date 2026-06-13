import type { ChatPageContext } from "@/lib/validators/chat";

export function derivePageContext(pathname: string): ChatPageContext {
  if (pathname === "/") {
    return { pathname, pageType: "home" };
  }

  const attractionMatch = pathname.match(/^\/attractions\/([^/]+)$/);
  if (attractionMatch) {
    return {
      pathname,
      pageType: "attraction",
      entitySlug: attractionMatch[1],
    };
  }

  const guideMatch = pathname.match(/^\/guides\/([^/]+)$/);
  if (guideMatch) {
    return {
      pathname,
      pageType: "guide",
      entitySlug: guideMatch[1],
    };
  }

  const newsMatch = pathname.match(/^\/news\/([^/]+)$/);
  if (newsMatch) {
    return {
      pathname,
      pageType: "news",
      entitySlug: newsMatch[1],
    };
  }

  const galleryMatch = pathname.match(/^\/gallery\/([^/]+)$/);
  if (galleryMatch) {
    return {
      pathname,
      pageType: "gallery",
      entitySlug: galleryMatch[1],
    };
  }

  if (pathname === "/book" || pathname.startsWith("/book/")) {
    return { pathname, pageType: "book" };
  }

  if (
    pathname === "/about" ||
    pathname === "/culture" ||
    pathname === "/plan-your-trip" ||
    pathname === "/contact"
  ) {
    return { pathname, pageType: "static" };
  }

  if (pathname === "/gallery") {
    return { pathname, pageType: "gallery" };
  }

  return { pathname, pageType: "other" };
}
