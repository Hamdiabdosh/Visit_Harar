import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { createBooking, getBookingEnabledFn } from "@/lib/bookings-fns";
import { getGuides, type GuideDto } from "@/lib/guides-fns";
import { BOOKING_COUNTRIES } from "@/lib/countries";
import { optimizeImage } from "@/lib/cloudinary-url";
import { buildHeadAsync } from "@/lib/metadata";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { z } from "zod";

const bookSearchSchema = z.object({
  guideId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/book")({
  validateSearch: (s) => bookSearchSchema.parse(s),
  loader: async () => {
    const [enabled, guides] = await Promise.all([
      getBookingEnabledFn(),
      getGuides({ data: { published: true, available: true } }),
    ]);
    return { enabled, guides };
  },
  head: async () =>
    buildHeadAsync({
      title: "Book a Guide",
      description:
        "Request a licensed local guide for your visit to Harar. The bureau will confirm your booking request.",
      canonicalPath: "/book",
    }),
  component: BookPage,
});

const steps = [
  "Select Guide",
  "Tour Details",
  "Your Details",
  "Review",
] as const;

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function BookPage() {
  const { enabled, guides } = Route.useLoaderData();
  const { guideId: searchGuideId } = Route.useSearch();
  const bookable = guides.filter((g) => g.is_available);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [guideId, setGuideId] = useState(() =>
    searchGuideId && bookable.some((g) => g.id === searchGuideId)
      ? searchGuideId
      : (bookable[0]?.id ?? ""),
  );
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState<
    "Half Day" | "Full Day" | "Multi Day"
  >("Full Day");
  const [group, setGroup] = useState(2);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    notes: "",
  });

  const guide = bookable.find((g) => g.id === guideId);

  const createMut = useMutation({
    mutationFn: () =>
      createBooking({
        data: {
          guide_id: guideId,
          visitor_name: form.name.trim(),
          visitor_email: form.email.trim(),
          visitor_phone: form.phone.trim() || undefined,
          visitor_country: form.country,
          tour_date: date,
          tour_duration: duration,
          group_size: group,
          special_requests: form.notes.trim() || undefined,
        },
      }),
    onSuccess: (res) => {
      setBookingRef(res.booking_ref);
      setDone(true);
    },
    onError: (e: Error) => setSubmitError(e.message),
  });

  if (!enabled) {
    return (
      <PublicLayout>
        <PageHero
          title="Book a Guide"
          subtitle="Booking requests are temporarily paused."
        />
        <section className="max-w-xl mx-auto px-5 py-16 text-center">
          <p className="text-ink-muted mb-6">
            The bureau is not accepting new tour requests at this time. Please
            check back later or contact us directly.
          </p>
          <Link
            to="/contact"
            className="inline-flex px-6 py-3 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark"
          >
            Contact the Bureau
          </Link>
        </section>
      </PublicLayout>
    );
  }

  if (bookable.length === 0) {
    return (
      <PublicLayout>
        <PageHero
          title="Book a Guide"
          subtitle="No guides are available for booking right now."
        />
        <section className="max-w-xl mx-auto px-5 py-16 text-center text-ink-muted">
          <p className="mb-6">
            Please browse our guides page or contact the bureau for assistance.
          </p>
          <Link
            to="/guides"
            className="text-brand font-semibold hover:text-gold"
          >
            View licensed guides
          </Link>
        </section>
      </PublicLayout>
    );
  }

  if (done) {
    return <Success bookingRef={bookingRef} email={form.email} />;
  }

  const canNext =
    step === 0
      ? !!guideId
      : step === 1
        ? !!date && group >= 1 && group <= 50
        : step === 2
          ? form.name.trim() &&
            form.email.trim() &&
            z.string().email().safeParse(form.email).success &&
            form.country
          : true;

  return (
    <PublicLayout>
      <noscript>
        <p className="bg-amber-50 text-amber-900 text-sm text-center py-2 px-4">
          JavaScript is required for the multi-step booking form. Please contact
          the bureau to book a guide.
        </p>
      </noscript>
      <PageHero
        title="Book a Guide"
        subtitle="Four quick steps. The bureau will confirm within two business days."
      />
      <section className="max-w-3xl mx-auto px-5 lg:px-8 py-12">
        <ol className="flex gap-2 mb-10">
          {steps.map((s, i) => (
            <li key={s} className="flex-1">
              <div
                className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${i <= step ? "text-brand" : "text-ink-muted"}`}
              >
                Step {i + 1}
              </div>
              <div
                className={`h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-border"}`}
              />
              <div className="text-xs mt-2">{s}</div>
            </li>
          ))}
        </ol>

        <div className="bg-white rounded-lg border border-border p-8">
          {step === 0 && (
            <GuideStep
              guides={bookable}
              guideId={guideId}
              onGuideId={setGuideId}
              guide={guide}
            />
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h3 className="font-serif text-2xl font-bold">Tour Details</h3>
              <label className="block">
                <span className="block text-xs font-semibold mb-1">Date</span>
                <input
                  type="date"
                  min={todayIso()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                  required
                />
              </label>
              <div>
                <span className="block text-xs font-semibold mb-2">
                  Duration
                </span>
                <div className="flex gap-2 flex-wrap">
                  {(["Half Day", "Full Day", "Multi Day"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2 rounded-md border text-sm font-medium ${duration === d ? "bg-brand text-white border-brand" : "border-border hover:border-brand"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold mb-2">
                  Group Size
                </span>
                <div className="inline-flex items-center border border-border rounded-md">
                  <button
                    type="button"
                    onClick={() => setGroup(Math.max(1, group - 1))}
                    className="px-3 py-2"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-semibold w-12 text-center">
                    {group}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGroup(Math.min(50, group + 1))}
                    className="px-3 py-2"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold mb-2">
                Your Details
              </h3>
              <label className="block">
                <span className="block text-xs font-semibold mb-1">
                  Full name
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold mb-1">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold mb-1">
                  Phone (optional)
                </span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold mb-1">
                  Country
                </span>
                <select
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select country</option>
                  {BOOKING_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold mb-1">
                  Special requests
                </span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>
          )}

          {step === 3 && guide && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold">
                Review & Confirm
              </h3>
              <dl className="bg-surface rounded-lg p-5 border border-border text-sm divide-y divide-border">
                <Row k="Guide" v={guide.name} />
                <Row k="Date" v={date || "—"} />
                <Row k="Duration" v={duration} />
                <Row k="Group" v={String(group)} />
                <Row k="Visitor" v={form.name || "—"} />
                <Row k="Email" v={form.email || "—"} />
                <Row k="Country" v={form.country || "—"} />
              </dl>
              <p className="text-xs text-ink-muted">
                By submitting, you agree this is a request, not a guaranteed
                booking. The bureau will confirm within two business days.
              </p>
              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-4 py-2 rounded-md text-sm inline-flex items-center gap-1 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 rounded-md bg-brand text-white text-sm font-semibold inline-flex items-center gap-1 hover:bg-brand-dark disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={createMut.isPending || !canNext}
                onClick={() => {
                  setSubmitError("");
                  createMut.mutate();
                }}
                className="px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white disabled:opacity-50"
              >
                {createMut.isPending ? "Submitting…" : "Submit Booking Request"}
              </button>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function GuideStep({
  guides,
  guideId,
  onGuideId,
  guide,
}: {
  guides: GuideDto[];
  guideId: string;
  onGuideId: (id: string) => void;
  guide: GuideDto | undefined;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return guides;
    return guides.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.languages.some((l) => l.toLowerCase().includes(term)) ||
        g.specialties.some((s) => s.toLowerCase().includes(term)),
    );
  }, [guides, q]);

  const photoSrc = guide?.photo
    ? optimizeImage(guide.photo, { width: 120 })
    : null;

  return (
    <div>
      <h3 className="font-serif text-2xl font-bold mb-4">Select a Guide</h3>
      <input
        type="search"
        placeholder="Search by name, language, or specialty…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded border border-border px-3 py-2 text-sm mb-3"
      />
      <select
        value={guideId}
        onChange={(e) => onGuideId(e.target.value)}
        className="w-full rounded border border-border px-3 py-2 text-sm"
      >
        {filtered.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
            {g.experience_years != null
              ? ` — ${g.experience_years} yrs`
              : ""} · {g.languages.join(", ")}
          </option>
        ))}
      </select>
      {guide && (
        <div className="mt-5 p-4 rounded-lg bg-surface border border-border flex items-center gap-4">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt=""
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <span className="w-14 h-14 rounded-full bg-brand text-white grid place-items-center font-bold font-serif">
              {guide.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <div className="font-semibold">{guide.name}</div>
            <div className="text-xs text-ink-muted">
              {guide.specialties.join(" · ")}
            </div>
          </div>
        </div>
      )}
    </div>
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

function Success({ bookingRef, email }: { bookingRef: string; email: string }) {
  return (
    <PublicLayout>
      <section className="min-h-[80vh] grid place-items-center px-5 pt-24">
        <div className="bg-white rounded-lg border border-border p-12 max-w-lg text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 grid place-items-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold mt-6">
            Booking Request Received!
          </h1>
          <div className="mt-6 inline-block px-5 py-3 rounded-md bg-surface border border-border font-mono text-xl font-bold text-brand">
            {bookingRef}
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            You will receive updates at {email}. The bureau will respond within
            two business days.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/book/status"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-brand text-brand font-semibold hover:bg-brand/5"
            >
              Check booking status
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark"
            >
              <Check className="w-4 h-4 mr-1" />
              Return to Home
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
