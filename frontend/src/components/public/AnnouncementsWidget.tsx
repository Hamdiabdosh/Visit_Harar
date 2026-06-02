import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getLatestAnnouncements } from '@/lib/announcements-fns'
import { AnnouncementCard } from '@/components/public/AnnouncementCard'

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function AnnouncementsWidget() {
  const { data: items = [] } = useQuery({
    queryKey: ['public', 'announcements', 'latest'],
    queryFn: () => getLatestAnnouncements({ data: 3 }),
    retry: false,
  })

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Latest</div>
            <h2 className="font-serif text-3xl font-bold">News & Events</h2>
          </div>
          <Link to="/news" className="text-sm font-semibold text-brand hover:text-gold">
            View all →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((a) => (
            <AnnouncementCard
              key={a.id}
              slug={a.slug}
              title={a.title}
              type={a.type}
              published_at={a.published_at}
              cover_image={a.cover_image}
              excerpt={stripHtml(a.body ?? '').slice(0, 140) || 'Read more…'}
              pinned={a.is_pinned}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

