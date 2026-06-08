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
  cancelBooking,
  confirmBooking,
  declineBooking,
  getBookingByRefForAdmin,
  resendNotification,
} from "@/lib/bookings-fns";
import {
  statusBadge,
  formatBookingDate,
  formatSubmittedAt,
} from "@/lib/booking-ui";
import { optimizeImage } from "@/lib/media-url";
import { ArrowLeft, Check, X, Mail, Phone, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/bookings/$ref")({
  component: BookingDetail,
});

function BookingDetail() {
  const { ref } = useParams({ from: "/admin/bookings/$ref" });
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<"confirm" | "decline" | "cancel" | null>(
    null,
  );
  const [note, setNote] = useState("");

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "booking", ref],
    queryFn: () => getBookingByRefForAdmin({ data: ref }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "booking", ref] });
    void queryClient.invalidateQueries({
      queryKey: ["admin", "bookings", "pending-count"],
    });
  };

  const confirmMut = useMutation({
    mutationFn: () =>
      confirmBooking({ data: { id: booking!.id, note: note || undefined } }),
    onSuccess: () => {
      toast.success("Booking confirmed");
      setModal(null);
      setNote("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const declineMut = useMutation({
    mutationFn: () => declineBooking({ data: { id: booking!.id, note } }),
    onSuccess: () => {
      toast.success("Booking declined");
      setModal(null);
      setNote("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelMut = useMutation({
    mutationFn: () => cancelBooking({ data: { id: booking!.id, note } }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      setModal(null);
      setNote("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resendMut = useMutation({
    mutationFn: () => resendNotification({ data: booking!.id }),
    onSuccess: () => toast.success("Notification email sent"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <AdminLayout title="Booking" breadcrumb="Bookings">
        <p className="text-sm text-ink-muted">Loading…</p>
      </AdminLayout>
    );
  }

  if (isError || !booking) {
    return (
      <AdminLayout
        title="Booking not found"
        breadcrumb="Bookings"
        action={
          <Link
            to="/admin/bookings"
            search={{ denied: false }}
            className="text-sm text-ink-muted inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      >
        <p className="text-sm text-ink-muted">
          No booking with reference {ref}.
        </p>
      </AdminLayout>
    );
  }

  const g = booking.guide;
  const photoSrc = g.photo ? optimizeImage(g.photo, { width: 120 }) : null;
  const terminal =
    booking.status === "Declined" || booking.status === "Cancelled";

  return (
    <AdminLayout
      title={booking.booking_ref}
      breadcrumb={`Bookings › ${booking.booking_ref}`}
      action={
        <Link
          to="/admin/bookings"
          search={{ denied: false }}
          className="text-sm text-ink-muted inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`px-3 py-1.5 rounded-full text-sm border font-semibold ${statusBadge[booking.status]}`}
        >
          {booking.status}
        </span>
        {booking.updated_by_name && (
          <span className="text-xs text-ink-muted">
            Updated by {booking.updated_by_name} ·{" "}
            {formatSubmittedAt(booking.updated_at)}
          </span>
        )}
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
          <h3 className="font-serif text-lg font-bold mb-4">Guide</h3>
          <div className="flex items-center gap-4">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <span className="w-14 h-14 rounded-full bg-brand text-white grid place-items-center font-bold font-serif">
                {g.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <div className="font-semibold">{g.name}</div>
              {g.license_number && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-brand/10 text-brand font-semibold">
                  Licensed #{g.license_number}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2 mt-4 text-sm">
            {g.phone && (
              <a
                href={`tel:${g.phone}`}
                className="flex items-center gap-2 text-ink hover:text-brand"
              >
                <Phone className="w-4 h-4" />
                {g.phone}
              </a>
            )}
            {g.email && (
              <a
                href={`mailto:${g.email}`}
                className="flex items-center gap-2 text-ink hover:text-brand"
              >
                <Mail className="w-4 h-4" />
                {g.email}
              </a>
            )}
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-serif text-lg font-bold mb-4">Visitor</h3>
          <div className="space-y-1.5 text-sm">
            <div className="font-semibold text-base">
              {booking.visitor_name}
            </div>
            <div className="text-ink-muted">{booking.visitor_email}</div>
            {booking.visitor_phone && (
              <div className="text-ink-muted">{booking.visitor_phone}</div>
            )}
            <div>{booking.visitor_country}</div>
            <div className="text-xs text-ink-muted mt-3">
              Submitted {formatSubmittedAt(booking.created_at)}
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard className="p-6 mb-6">
        <h3 className="font-serif text-lg font-bold mb-4">Tour Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Info label="Date" value={formatBookingDate(booking.tour_date)} />
          <Info label="Duration" value={booking.tour_duration} />
          <Info label="Group Size" value={String(booking.group_size)} />
          <Info
            label="Special Requests"
            value={booking.special_requests || "—"}
          />
        </div>
        {booking.status_note && (
          <div className="mt-4 p-3 rounded bg-surface border border-border text-sm">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
              Status note
            </span>
            <p className="mt-1">{booking.status_note}</p>
          </div>
        )}
      </AdminCard>

      {booking.status === "Pending" && (
        <AdminCard className="p-6 flex gap-3 flex-wrap">
          <Button
            onClick={() => {
              setNote("");
              setModal("confirm");
            }}
          >
            <Check className="w-4 h-4" /> Confirm Booking
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setNote("");
              setModal("decline");
            }}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" /> Decline Booking
          </Button>
        </AdminCard>
      )}

      {booking.status === "Confirmed" && (
        <AdminCard className="p-6">
          <Button
            variant="outline"
            onClick={() => {
              setNote("");
              setModal("cancel");
            }}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" /> Cancel Booking
          </Button>
        </AdminCard>
      )}

      {terminal && (
        <AdminCard className="p-4 text-sm text-ink-muted">
          This booking is {booking.status.toLowerCase()} and cannot be changed.
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
                ? "Confirm this booking?"
                : modal === "decline"
                  ? "Decline this booking?"
                  : "Cancel this booking?"}
            </h3>
            <label className="block mt-4">
              <span className="block text-xs font-semibold mb-1">
                {modal === "confirm" ? (
                  "Optional note"
                ) : (
                  <>
                    Reason <span className="text-red-600">*</span>
                  </>
                )}
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
                  Cancel booking
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
      <div className="text-ink mt-1 text-sm">{value}</div>
    </div>
  );
}
