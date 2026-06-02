import { optimizeImage } from '@/lib/cloudinary-url'
import type { MediaType } from '@/lib/types'

export type GalleryThumbData = {
  url: string
  thumbnail_url?: string | null
  caption?: string | null
  type: MediaType
}

export function GalleryThumb({ url, thumbnail_url, caption, type }: GalleryThumbData) {
  const src = optimizeImage(thumbnail_url ?? url, { width: 800 }) ?? (thumbnail_url ?? url)
  return (
    <div className="group relative overflow-hidden rounded-lg bg-surface border border-border">
      {type === 'video' ? (
        <div className="absolute inset-0">
          <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-black/60 text-white uppercase tracking-wider">
            Video
          </div>
        </div>
      ) : (
        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="aspect-[4/3]" />
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90">
        <div className="text-white text-xs line-clamp-2">{caption ?? ''}</div>
      </div>
      <div className="absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-gold transition-all" />
    </div>
  )
}

