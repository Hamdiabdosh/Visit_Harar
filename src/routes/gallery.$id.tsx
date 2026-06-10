import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { getPublishedAlbumItems } from "@/lib/gallery-fns";
import { ArrowLeft, Download, Expand } from "lucide-react";
import { GalleryThumb } from "@/components/public/GalleryThumb";
import { GalleryLightbox } from "@/components/public/GalleryLightbox";
import { triggerGalleryDownload } from "@/lib/gallery-lightbox";
import { buildHeadAsync } from "@/lib/metadata";

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

function AlbumDetail() {
  const { album, items } = Route.useLoaderData();
  const [index, setIndex] = useState<number>(-1);

  return (
    <PublicLayout>
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-5 lg:px-8">
        <Link
          to="/gallery"
          search={{ view: "albums" }}
          className="text-ink-muted text-sm inline-flex items-center gap-1 hover:text-brand mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> All albums
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
            search={{ view: "albums" }}
            className="inline-flex mt-6 text-sm font-semibold text-brand hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
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
                  albumTitle={album.title}
                  onClick={() => setIndex(i)}
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className="p-2 rounded-full bg-black/65 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    aria-label={`View full size: ${it.alt_text?.trim() || it.caption?.trim() || `Photo ${i + 1}`}`}
                    title="View full size"
                  >
                    <Expand className="w-4 h-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerGalleryDownload(it, i);
                    }}
                    className="p-2 rounded-full bg-black/65 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    aria-label={`Download: ${it.alt_text?.trim() || it.caption?.trim() || `Photo ${i + 1}`}`}
                    title="Download"
                  >
                    <Download className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GalleryLightbox
        items={items}
        index={index}
        onClose={() => setIndex(-1)}
      />
    </PublicLayout>
  );
}
