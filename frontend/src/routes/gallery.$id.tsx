import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { getPublishedAlbumItems } from "@/lib/gallery-fns";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { ArrowLeft, Download, Expand } from "lucide-react";
import { GalleryThumb } from "@/components/public/GalleryThumb";
import {
  downloadImageUrl,
  galleryDownloadFilename,
  optimizeImage,
} from "@/lib/cloudinary-url";
import { buildHeadAsync } from "@/lib/metadata";
import type { GalleryItemDto } from "@/lib/gallery-fns";

export const Route = createFileRoute("/gallery/$id")({
  loader: async ({ params }) => {
    const data = await getPublishedAlbumItems({ data: params.id });
    if (!data) throw notFound();
    return data;
  },
  head: async ({ loaderData }) => {
    const album = loaderData?.album;
    return buildHeadAsync({
      title: album?.title ?? "Gallery",
      description:
        album?.description ??
        `Photo album from Harar — ${album?.title ?? "Gallery"}.`,
      ogImage: album?.cover_image,
      canonicalPath: album ? `/gallery/${album.id}` : "/gallery",
    });
  },
  component: AlbumDetail,
});

function buildSlides(items: GalleryItemDto[]) {
  return items.map((it) => {
    if (it.type === "video") {
      return {
        type: "video" as const,
        sources: [{ src: it.url, type: "video/mp4" }],
        description: it.caption?.trim() || undefined,
        title: it.alt_text?.trim() || undefined,
      };
    }
    const src = optimizeImage(it.url, { width: 1600 }) ?? it.url;
    return {
      src,
      description: it.caption?.trim() || undefined,
      title: it.alt_text?.trim() || undefined,
    };
  });
}

function triggerDownload(item: GalleryItemDto, index: number) {
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

function AlbumDetail() {
  const { album, items } = Route.useLoaderData();
  const [index, setIndex] = useState<number>(-1);

  const slides = useMemo(() => buildSlides(items), [items]);
  const activeItem = index >= 0 ? items[index] : null;

  const onDownloadActive = useCallback(() => {
    if (activeItem) triggerDownload(activeItem, index);
  }, [activeItem, index]);

  return (
    <PublicLayout>
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-5 lg:px-8">
        <Link
          to="/gallery"
          className="text-ink-muted text-sm inline-flex items-center gap-1 hover:text-brand mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> All albums
        </Link>
        <h1 className="font-serif text-4xl font-bold">{album.title}</h1>
        {album.description ? (
          <p className="text-ink-muted mt-3 max-w-2xl text-lg">
            {album.description}
          </p>
        ) : null}
        <p className="text-sm text-ink-muted mt-2">
          {items.length === 0
            ? "No photos in this album yet."
            : `${items.length} ${items.length === 1 ? "photo" : "photos"} — click to enlarge, use download to save`}
        </p>

        {items.length === 0 ? (
          <Link
            to="/gallery"
            className="inline-flex mt-6 text-sm font-semibold text-brand hover:text-gold"
          >
            Browse other albums
          </Link>
        ) : (
          <div className="mt-8 columns-2 md:columns-3 lg:columns-4 gap-3 [&>*]:mb-3">
            {items.map((it, i) => (
              <div key={it.id} className="break-inside-avoid relative group">
                <GalleryThumb
                  url={it.url}
                  thumbnail_url={it.thumbnail_url}
                  caption={it.caption}
                  alt={it.alt_text}
                  type={it.type}
                  onClick={() => setIndex(i)}
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className="p-2 rounded-full bg-black/65 text-white hover:bg-black/80"
                    aria-label="View full size"
                    title="View full size"
                  >
                    <Expand className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerDownload(it, i);
                    }}
                    className="p-2 rounded-full bg-black/65 text-white hover:bg-black/80"
                    aria-label="Download"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={slides}
        plugins={[Captions, Video]}
        toolbar={{
          buttons: [
            <button
              key="download"
              type="button"
              className="yarl__button"
              aria-label="Download image"
              title="Download image"
              onClick={onDownloadActive}
            >
              <Download className="w-5 h-5" />
            </button>,
            "close",
          ],
        }}
      />
    </PublicLayout>
  );
}
