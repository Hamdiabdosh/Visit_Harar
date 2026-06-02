import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicLayout } from '@/components/PublicLayout'
import { PageHero } from '@/components/public/PageHero'
import { getPublishedPage } from '@/lib/pages-fns'
import DOMPurify from 'isomorphic-dompurify'
import { ComingSoon } from '@/components/public/ComingSoon'
import { buildHeadAsync, excerptFromHtml } from '@/lib/metadata'

export const Route = createFileRoute('/plan-your-trip')({
  loader: async () => {
    const page = await getPublishedPage({ data: 'plan' })
    return { page }
  },
  head: async ({ loaderData }) => {
    const page = loaderData?.page
    const content = (page?.content ?? {}) as { getting_here?: string }
    return buildHeadAsync({
      title: page?.title ?? 'Plan Your Trip',
      description:
        excerptFromHtml(content.getting_here) ??
        'Transport, seasons, itineraries, and practical tips for visiting Harar.',
      ogImage: page?.hero_image,
      canonicalPath: '/plan-your-trip',
    })
  },
  component: PlanYourTrip,
})

function PlanYourTrip() {
  const { page } = Route.useLoaderData()

  if (!page) {
    return (
      <PublicLayout>
        <PageHero title="Plan Your Trip" subtitle="Transport, seasons, and suggested itineraries." />
        <ComingSoon backTo="/" />
      </PublicLayout>
    )
  }

  const c = page.content as any
  const gettingHere = DOMPurify.sanitize(c.getting_here ?? '')
  const bestTime = DOMPurify.sanitize(c.best_time ?? '')
  const visa = DOMPurify.sanitize(c.visa_info ?? '')
  const accommodation = DOMPurify.sanitize(c.accommodation ?? '')
  const itineraries: { duration: string; title: string; days: string[] }[] = Array.isArray(c.itineraries) ? c.itineraries : []

  return (
    <PublicLayout>
      <PageHero title={page.title} subtitle="Everything you need for a smooth visit." backgroundImage={page.hero_image ?? undefined} />

      <section className="max-w-5xl mx-auto px-5 lg:px-8 py-16 space-y-10">
        {gettingHere ? (
          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Getting here</h2>
            <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: gettingHere }} />
          </div>
        ) : null}
        {bestTime ? (
          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Best time to visit</h2>
            <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: bestTime }} />
          </div>
        ) : null}

        {itineraries.length > 0 ? (
          <div>
            <h2 className="font-serif text-2xl font-bold mb-6">Suggested itineraries</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {itineraries.map((it, i) => (
                <div key={i} className="bg-white rounded-lg border border-border p-6">
                  <span className="inline-block px-2 py-1 rounded bg-gold/20 text-amber-900 text-[11px] font-semibold mb-3">
                    {it.duration}
                  </span>
                  <h3 className="font-serif text-xl font-bold">{it.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                    {(it.days ?? []).map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="text-gold">●</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-6">
          {visa ? (
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="font-serif text-xl font-bold">Visa info</h3>
              <div className="prose prose-stone max-w-none mt-3" dangerouslySetInnerHTML={{ __html: visa }} />
            </div>
          ) : null}
          {accommodation ? (
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="font-serif text-xl font-bold">Where to stay</h3>
              <div className="prose prose-stone max-w-none mt-3" dangerouslySetInnerHTML={{ __html: accommodation }} />
            </div>
          ) : null}
        </div>

        <div className="text-center pt-6">
          <Link to="/book" className="inline-flex items-center px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors">
            Book Your Guide Now
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}

