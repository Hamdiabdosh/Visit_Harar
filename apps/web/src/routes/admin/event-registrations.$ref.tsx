import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminCard,
  Button,
  Textarea,
} from "@/components/AdminLayout";
import {
  cancelEventRegistration,
  checkInEventRegistration,
  confirmEventRegistration,
  declineEventRegistration,
  getEventRegistrationByRefForAdmin,
  resendEventRegistrationNotification,
} from "@/lib/event-registrations-fns";
import {
  eventRegistrationStatusBadge,
  formatEventDate,
} from "@/lib/event-registration-ui";
import { formatSubmittedAt } from "@/lib/booking-ui";
import { ArrowLeft, Check, X, RefreshCw, ScanLine } from "lucide-react";

export const Route = createFileRoute("/admin/event-registrations/$ref")({
  component: EventRegistrationDetail,
});

function EventRegistrationDetail() {
  const { ref } = useParams({ from: "/admin/event-registrations/$ref" });
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<"confirm" | "decline" | "cancel" | null>(
    null,
  );
  const [note, setNote] = useState("");

  const {
    data: registration,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "event-registration", ref],
    queryFn: () => getEventRegistrationByRefForAdmin({ data: ref }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["admin", "event-registrations"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["admin", "event-registration", ref],
    });
    void queryClient.invalidateQueries({
      queryKey: ["admin", "event-registrations", "pending-count"],
    });
  };

  const confirmMut = useMutation({
    mutationFn: () =>
      confirmEventRegistration({
        data: { id: registration!.id, note: note || undefined },
      }),
    onSuccess: () => {
      toast.success("Registration confirmed");
      setModal(null);
      setNote("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const declineMut = useMutation({
    mutationFn: () =>
      declineEventRegistration({ data: { id: registration!.id, note } }),
    onSuccess: () => {
      toast.success("Registration declined");
      setModal(null);
      setNote("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelMut = useMutation({
    mutationFn: () =>
      cancelEventRegistration({ data: { id: registration!.id, note } }),
    onSuccess: () => {
      toast.success("Registration cancelled");
      setModal(null);
      setNote("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkInMut = useMutation({
    mutationFn: () => checkInEventRegistration({ data: registration!.id }),
    onSuccess: () => {
      toast.success("Checked in");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resendMut = useMutation({
    mutationFn: () => resendEventRegistrationNotification({ data: registration!.id }),
    onSuccess: () => toast.success("Notification email sent"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <AdminLayout title="Registration" breadcrumb="Event registrations">
        <p className="text-sm text-ink-muted">Loading…</p>
      </AdminLayout>
    );
  }

  if (isError || !registration) {
    return (
      <AdminLayout
        title="Not found"
        breadcrumb="Event registrations"
        action={
          <Link
            to="/admin/event-registrations"
            search={{ denied: false }}
            className="text-sm text-ink-muted inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      >
        <p className="text-sm text-ink-muted">
          No registration with reference {ref}.
        </p>
      </AdminLayout>
    );
  }

  const terminal =
    registration.status === "Declined" ||
    registration.status === "Cancelled" ||
    registration.status === "CheckedIn";

  return (
    <AdminLayout
      title={registration.registration_ref}
      breadcrumb={`Event registrations › ${registration.registration_ref}`}
      action={
        <Link
          to="/admin/event-registrations"
          search={{ denied: false }}
          className="text-sm text-ink-muted inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`px-3 py-1.5 rounded-full text-sm border font-semibold ${eventRegistrationStatusBadge[registration.status]}`}
        >
          {registration.status}
        </span>
        {registration.updated_by_name ? (
          <span className="text-xs text-ink-muted">
            Updated by {registration.updated_by_name} ·{" "}
            {formatSubmittedAt(registration.updated_at)}
          </span>
        ) : null}
        <Button
          variant="outline"
          className="ml-auto"
          disabled={resendMut.isPending}
          onClick={() => resendMut.mutate()}
        >
          <RefreshCw className="w-4 h-4" /> Resend notification
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <AdminCard className="p-6">
          <h3 className="font-serif text-lg font-bold mb-4">Event</h3>
          <div className="space-y-1.5 text-sm">
            <div className="font-semibold text-base">
              {registration.event.title}
            </div>
            {registration.event.event_date ? (
              <div className="text-ink-muted">
                {formatEventDate(registration.event.event_date)}
              </div>
            ) : null}
            {registration.event.event_location ? (
              <div>{registration.event.event_location}</div>
            ) : null}
            <Link
              to="/admin/announcements/$id"
              params={{ id: registration.event.id }}
              className="inline-block mt-2 text-brand text-xs font-semibold hover:underline"
            >
              Edit event
            </Link>
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-serif text-lg font-bold mb-4">Visitor</h3>
          <div className="space-y-1.5 text-sm">
            <div className="font-semibold text-base">
              {registration.visitor_name}
            </div>
            <div className="text-ink-muted">{registration.visitor_email}</div>
            {registration.visitor_phone ? (
              <div className="text-ink-muted">{registration.visitor_phone}</div>
            ) : null}
            <div>{registration.visitor_country}</div>
            <div className="text-xs text-ink-muted mt-3">
              Submitted {formatSubmittedAt(registration.created_at)}
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard className="p-6 mb-6">
        <h3 className="font-serif text-lg font-bold mb-4">Registration</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info label="Party size" value={String(registration.party_size)} />
          <Info
            label="Notes"
            value={registration.special_requests || "—"}
          />
          {(registration.status === "Confirmed" ||
            registration.status === "CheckedIn") && (
            <Info
              label="Ticket"
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}/events/ticket/${registration.qr_token}`
                  : registration.qr_token
              }
            />
          )}
        </div>
        {registration.status_note ? (
          <div className="mt-4 p-3 rounded bg-surface border border-border text-sm">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
              Status note
            </span>
            <p className="mt-1">{registration.status_note}</p>
          </div>
        ) : null}
      </AdminCard>

      {registration.status === "Pending" && (
        <AdminCard className="p-6 flex gap-3 flex-wrap">
          <Button onClick={() => { setNote(""); setModal("confirm"); }}>
            <Check className="w-4 h-4" /> Confirm
          </Button>
          <Button
            variant="outline"
            onClick={() => { setNote(""); setModal("decline"); }}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" /> Decline
          </Button>
        </AdminCard>
      )}

      {registration.status === "Confirmed" && (
        <AdminCard className="p-6 flex gap-3 flex-wrap">
          <Button
            disabled={checkInMut.isPending}
            onClick={() => checkInMut.mutate()}
          >
            <ScanLine className="w-4 h-4" /> Check in
          </Button>
          <Button
            variant="outline"
            onClick={() => { setNote(""); setModal("cancel"); }}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" /> Cancel
          </Button>
        </AdminCard>
      )}

      {terminal && (
        <AdminCard className="p-4 text-sm text-ink-muted">
          This registration is {registration.status.toLowerCase()} and cannot be
          changed further.
        </AdminCard>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => setModal(null)}
          role="presentation"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <h3 className="font-serif text-xl font-bold">
              {modal === "confirm"
                ? "Confirm registration?"
                : modal === "decline"
                  ? "Decline registration?"
                  : "Cancel registration?"}
            </h3>
            <label className="block mt-4">
              <span className="block text-xs font-semibold mb-1">
                {modal === "confirm" ? "Optional note" : "Reason *"}
              </span>
              <Textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={() => setModal(null)}>
                Close
              </Button>
              {modal === "confirm" && (
                <Button
                  disabled={confirmMut.isPending}
                  onClick={() => confirmMut.mutate()}
                >
                  Confirm
                </Button>
              )}
              {modal === "decline" && (
                <Button
                  disabled={!note.trim() || declineMut.isPending}
                  onClick={() => declineMut.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Decline
                </Button>
              )}
              {modal === "cancel" && (
                <Button
                  disabled={!note.trim() || cancelMut.isPending}
                  onClick={() => cancelMut.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded p-3 border border-border">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
        {label}
      </div>
      <div className="text-ink mt-1 text-sm break-all">{value}</div>
    </div>
  );
}
