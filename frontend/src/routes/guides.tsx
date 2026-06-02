import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { PublicLayout } from '@/components/PublicLayout'
import { PageHero } from '@/components/public/PageHero'
import { GuideCard } from '@/components/public/GuideCard'
import { getGuides } from '@/lib/guides-fns'
import { guides as mock } from '@/lib/harar-data'
import { buildHeadAsync } from '@/lib/metadata'

export const Route = createFileRoute('/guides')({
  loader: async () => {
    const items = await getGuides({ data: { published: true } })
    return { items }
  },
  head: async () =>
    buildHeadAsync({
      title: 'Licensed Guides',
      description:
        'Book bureau-certified local guides who grew up inside the walls of Harar Jugol.',
      canonicalPath: '/guides',
    }),
  component: GuidesPage,
})

function GuidesPage() {
  const { items } = Route.useLoaderData()
  const [lang, setLang] = useState('All')
  const [spec, setSpec] = useState('All')

  const source = useMemo(() => {
    if (items.length > 0) return items
    return mock
      .filter((g) => g.published)
      .map((g) => ({
        id: g.id,
        slug: g.id,
        name: g.name,
        photo: null as string | null,
        languages: g.languages,
        specialties: g.specialties,
        experience_years: g.years,
        is_available: g.available,
      }))
  }, [items])

  const langs = ['All', ...Array.from(new Set(source.flatMap((g) => g.languages)))]
  const specs = ['All', ...Array.from(new Set(source.flatMap((g) => g.specialties)))]

  const filtered = source.filter(
    (g) =>
      (lang === 'All' || g.languages.includes(lang)) &&
      (spec === 'All' || g.specialties.includes(spec)),
  )

  return (
    <PublicLayout>
      <PageHero title="Licensed Local Guides" subtitle="Bureau-certified guides ready to share their city." />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded border border-border bg-white px-3 py-2 text-sm"
          >
            {langs.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            className="rounded border border-border bg-white px-3 py-2 text-sm"
          >
            {specs.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((g) => (
            <GuideCard key={g.id} {...g} />
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}