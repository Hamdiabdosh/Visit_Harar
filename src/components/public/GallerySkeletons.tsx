import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { Skeleton } from "@/components/ui/skeleton";

export function GalleryPageSkeleton() {
  return (
    <PublicLayout>
      <PageHero
        title="Photo Gallery"
        subtitle="Visual stories from inside the walls."
      />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex justify-center mb-8">
          <Skeleton className="h-10 w-56 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 mx-auto mb-6" />
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-3 [&>*]:mb-2 sm:[&>*]:mb-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export function GalleryAlbumSkeleton() {
  return (
    <PublicLayout>
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-5 lg:px-8">
        <Skeleton className="h-4 w-28 mb-4" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-5 w-full max-w-xl mt-3" />
        <Skeleton className="h-4 w-48 mt-2" />
        <div className="mt-8 columns-2 md:columns-3 lg:columns-4 gap-3 [&>*]:mb-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

export function AdminGalleryListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-white overflow-hidden"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-16" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminAlbumEditorSkeleton() {
  return (
    <>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="rounded-lg border border-border bg-white p-6">
          <Skeleton className="h-3 w-16 mb-4" />
          <Skeleton className="h-48 w-full rounded-lg border-2 border-dashed" />
        </div>
        <div className="rounded-lg border border-border bg-white p-6 space-y-4">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-white overflow-hidden"
          >
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
