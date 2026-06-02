import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/components/PublicLayout'
import { PageHero } from '@/components/public/PageHero'
import { getPublishedPage } from '@/lib/pages-fns'
import DOMPurify from 'isomorphic-dompurify'
import { ComingSoon } from '@/components/public/ComingSoon'
import { buildHeadAsync, excerptFromHtml } from '@/lib/metadata'

export const Route = createFileRoute('/about')({
  loader: async () => {
    const page = await getPublishedPage({ data: 'about' })
    return { page }
  },
  head: async ({ loaderData }) => {
    const page = loaderData?.page
    const content = (page?.content ?? {}) as { intro_text?: string }
    return buildHeadAsync({
      title: page?.title ?? 'About Harar',
      description:
        excerptFromHtml(content.intro_text) ??
        'History, heritage, and the living culture inside the walls of Harar Jugol.',
      ogImage: page?.hero_image,
      canonicalPath: '/about',
    })
  },
  component: AboutPage,
})

function AboutPage() {
  const { page } = Route.useLoaderData()

  if (!page) {
    return (
      <PublicLayout>
        <PageHero title="About Harar" subtitle="Official information from the Harari Regional Tourism Bureau." />
        <ComingSoon backTo="/" />
      </PublicLayout>
    )
  }

  const c = page.content as any
  const intro = DOMPurify.sanitize(c.intro_text ?? '')
  const unesco = DOMPurify.sanitize(c.unesco_text ?? '')
  const geo = DOMPurify.sanitize(c.geography_text ?? '')
  const facts: { label: string; value: string }[] = Array.isArray(c.quick_facts) ? c.quick_facts : []

  return (
    <PublicLayout>
      <PageHero
        title={page.title}
        subtitle="History, heritage, and the living culture inside the walls."
        backgroundImage={page.hero_image ?? undefined}
      />
      <section className="max-w-3xl mx-auto px-5 lg:px-8 py-16 space-y-10">
        {intro ? (
          <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: intro }} />
        ) : null}
        {unesco ? (
          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">UNESCO World Heritage</h2>
            <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: unesco }} />
          </div>
        ) : null}
        {geo ? (
          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Geography</h2>
            <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: geo }} />
          </div>
        ) : null}

        {facts.length > 0 ? (
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="font-serif text-xl font-bold mb-4">Quick facts</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {facts.map((f, i) => (
                <div key={i} className="rounded border border-border bg-surface px-4 py-3">
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">{f.label}</div>
                  <div className="text-sm mt-1">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </PublicLayout>
  )
}

