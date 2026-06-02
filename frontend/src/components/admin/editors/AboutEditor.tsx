import { useState } from 'react'
import { AdminCard, Button, Field, Input, SectionLabel } from '@/components/AdminLayout'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

type QuickFact = { label: string; value: string }

export function AboutEditor({
  heroImage,
  content,
  onChange,
}: {
  heroImage: string | null
  content: Record<string, unknown>
  onChange: (next: { heroImage: string | null; content: unknown }) => void
}) {
  const [localHero, setLocalHero] = useState<string>(heroImage ?? '')
  const [intro, setIntro] = useState<string>((content.intro_text as string) ?? '')
  const [unesco, setUnesco] = useState<string>((content.unesco_text as string) ?? '')
  const [geo, setGeo] = useState<string>((content.geography_text as string) ?? '')
  const [facts, setFacts] = useState<QuickFact[]>(
    Array.isArray(content.quick_facts) ? (content.quick_facts as QuickFact[]) : [],
  )

  function commit(next?: Partial<{ hero: string; intro: string; unesco: string; geo: string; facts: QuickFact[] }>) {
    const nHero = next?.hero ?? localHero
    const nIntro = next?.intro ?? intro
    const nUnesco = next?.unesco ?? unesco
    const nGeo = next?.geo ?? geo
    const nFacts = next?.facts ?? facts
    onChange({
      heroImage: nHero.trim() ? nHero.trim() : null,
      content: {
        intro_text: nIntro,
        unesco_text: nUnesco,
        geography_text: nGeo,
        quick_facts: nFacts.filter((f) => f.label.trim() && f.value.trim()),
      },
    })
  }

  return (
    <div className="space-y-6">
      <AdminCard className="p-6 space-y-5">
        <Field label="Hero Image URL">
          <Input
            value={localHero}
            onChange={(e) => setLocalHero(e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Button variant="outline" type="button" onClick={() => commit({ hero: localHero })}>
          Save Hero Image
        </Button>
      </AdminCard>

      <AdminCard className="p-6 space-y-6">
        <Field label="Intro">
          <RichTextEditor value={intro} onChange={(html) => setIntro(html)} />
          <div className="mt-3">
            <Button type="button" variant="outline" onClick={() => commit({ intro })}>
              Save Intro
            </Button>
          </div>
        </Field>

        <Field label="UNESCO">
          <RichTextEditor value={unesco} onChange={(html) => setUnesco(html)} />
          <div className="mt-3">
            <Button type="button" variant="outline" onClick={() => commit({ unesco })}>
              Save UNESCO
            </Button>
          </div>
        </Field>

        <Field label="Geography">
          <RichTextEditor value={geo} onChange={(html) => setGeo(html)} />
          <div className="mt-3">
            <Button type="button" variant="outline" onClick={() => commit({ geo })}>
              Save Geography
            </Button>
          </div>
        </Field>
      </AdminCard>

      <AdminCard className="p-6">
        <SectionLabel>Quick Facts</SectionLabel>
        <div className="space-y-2">
          {facts.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
              <Input
                value={f.label}
                onChange={(e) => {
                  const c = [...facts]
                  c[i] = { ...c[i]!, label: e.target.value }
                  setFacts(c)
                }}
                placeholder="Label"
              />
              <Input
                value={f.value}
                onChange={(e) => {
                  const c = [...facts]
                  c[i] = { ...c[i]!, value: e.target.value }
                  setFacts(c)
                }}
                placeholder="Value"
              />
              <button
                type="button"
                onClick={() => setFacts(facts.filter((_, j) => j !== i))}
                className="p-2 text-ink-muted hover:text-red-600"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setFacts([...facts, { label: '', value: '' }])}>
              Add fact
            </Button>
            <Button type="button" onClick={() => commit({ facts })}>
              Save facts
            </Button>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}

