import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicLayout } from '@/components/PublicLayout'
import { PageHero } from '@/components/public/PageHero'
import { getPublishedAlbums } from '@/lib/gallery-fns'
import { galleryAlbums as mockAlbums } from '@/lib/harar-data'
import { optimizeImage } from '@/lib/cloudinary-url'
import { buildHeadAsync } from '@/lib/metadata'

export const Route = createFileRoute('/gallery')({
  loader: async () => {
    const albums = await getPublishedAlbums()
    return { albums }
  },
  head: async () =>
    buildHeadAsync({
      title: 'Photo Gallery',
      description: 'Visual stories from inside the walls of Harar Jugol.',
      canonicalPath: '/gallery',
    }),
  component: GalleryPage,
})

function GalleryPage() {
  const { albums } = Route.useLoaderData()
  const source = albums.length > 0 ? albums : mockAlbums.map((a) => ({
    id: a.id,
    title: a.title,
    cover_image: null as string | null,
    item_count: a.count,
  }))

  return (
    <PublicLayout>
      <PageHero title="Photo Gallery" subtitle="Visual stories from inside the walls." />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {source.map((a) => (
          <Link
            key={a.id}
            to="/gallery/$id"
            params={{ id: a.id }}
            className="group rounded-lg overflow-hidden border border-border bg-white hover:shadow-lg transition-shadow"
          >
            <div className="aspect-[4/3] bg-surface relative overflow-hidden">
              {a.cover_image ? (
                <img
                  src={optimizeImage(a.cover_image, { width: 1200 }) ?? a.cover_image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-gold/10 to-surface" />
              )}
              <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-white/90 text-ink font-semibold">
                {a.item_count} items
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg font-bold group-hover:text-brand transition-colors">
                {a.title}
              </h3>
            </div>
          </Link>
        ))}
      </section>
    </PublicLayout>
  )
}