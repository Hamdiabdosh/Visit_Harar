import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { SoftUnavailablePage } from "@/components/public/SoftUnavailablePage";
import { getEventRegistrationByRef } from "@/lib/event-registrations-fns";
import {
  eventRegistrationStatusBadge,
  formatEventDate,
} from "@/lib/event-registration-ui";
import { getPublicSurfacesFn } from "@/lib/public-surfaces";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/events/status")({
  loader: async () => {
    const surfaces = await getPublicSurfacesFn();
    return { enabled: surfaces.eventRsvpEnabled };
  },
  head: async () =>
    buildHeadAsync({
      title: "Event Registration Status",
      description: "Check the status of your Harar event registration.",
      canonicalPath: "/events/status",
      noindex: true,
    }),
  component: EventRegistrationStatusPage,
});

function EventRegistrationStatusPage() {
  const { enabled } = Route.useLoaderData();
  const [registrationRef, setRegistrationRef] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<
    Awaited<ReturnType<typeof getEventRegistrationByRef>> | "not_found" | null
  >(null);

  const lookup = useMutation({
    mutationFn: () =>
      getEventRegistrationByRef({
        data: {
          registration_ref: registrationRef.trim(),
          visitor_email: email.trim(),
        },
      }),
    onSuccess: (data) => setResult(data ?? "not_found"),
    onError: () => setResult("not_found"),
  });

  if (!enabled) {
    return (
      <SoftUnavailablePage
        title="Event Registration"
        subtitle="Online event registration is temporarily paused."
        body="You can still read event details on News. Contact the commission if you need to register for an event."
      />
    );
  }

  return (
    <PublicLayout>
      <PageHero
        title="Event registration status"
        subtitle="Enter your registration reference and the email you used when registering."
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
              Registration reference
            </span>
            <input
              value={registrationRef}
              onChange={(e) => setRegistrationRef(e.target.value)}
              placeholder="EVT-2026-00001"
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
            No registration found for that reference and email.
          </p>
        )}

        {result && result !== "not_found" && (
          <div className="mt-8 bg-white rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono font-bold text-brand">
                {result.registration_ref}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-[10px] border font-medium ${eventRegistrationStatusBadge[result.status]}`}
              >
                {result.status}
              </span>
            </div>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-ink-muted">Event</span>
                <span className="font-medium text-right">{result.event_title}</span>
              </div>
              {result.event_date ? (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Date</span>
                  <span className="font-medium">
                    {formatEventDate(result.event_date)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-ink-muted">Party size</span>
                <span className="font-medium">{result.party_size}</span>
              </div>
            </dl>
            {result.qr_token ? (
              <div className="pt-2">
                <Link
                  to="/events/ticket/$token"
                  params={{ token: result.qr_token }}
                  className="text-brand font-semibold hover:text-gold text-sm"
                >
                  View ticket with QR code
                </Link>
              </div>
            ) : null}
            {result.status_note ? (
              <div className="p-3 rounded bg-surface border border-border text-sm">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
                  Message from the commission
                </span>
                <p className="mt-1">{result.status_note}</p>
              </div>
            ) : null}
          </div>
        )}

        <p className="mt-8 text-center text-sm">
          <Link to="/news" className="text-brand font-semibold hover:text-gold">
            Browse events
          </Link>
        </p>
      </section>
    </PublicLayout>
  );
}
