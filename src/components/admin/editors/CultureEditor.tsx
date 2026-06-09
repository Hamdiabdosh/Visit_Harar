import { useState } from "react";
import {
  AdminCard,
  Button,
  Field,
  Input,
  SectionLabel,
  Textarea,
} from "@/components/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Section = { title: string; body?: string; image?: string | null };
type Festival = { name: string; date: string; description: string };

export function CultureEditor({
  heroImage,
  content,
  onChange,
}: {
  heroImage: string | null;
  content: Record<string, unknown>;
  onChange: (next: { heroImage: string | null; content: unknown }) => void;
}) {
  const [localHero, setLocalHero] = useState<string>(heroImage ?? "");
  const [intro, setIntro] = useState<string>(
    (content.intro_text as string) ?? "",
  );
  const [sections, setSections] = useState<Section[]>(
    Array.isArray(content.sections) ? (content.sections as Section[]) : [],
  );
  const [festivals, setFestivals] = useState<Festival[]>(
    Array.isArray(content.festivals) ? (content.festivals as Festival[]) : [],
  );

  function commit(
    next?: Partial<{
      hero: string;
      intro: string;
      sections: Section[];
      festivals: Festival[];
    }>,
  ) {
    const nHero = next?.hero ?? localHero;
    const nIntro = next?.intro ?? intro;
    const nSections = next?.sections ?? sections;
    const nFestivals = next?.festivals ?? festivals;
    onChange({
      heroImage: nHero.trim() ? nHero.trim() : null,
      content: {
        intro_text: nIntro,
        sections: nSections,
        festivals: nFestivals,
      },
    });
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
        <Button
          variant="outline"
          type="button"
          onClick={() => commit({ hero: localHero })}
        >
          Save Hero Image
        </Button>
      </AdminCard>

      <AdminCard className="p-6 space-y-5">
        <Field label="Intro">
          <RichTextEditor value={intro} onChange={(html) => setIntro(html)} />
        </Field>
        <Button
          type="button"
          variant="outline"
          onClick={() => commit({ intro })}
        >
          Save Intro
        </Button>
      </AdminCard>

      <AdminCard className="p-6">
        <SectionLabel>Sections</SectionLabel>
        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="rounded border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Input
                  value={s.title}
                  onChange={(e) => {
                    const c = [...sections];
                    c[i] = { ...c[i]!, title: e.target.value };
                    setSections(c);
                  }}
                  placeholder="Section title"
                />
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setSections(sections.filter((_, j) => j !== i))
                  }
                >
                  Delete
                </button>
              </div>
              <Field label="Body">
                <RichTextEditor
                  value={s.body ?? ""}
                  onChange={(html) => {
                    const c = [...sections];
                    c[i] = { ...c[i]!, body: html };
                    setSections(c);
                  }}
                />
              </Field>
              <Field label="Image URL (optional)">
                <Input
                  value={s.image ?? ""}
                  onChange={(e) => {
                    const c = [...sections];
                    c[i] = { ...c[i]!, image: e.target.value || null };
                    setSections(c);
                  }}
                  placeholder="https://…"
                />
              </Field>
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSections([...sections, { title: "", body: "" }])
              }
            >
              Add section
            </Button>
            <Button type="button" onClick={() => commit({ sections })}>
              Save sections
            </Button>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-6">
        <SectionLabel>Festivals</SectionLabel>
        <div className="space-y-3">
          {festivals.map((f, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 items-start"
            >
              <Input
                value={f.name}
                onChange={(e) => {
                  const c = [...festivals];
                  c[i] = { ...c[i]!, name: e.target.value };
                  setFestivals(c);
                }}
                placeholder="Festival name"
              />
              <Input
                value={f.date}
                onChange={(e) => {
                  const c = [...festivals];
                  c[i] = { ...c[i]!, date: e.target.value };
                  setFestivals(c);
                }}
                placeholder="Date"
              />
              <Textarea
                rows={2}
                value={f.description}
                onChange={(e) => {
                  const c = [...festivals];
                  c[i] = { ...c[i]!, description: e.target.value };
                  setFestivals(c);
                }}
                placeholder="Short description"
              />
              <button
                type="button"
                className="p-2 text-ink-muted hover:text-red-600"
                onClick={() =>
                  setFestivals(festivals.filter((_, j) => j !== i))
                }
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFestivals([
                  ...festivals,
                  { name: "", date: "", description: "" },
                ])
              }
            >
              Add festival
            </Button>
            <Button type="button" onClick={() => commit({ festivals })}>
              Save festivals
            </Button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
