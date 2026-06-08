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

type Itinerary = { duration: string; title: string; days: string[] };

export function PlanEditor({
  heroImage,
  content,
  onChange,
}: {
  heroImage: string | null;
  content: Record<string, unknown>;
  onChange: (next: { heroImage: string | null; content: unknown }) => void;
}) {
  const [localHero, setLocalHero] = useState<string>(heroImage ?? "");
  const [gettingHere, setGettingHere] = useState<string>(
    (content.getting_here as string) ?? "",
  );
  const [bestTime, setBestTime] = useState<string>(
    (content.best_time as string) ?? "",
  );
  const [visa, setVisa] = useState<string>((content.visa_info as string) ?? "");
  const [accommodation, setAccommodation] = useState<string>(
    (content.accommodation as string) ?? "",
  );
  const [itineraries, setItineraries] = useState<Itinerary[]>(
    Array.isArray(content.itineraries)
      ? (content.itineraries as Itinerary[])
      : [],
  );

  function commit(
    next?: Partial<{
      hero: string;
      gettingHere: string;
      bestTime: string;
      visa: string;
      accommodation: string;
      itineraries: Itinerary[];
    }>,
  ) {
    onChange({
      heroImage: (next?.hero ?? localHero).trim()
        ? (next?.hero ?? localHero).trim()
        : null,
      content: {
        getting_here: next?.gettingHere ?? gettingHere,
        best_time: next?.bestTime ?? bestTime,
        visa_info: next?.visa ?? visa,
        accommodation: next?.accommodation ?? accommodation,
        itineraries: next?.itineraries ?? itineraries,
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

      <AdminCard className="p-6 space-y-6">
        <Field label="Getting Here">
          <RichTextEditor
            value={gettingHere}
            onChange={(html) => setGettingHere(html)}
          />
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => commit({ gettingHere })}
            >
              Save
            </Button>
          </div>
        </Field>
        <Field label="Best Time to Visit">
          <RichTextEditor
            value={bestTime}
            onChange={(html) => setBestTime(html)}
          />
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => commit({ bestTime })}
            >
              Save
            </Button>
          </div>
        </Field>
        <Field label="Visa Info">
          <RichTextEditor value={visa} onChange={(html) => setVisa(html)} />
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => commit({ visa })}
            >
              Save
            </Button>
          </div>
        </Field>
        <Field label="Accommodation">
          <RichTextEditor
            value={accommodation}
            onChange={(html) => setAccommodation(html)}
          />
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => commit({ accommodation })}
            >
              Save
            </Button>
          </div>
        </Field>
      </AdminCard>

      <AdminCard className="p-6">
        <SectionLabel>Itineraries</SectionLabel>
        <div className="space-y-6">
          {itineraries.map((it, i) => (
            <div key={i} className="rounded border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="grid md:grid-cols-2 gap-2 flex-1">
                  <Input
                    value={it.duration}
                    onChange={(e) => {
                      const c = [...itineraries];
                      c[i] = { ...c[i]!, duration: e.target.value };
                      setItineraries(c);
                    }}
                    placeholder="Duration (e.g. 2 Days)"
                  />
                  <Input
                    value={it.title}
                    onChange={(e) => {
                      const c = [...itineraries];
                      c[i] = { ...c[i]!, title: e.target.value };
                      setItineraries(c);
                    }}
                    placeholder="Title"
                  />
                </div>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setItineraries(itineraries.filter((_, j) => j !== i))
                  }
                >
                  Delete
                </button>
              </div>
              <Field label="Days">
                <div className="space-y-2">
                  {it.days.map((d, di) => (
                    <div
                      key={di}
                      className="grid grid-cols-[1fr_auto] gap-2 items-center"
                    >
                      <Input
                        value={d}
                        onChange={(e) => {
                          const c = [...itineraries];
                          const days = [...(c[i]!.days ?? [])];
                          days[di] = e.target.value;
                          c[i] = { ...c[i]!, days };
                          setItineraries(c);
                        }}
                        placeholder={`Day ${di + 1}`}
                      />
                      <button
                        type="button"
                        className="p-2 text-ink-muted hover:text-red-600"
                        onClick={() => {
                          const c = [...itineraries];
                          const days = (c[i]!.days ?? []).filter(
                            (_, x) => x !== di,
                          );
                          c[i] = { ...c[i]!, days };
                          setItineraries(c);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const c = [...itineraries];
                      const days = [...(c[i]!.days ?? []), ""];
                      c[i] = { ...c[i]!, days };
                      setItineraries(c);
                    }}
                  >
                    Add day
                  </Button>
                </div>
              </Field>
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setItineraries([
                  ...itineraries,
                  { duration: "", title: "", days: [""] },
                ])
              }
            >
              Add itinerary
            </Button>
            <Button type="button" onClick={() => commit({ itineraries })}>
              Save itineraries
            </Button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
