import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { PublicLayout } from '@/components/PublicLayout'
import { getPublishedAlbumItems } from '@/lib/gallery-fns'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { ArrowLeft } from 'lucide-react'
import { optimizeImage } from '@/lib/cloudinary-url'
import { buildHeadAsync } from '@/lib/metadata'

export const Route = createFileRoute('/gallery/$id')({
  loader: async ({ params }) => {
    const data = await getPublishedAlbumItems({ data: params.id })
    if (!data) throw notFound()
    return data
  },
  head: async ({ loaderData }) => {
    const album = loaderData?.album
    return buildHeadAsync({
      title: album?.title ?? 'Gallery',
      description: album?.description ?? `Photo album from Harar — ${album?.title ?? 'Gallery'}.`,
      ogImage: album?.cover_image,
      canonicalPath: album ? `/gallery/${album.id}` : '/gallery',
    })
  },
  component: AlbumDetail,
})

function AlbumDetail() {
  const { album, items } = Route.useLoaderData()
  const [index, setIndex] = useState<number>(-1)

  const slides = useMemo(
    () =>
      items.map((it) => {
        if (it.type === 'video') {
          return { type: 'video' as const, sources: [{ src: it.url, type: 'video/mp4' }], description: it.caption ?? '' }
        }
        const src = optimizeImage(it.url, { width: 1600 }) ?? it.url
        return { src, description: it.caption ?? '' }
      }),
    [items],
  )

  return (
    <PublicLayout>
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-5 lg:px-8">
        <Link to="/gallery" className="text-ink-muted text-sm inline-flex items-center gap-1 hover:text-brand mb-4">
          <ArrowLeft className="w-4 h-4" /> All albums
        </Link>
        <h1 className="font-serif text-4xl font-bold">{album.title}</h1>
        {items.length === 0 ? (
          <p className="text-ink-muted mt-8">No items in this album yet.</p>
        ) : (
          <div className="mt-8 columns-2 md:columns-3 lg:columns-4 gap-3 [&>*]:mb-3">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setIndex(i)}
                className="block w-full rounded-lg overflow-hidden bg-surface group relative"
              >
                {it.type === 'video' ? (
                  <div className="h-56 grid place-items-center text-ink-muted border border-border">
                    Video
                  </div>
                ) : (
                  <img
                    src={optimizeImage(it.url, { width: 1200 }) ?? it.url}
                    alt={it.alt_text ?? ''}
                    className="w-full h-auto block"
                  />
                )}
                <span className="absolute inset-0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Lightbox open={index >= 0} close={() => setIndex(-1)} index={index} slides={slides as any} />
    </PublicLayout>
  )
}