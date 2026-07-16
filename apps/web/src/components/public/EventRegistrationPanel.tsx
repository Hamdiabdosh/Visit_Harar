import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Link } from "@tanstack/react-router";
import { createEventRegistration } from "@/lib/event-registrations-fns";
import type { AnnouncementDto } from "@/lib/announcements-fns";
import { BOOKING_COUNTRIES } from "@/lib/countries";
import {
  eventRegistrationStatusBadge,
  formatEventDate,
} from "@/lib/event-registration-ui";
import type { EventRegistrationStatus } from "@/lib/types";
import { usePublicSurfaces } from "@/components/public/surfaces-context";

type Props = {
  event: AnnouncementDto;
};

function TicketQr({ url, label }: { url: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    void QRCode.toCanvas(canvas, url, {
      width: 180,
      margin: 1,
      color: { dark: "#1A99B1", light: "#ffffff" },
    });
  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className="rounded border border-border"
    />
  );
}

export function EventRegistrationPanel({ event }: Props) {
  const { eventRsvpEnabled } = usePublicSurfaces();
  const meta = event.registration;
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [registrationRef, setRegistrationRef] = useState("");
  const [status, setStatus] = useState<EventRegistrationStatus>("Pending");
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    party: 1,
    notes: "",
  });

  if (
    !eventRsvpEnabled ||
    event.type !== "Event" ||
    !event.registration_enabled ||
    !meta
  ) {
    return null;
  }

  const createMut = useMutation({
    mutationFn: () =>
      createEventRegistration({
        data: {
          announcement_id: event.id,
          visitor_name: form.name.trim(),
          visitor_email: form.email.trim(),
          visitor_phone: form.phone.trim() || undefined,
          visitor_country: form.country,
          party_size: form.party,
          special_requests: form.notes.trim() || undefined,
        },
      }),
    onSuccess: (res) => {
      setRegistrationRef(res.registration_ref);
      setStatus(res.status);
      setQrToken(res.qr_token);
      setDone(true);
    },
    onError: (e: Error) => setSubmitError(e.message),
  });

  const ticketUrl =
    typeof window !== "undefined" && qrToken
      ? `${window.location.origin}/events/ticket/${qrToken}`
      : "";

  return (
    <div className="mt-8 rounded-lg border border-brand/20 bg-brand/5 p-6">
      <h2 className="font-serif text-xl font-bold">Event registration</h2>
      {event.registration_note ? (
        <p className="mt-2 text-sm text-ink-muted">{event.registration_note}</p>
      ) : null}

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {meta.registration_capacity != null ? (
          <div>
            <dt className="text-ink-muted">Spots remaining</dt>
            <dd className="font-semibold">
              {meta.spots_remaining ?? 0} / {meta.registration_capacity}
            </dd>
          </div>
        ) : null}
        {meta.registration_deadline ? (
          <div>
            <dt className="text-ink-muted">Register by</dt>
            <dd className="font-semibold">
              {formatEventDate(meta.registration_deadline)}
            </dd>
          </div>
        ) : null}
      </dl>

      {!meta.registration_open && !done ? (
        <p className="mt-4 text-sm font-medium text-amber-800">
          Registration is closed for this event.
        </p>
      ) : null}

      {done ? (
        <div className="mt-6 space-y-4 rounded-md border border-border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono font-bold text-brand">
              {registrationRef}
            </span>
            <span
              className={`rounded-full border px-2 py-1 text-[10px] font-medium ${eventRegistrationStatusBadge[status]}`}
            >
              {status}
            </span>
          </div>
          {status === "Confirmed" && ticketUrl ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <TicketQr url={ticketUrl} label="Event ticket QR code" />
              <div className="text-sm text-ink-muted">
                <p className="font-semibold text-ink">Your ticket</p>
                <p className="mt-1">
                  Show this QR code at the event entrance. A copy was sent to
                  your email.
                </p>
                <Link
                  to="/events/ticket/$token"
                  params={{ token: qrToken! }}
                  className="mt-2 inline-block text-brand font-semibold hover:text-gold"
                >
                  Open ticket page
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              {status === "Pending"
                ? "Your registration is pending review. We will email you when it is confirmed."
                : "Save your reference number for your records."}
            </p>
          )}
        </div>
      ) : meta.registration_open ? (
        !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-5 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Register for this event
          </button>
        ) : (
          <form
            className="mt-5 space-y-4 rounded-md border border-border bg-white p-5"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitError("");
              createMut.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold">
                  Full name
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">
                  Country
                </span>
                <select
                  required
                  value={form.country}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, country: e.target.value }))
                  }
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {BOOKING_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">
                  Party size
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={form.party}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      party: Number(e.target.value) || 1,
                    }))
                  }
                  className="w-full rounded border border-border px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">
                Notes (optional)
              </span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="w-full rounded border border-border px-3 py-2 text-sm"
              />
            </label>
            {submitError ? (
              <p className="text-sm text-red-600">{submitError}</p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMut.isPending}
                className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {createMut.isPending ? "Submitting…" : "Submit registration"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )
      ) : null}

      <p className="mt-4 text-xs text-ink-muted">
        Already registered?{" "}
        <Link
          to="/events/status"
          className="font-semibold text-brand hover:text-gold"
        >
          Check registration status
        </Link>
      </p>
    </div>
  );
}
