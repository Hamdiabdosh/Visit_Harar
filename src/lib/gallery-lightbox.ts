import type { GalleryItemDto } from "@/lib/gallery-fns";
import {
  downloadImageUrl,
  galleryDownloadFilename,
  optimizeImage,
} from "@/lib/media-url";

export function buildGallerySlides(items: GalleryItemDto[]) {
  return items.map((it, i) => {
    const downloadMeta = {
      url:
        it.type === "video" ? it.url : downloadImageUrl(it.url),
      filename: galleryDownloadFilename(it.caption, it.alt_text, i),
    };

    if (it.type === "video") {
      return {
        type: "video" as const,
        sources: [{ src: it.url, type: "video/mp4" }],
        description: it.caption?.trim() || undefined,
        title: it.alt_text?.trim() || undefined,
        download: downloadMeta,
      };
    }
    const src = optimizeImage(it.url, { width: 1600 }) ?? it.url;
    return {
      src,
      description: it.caption?.trim() || undefined,
      title: it.alt_text?.trim() || undefined,
      download: downloadMeta,
    };
  });
}

export function triggerGalleryDownload(item: GalleryItemDto, index: number) {
  if (item.type === "video") {
    window.open(item.url, "_blank", "noopener,noreferrer");
    return;
  }
  const link = document.createElement("a");
  link.href = downloadImageUrl(item.url);
  link.download = galleryDownloadFilename(item.caption, item.alt_text, index);
  link.rel = "noopener noreferrer";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
