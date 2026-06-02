import { Link } from '@tanstack/react-router'
import { optimizeImage } from '@/lib/cloudinary-url'

export type GuideCardData = {
  id: string
  slug: string
  name: string
  photo: string | null
  languages: string[]
  specialties: string[]
  experience_years: number | null
  is_available: boolean
}

export function GuideCard({
  id,
  slug,
  name,
  photo,
  languages,
  specialties,
  experience_years,
  is_available,
}: GuideCardData) {
  const src = photo ? optimizeImage(photo, { width: 400 }) : null
  return (
    <Link
      to="/guides/$slug"
      params={{ slug }}
      className={`rounded-lg border border-border bg-white p-6 hover:shadow-md transition-shadow ${
        is_available ? '' : 'opacity-70'
      }`}
    >
      <div className="flex items-center gap-4">
        {src ? (
          <img src={src} alt="" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <span className="w-16 h-16 rounded-full bg-brand text-white grid place-items-center font-serif text-xl font-bold">
            {name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-bold truncate">{name}</h3>
          {experience_years != null && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-semibold">
              {experience_years} years
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {languages.slice(0, 4).map((l) => (
          <span key={l} className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border">
            {l}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {specialties.slice(0, 4).map((s) => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-gold/15 text-amber-900">
            {s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-5">
        <span className="text-xs text-ink-muted inline-flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${is_available ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {is_available ? 'Available' : 'Unavailable'}
        </span>
        <span className="text-sm font-semibold text-brand">View →</span>
      </div>
      <div className="sr-only">{id}</div>
    </Link>
  )
}

