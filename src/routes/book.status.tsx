import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { getBookingByRef } from "@/lib/bookings-fns";
import { statusBadge, formatBookingDate } from "@/lib/booking-ui";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/book/status")({
  head: async () =>
    buildHeadAsync({
      title: "Booking Status",
      description: "Check the status of your Harar tour booking request.",
      canonicalPath: "/book/status",
    }),
  component: BookingStatusPage,
});

function BookingStatusPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<
    Awaited<ReturnType<typeof getBookingByRef>> | "not_found" | null
  >(null);

  const lookup = useMutation({
    mutationFn: () =>
      getBookingByRef({
        data: { booking_ref: bookingRef.trim(), visitor_email: email.trim() },
      }),
    onSuccess: (data) => {
      setResult(data ?? "not_found");
    },
    onError: () => setResult("not_found"),
  });

  return (
    <PublicLayout>
      <PageHero
        title="Booking Status"
        subtitle="Enter your booking reference and the email you used when submitting."
      />
      <section className="max-w-lg mx-auto px-5 lg:px-8 py-12">
        <form
          className="bg-white rounded-lg border border-border p-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setResult(null);
            lookup.mutate();
          }}
        >
          <label className="block">
            <span className="block text-xs font-semibold mb-1">
              Booking reference
            </span>
            <input
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="HRR-2026-00001"
              className="w-full rounded border border-border px-3 py-2 text-sm font-mono"
              required
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold mb-1">
              Email address
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            disabled={lookup.isPending}
            className="w-full py-3 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-50"
          >
            {lookup.isPending ? "Looking up…" : "Check status"}
          </button>
        </form>

        {result === "not_found" && (
          <p className="mt-6 text-center text-sm text-ink-muted">
            No booking found for that reference and email. Please check your
            details and try again.
          </p>
        )}

        {result && result !== "not_found" && (
          <div className="mt-8 bg-white rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono font-bold text-brand">
                {result.booking_ref}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-[10px] border font-medium ${statusBadge[result.status]}`}
              >
                {result.status}
              </span>
            </div>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Guide</span>
                <span className="font-medium">{result.guide_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tour date</span>
                <span className="font-medium">
                  {formatBookingDate(result.tour_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Duration</span>
                <span className="font-medium">{result.tour_duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Group size</span>
                <span className="font-medium">{result.group_size}</span>
              </div>
            </dl>
            {result.status_note && (
              <div className="p-3 rounded bg-surface border border-border text-sm">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
                  Message from the commission
                </span>
                <p className="mt-1">{result.status_note}</p>
              </div>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-sm">
          <Link to="/book" className="text-brand font-semibold hover:text-gold">
            Submit a new booking request
          </Link>
        </p>
      </section>
    </PublicLayout>
  );
}
