import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { GalleryThumb } from "@/components/public/GalleryThumb";
import { GalleryPageSkeleton } from "@/components/public/GallerySkeletons";
import {
  getPublishedAlbums,
  getPublishedGalleryItems,
  type PublishedGalleryItemDto,
} from "@/lib/gallery-fns";
import { optimizeImage } from "@/lib/media-url";
import { buildHeadAsync } from "@/lib/metadata";
import { Images, LayoutGrid } from "lucide-react";

const GalleryLightbox = lazy(() =>
  import("@/components/public/GalleryLightbox").then((m) => ({
    default: m.GalleryLightbox,
  })),
);

type GalleryView = "photos" | "albums";

export const Route = createFileRoute("/gallery")({
  validateSearch: (search: Record<string, unknown>) => ({
    view: search.view === "albums" ? ("albums" as const) : ("photos" as const),
  }),
  loaderDeps: ({ search }) => ({ view: search.view }),
  loader: async ({ deps }) => {
    const albums = await getPublishedAlbums();
    if (deps.view === "albums") {
      return { albums, photos: [] as PublishedGalleryItemDto[] };
    }
    const photos = await getPublishedGalleryItems();
    return { albums, photos };
  },
  pendingComponent: GalleryPageSkeleton,
  head: async () =>
    buildHeadAsync({
      title: "Photo Gallery",
      description: "Visual stories from inside the walls of Harar Jugol.",
      canonicalPath: "/gallery",
    }),
  component: GalleryPage,
});

function GalleryTabs({
  view,
  photoCount,
  albumCount,
  onChange,
}: {
  view: GalleryView;
  photoCount: number;
  albumCount: number;
  onChange: (view: GalleryView) => void;
}) {
  const tabs: { id: GalleryView; label: string; count: number; icon: typeof Images }[] =
    [
      { id: "photos", label: "Photos", count: photoCount, icon: Images },
      { id: "albums", label: "Albums", count: albumCount, icon: LayoutGrid },
    ];

  return (
    <div
      role="tablist"
      aria-label="Gallery views"
      className="inline-flex p-1 rounded-full bg-surface border border-border"
    >
      {tabs.map(({ id, label, count, icon: Icon }) => {
        const selected = view === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`gallery-panel-${id}`}
            id={`gallery-tab-${id}`}
            onClick={() => onChange(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              selected
                ? "bg-white text-brand shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden />
            {label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selected ? "bg-brand/10 text-brand" : "bg-white text-ink-muted"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function GalleryPage() {
  const { albums, photos } = Route.useLoaderData();
  const { view } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  function setView(next: GalleryView) {
    void navigate({ search: { view: next }, replace: true });
  }

  const photoCount =
    photos.length > 0
      ? photos.length
      : albums.reduce((sum, album) => sum + album.item_count, 0);
  const isEmpty = albums.length === 0 && photoCount === 0;

  return (
    <PublicLayout>
      <PageHero
        title="Photo Gallery"
        subtitle="Visual stories from inside the walls."
      />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        {isEmpty ? (
          <div className="bg-white rounded-lg border border-border p-10 text-center max-w-lg mx-auto">
            <h2 className="font-serif text-xl font-bold">No albums yet</h2>
            <p className="text-ink-muted mt-2 text-sm">
              Photo albums will appear here once the commission publishes them.
            </p>
            <Link
              to="/"
              className="inline-flex mt-6 text-sm font-semibold text-brand hover:text-gold transition-colors"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-8">
              <GalleryTabs
                view={view}
                photoCount={photoCount}
                albumCount={albums.length}
                onChange={setView}
              />
            </div>

            {view === "photos" ? (
              <div
                id="gallery-panel-photos"
                role="tabpanel"
                aria-labelledby="gallery-tab-photos"
              >
                {photos.length === 0 ? (
                  <div className="bg-white rounded-lg border border-border p-10 text-center max-w-lg mx-auto">
                    <h2 className="font-serif text-lg font-bold">No photos yet</h2>
                    <p className="text-ink-muted mt-2 text-sm">
                      Published photos from all albums will appear here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setView("albums")}
                      className="inline-flex mt-6 text-sm font-semibold text-brand hover:text-gold transition-colors"
                    >
                      Browse albums
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-ink-muted text-center mb-6">
                      {photos.length}{" "}
                      {photos.length === 1 ? "photo" : "photos"} across{" "}
                      {albums.length}{" "}
                      {albums.length === 1 ? "album" : "albums"} — tap to
                      enlarge
                    </p>
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-3 [&>*]:mb-2 sm:[&>*]:mb-3">
                      {photos.map((photo, i) => (
                        <div key={photo.id} className="break-inside-avoid">
                          <GalleryThumb
                            url={photo.url}
                            thumbnail_url={photo.thumbnail_url}
                            caption={photo.caption}
                            alt={photo.alt_text}
                            type={photo.type}
                            albumTitle={photo.album_title}
                            onClick={() => setLightboxIndex(i)}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div
                id="gallery-panel-albums"
                role="tabpanel"
                aria-labelledby="gallery-tab-albums"
              >
                {albums.length === 0 ? (
                  <div className="bg-white rounded-lg border border-border p-10 text-center max-w-lg mx-auto">
                    <h2 className="font-serif text-lg font-bold">No albums yet</h2>
                    <p className="text-ink-muted mt-2 text-sm">
                      Albums will appear here once they are published.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {albums.map((a) => (
                      <Link
                        key={a.id}
                        to="/gallery/$id"
                        params={{ id: a.id }}
                        aria-label={`Open album: ${a.title}, ${a.item_count} ${a.item_count === 1 ? "photo" : "photos"}`}
                        className="group rounded-xl overflow-hidden border border-border bg-white hover:shadow-lg hover:border-brand/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        <div className="aspect-square bg-surface relative overflow-hidden">
                          {a.cover_image ? (
                            <img
                              src={
                                optimizeImage(a.cover_image, { width: 400 }) ??
                                a.cover_image
                              }
                              alt=""
                              aria-hidden
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div
                              className="absolute inset-0 bg-gradient-to-br from-brand/20 via-gold/10 to-surface"
                              aria-hidden
                            />
                          )}
                          <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-[10px] bg-black/60 text-white font-semibold">
                            {a.item_count === 1
                              ? "1 photo"
                              : `${a.item_count} photos`}
                          </span>
                        </div>
                        <div className="p-3">
                          <h3 className="font-serif text-sm font-bold group-hover:text-brand transition-colors line-clamp-2">
                            {a.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {lightboxIndex >= 0 && (
        <Suspense fallback={null}>
          <GalleryLightbox
            items={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(-1)}
          />
        </Suspense>
      )}
    </PublicLayout>
  );
}
