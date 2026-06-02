import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { guides } from "@/lib/harar-data";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, CheckCircle2 } from "lucide-react";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/book")({
  head: async () =>
    buildHeadAsync({
      title: "Book a Guide",
      description:
        "Request a licensed local guide for your visit to Harar. The bureau will confirm your booking request.",
      canonicalPath: "/book",
    }),
  component: BookPage,
});

const steps = ["Select Guide", "Tour Details", "Your Details", "Review"] as const;

function BookPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [guideId, setGuideId] = useState(guides[0].id);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState<"Half Day" | "Full Day" | "Multi Day">("Full Day");
  const [group, setGroup] = useState(2);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", notes: "" });
  const guide = guides.find((g) => g.id === guideId)!;

  if (done) return <Success />;

  return (
    <PublicLayout>
      <PageHero title="Book a Guide" subtitle="Four quick steps. We'll confirm by email within 24 hours." />
      <section className="max-w-3xl mx-auto px-5 lg:px-8 py-12">
        <ol className="flex gap-2 mb-10">
          {steps.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${i <= step ? "text-brand" : "text-ink-muted"}`}>Step {i + 1}</div>
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-border"}`} />
              <div className="text-xs mt-2">{s}</div>
            </li>
          ))}
        </ol>

        <div className="bg-white rounded-lg border border-border p-8">
          {step === 0 && (
            <div>
              <h3 className="font-serif text-2xl font-bold mb-4">Select a Guide</h3>
              <select value={guideId} onChange={(e) => setGuideId(e.target.value)} className="w-full rounded border border-border px-3 py-2 text-sm">
                {guides.map((g) => <option key={g.id} value={g.id}>{g.name} — {g.years} yrs · {g.languages.join(", ")}</option>)}
              </select>
              <div className="mt-5 p-4 rounded-lg bg-surface border border-border flex items-center gap-4">
                <span className={`w-14 h-14 rounded-full ${guide.avatarColor} text-white grid place-items-center font-bold font-serif`}>{guide.initials}</span>
                <div>
                  <div className="font-semibold">{guide.name}</div>
                  <div className="text-xs text-ink-muted">{guide.specialties.join(" · ")}</div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h3 className="font-serif text-2xl font-bold">Tour Details</h3>
              <label className="block">
                <span className="block text-xs font-semibold mb-1">Date</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded border border-border px-3 py-2 text-sm" />
              </label>
              <div>
                <span className="block text-xs font-semibold mb-2">Duration</span>
                <div className="flex gap-2 flex-wrap">
                  {(["Half Day", "Full Day", "Multi Day"] as const).map((d) => (
                    <button key={d} onClick={() => setDuration(d)} className={`px-4 py-2 rounded-md border text-sm font-medium ${duration === d ? "bg-brand text-white border-brand" : "border-border hover:border-brand"}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold mb-2">Group Size</span>
                <div className="inline-flex items-center border border-border rounded-md">
                  <button onClick={() => setGroup(Math.max(1, group - 1))} className="px-3 py-2"><Minus className="w-4 h-4" /></button>
                  <span className="px-4 font-semibold w-12 text-center">{group}</span>
                  <button onClick={() => setGroup(group + 1)} className="px-3 py-2"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold mb-2">Your Details</h3>
              {(["name", "email", "phone", "country"] as const).map((k) => (
                <label key={k} className="block">
                  <span className="block text-xs font-semibold mb-1 capitalize">{k}</span>
                  <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full rounded border border-border px-3 py-2 text-sm" />
                </label>
              ))}
              <label className="block">
                <span className="block text-xs font-semibold mb-1">Special Requests</span>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded border border-border px-3 py-2 text-sm" />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold">Review & Confirm</h3>
              <dl className="bg-surface rounded-lg p-5 border border-border text-sm divide-y divide-border">
                <Row k="Guide" v={guide.name} />
                <Row k="Date" v={date || "—"} />
                <Row k="Duration" v={duration} />
                <Row k="Group" v={String(group)} />
                <Row k="Visitor" v={form.name || "—"} />
                <Row k="Email" v={form.email || "—"} />
                <Row k="Country" v={form.country || "—"} />
              </dl>
              <p className="text-xs text-ink-muted">By submitting, you agree to the Bureau's tour terms. We'll confirm by email within 24 hours.</p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-4 py-2 rounded-md text-sm inline-flex items-center gap-1 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="px-6 py-2 rounded-md bg-brand text-white text-sm font-semibold inline-flex items-center gap-1 hover:bg-brand-dark">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setDone(true)} className="px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white">
                Confirm Booking Request
              </button>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-2.5">
      <span className="text-ink-muted">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function Success() {
  return (
    <PublicLayout>
      <section className="min-h-[80vh] grid place-items-center px-5 pt-24">
        <div className="bg-white rounded-lg border border-border p-12 max-w-lg text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 grid place-items-center"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
          <h1 className="font-serif text-3xl font-bold mt-6">Booking Request Received!</h1>
          <div className="mt-6 inline-block px-5 py-3 rounded-md bg-surface border border-border font-mono text-xl font-bold text-brand">HRR-2026-00142</div>
          <p className="mt-4 text-sm text-ink-muted">Check your email for confirmation. The Bureau will respond within 24 hours.</p>
          <Link to="/" className="mt-6 inline-flex items-center px-5 py-2.5 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark"><Check className="w-4 h-4 mr-1" />Return to Home</Link>
        </div>
      </section>
    </PublicLayout>
  );
}