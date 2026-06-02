import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/components/PublicLayout'
import { PageHero } from '@/components/public/PageHero'
import { getPublishedPage } from '@/lib/pages-fns'
import DOMPurify from 'isomorphic-dompurify'
import { ComingSoon } from '@/components/public/ComingSoon'
import { optimizeImage } from '@/lib/cloudinary-url'
import { buildHeadAsync, excerptFromHtml } from '@/lib/metadata'

export const Route = createFileRoute('/culture')({
  loader: async () => {
    const page = await getPublishedPage({ data: 'culture' })
    return { page }
  },
  head: async ({ loaderData }) => {
    const page = loaderData?.page
    const content = (page?.content ?? {}) as { intro_text?: string }
    return buildHeadAsync({
      title: page?.title ?? 'Culture & Festivals',
      description:
        excerptFromHtml(content.intro_text) ??
        'The living traditions, festivals, and cultural heritage of the Harari people.',
      ogImage: page?.hero_image,
      canonicalPath: '/culture',
    })
  },
  component: CulturePage,
})

function CulturePage() {
  const { page } = Route.useLoaderData()

  if (!page) {
    return (
      <PublicLayout>
        <PageHero title="Culture & Festivals" subtitle="The living traditions of the Harari people." />
        <ComingSoon backTo="/" />
      </PublicLayout>
    )
  }

  const c = page.content as any
  const intro = DOMPurify.sanitize(c.intro_text ?? '')
  const sections: { title: string; body?: string; image?: string | null }[] = Array.isArray(c.sections) ? c.sections : []
  const festivals: { name: string; date: string; description: string }[] = Array.isArray(c.festivals) ? c.festivals : []

  return (
    <PublicLayout>
      <PageHero title={page.title} subtitle="The living traditions of the Harari people." backgroundImage={page.hero_image ?? undefined} />
      <section className="max-w-3xl mx-auto px-5 lg:px-8 py-16 space-y-10">
        {intro ? <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: intro }} /> : null}

        {sections.map((s, i) => (
          <div key={i} className="space-y-4">
            <h2 className="font-serif text-2xl font-bold">{s.title}</h2>
            {s.image ? (
              <img
                src={optimizeImage(s.image, { width: 1400 }) ?? s.image}
                alt=""
                className="w-full rounded-lg border border-border"
              />
            ) : null}
            {s.body ? (
              <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(s.body) }} />
            ) : null}
          </div>
        ))}

        {festivals.length > 0 ? (
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="font-serif text-xl font-bold mb-4">Festivals</h3>
            <div className="space-y-4">
              {festivals.map((f, i) => (
                <div key={i} className="rounded border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{f.name}</div>
                    <div className="text-xs text-ink-muted">{f.date}</div>
                  </div>
                  <p className="text-sm text-ink-muted mt-2">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </PublicLayout>
  )
}