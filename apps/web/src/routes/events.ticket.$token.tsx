import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { PublicLayout } from "@/components/PublicLayout";
import { getEventTicketByToken } from "@/lib/event-registrations-fns";
import {
  eventRegistrationStatusBadge,
  formatEventDate,
} from "@/lib/event-registration-ui";
import { buildHeadAsync } from "@/lib/metadata";

export const Route = createFileRoute("/events/ticket/$token")({
  loader: async ({ params }) => {
    const ticket = await getEventTicketByToken({ data: params.token });
    return { ticket };
  },
  head: async () =>
    buildHeadAsync({
      title: "Event Ticket",
      description: "Your Visit Harar event ticket.",
      canonicalPath: "/events/status",
    }),
  component: EventTicketPage,
});

function EventTicketPage() {
  const { ticket } = Route.useLoaderData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ticketUrl =
    typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    if (!ticket?.qr_token || !canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, ticketUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#1A99B1", light: "#ffffff" },
    });
  }, [ticket?.qr_token, ticketUrl]);

  return (
    <PublicLayout>
      <section className="max-w-md mx-auto px-5 py-16">
        {!ticket ? (
          <div className="rounded-lg border border-border bg-white p-8 text-center">
            <h1 className="font-serif text-2xl font-bold">Ticket not found</h1>
            <p className="mt-2 text-sm text-ink-muted">
              This ticket link is invalid or the registration is not confirmed.
            </p>
            <Link
              to="/events/status"
              className="mt-6 inline-block text-brand font-semibold"
            >
              Check registration status
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-white p-8 shadow-lg space-y-5">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-ink-muted">
                Visit Harar Event Ticket
              </p>
              <h1 className="mt-2 font-serif text-2xl font-bold">
                {ticket.event_title}
              </h1>
            </div>
            <div className="flex justify-center">
              <canvas ref={canvasRef} aria-label="Event ticket QR code" />
            </div>
            <dl className="text-sm space-y-2 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-ink-muted">Reference</span>
                <span className="font-mono font-semibold">
                  {ticket.registration_ref}
                </span>
              </div>
              {ticket.event_date ? (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Date</span>
                  <span>{formatEventDate(ticket.event_date)}</span>
                </div>
              ) : null}
              {ticket.event_location ? (
                <div className="flex justify-between gap-4">
                  <span className="text-ink-muted">Location</span>
                  <span className="text-right">{ticket.event_location}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-ink-muted">Party size</span>
                <span>{ticket.party_size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] border font-medium ${eventRegistrationStatusBadge[ticket.status]}`}
                >
                  {ticket.status}
                </span>
              </div>
            </dl>
            <p className="text-xs text-center text-ink-muted">
              Present this QR code at the event entrance.
            </p>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
