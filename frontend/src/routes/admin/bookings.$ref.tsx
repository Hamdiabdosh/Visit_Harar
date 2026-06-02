import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout, AdminCard, Button, Textarea } from "@/components/AdminLayout";
import { bookings, guides, statusBadge } from "@/lib/harar-data";
import { ArrowLeft, Check, X, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/admin/bookings/$ref")({
  component: BookingDetail,
});

function BookingDetail() {
  const { ref } = useParams({ from: "/admin/bookings/$ref" });
  const b = bookings.find((x) => x.ref === ref) ?? bookings[0];
  const guide = guides.find((g) => g.id === b.guideId)!;
  const [modal, setModal] = useState<"confirm" | "decline" | null>(null);

  return (
    <AdminLayout
      title={b.ref}
      breadcrumb={`Bookings › ${b.ref}`}
      action={<Link to="/admin/bookings" className="text-sm text-ink-muted inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</Link>}
    >
      <div className="mb-4"><span className={`px-3 py-1.5 rounded-full text-sm border font-semibold ${statusBadge[b.status]}`}>{b.status}</span></div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <AdminCard className="p-6">
          <h3 className="font-serif text-lg font-bold mb-4">Guide</h3>
          <div className="flex items-center gap-4">
            <span className={`w-14 h-14 rounded-full ${guide.avatarColor} text-white grid place-items-center font-bold font-serif`}>{guide.initials}</span>
            <div>
              <div className="font-semibold">{guide.name}</div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-brand/10 text-brand font-semibold">Licensed #{guide.license}</span>
            </div>
          </div>
          <div className="space-y-2 mt-4 text-sm">
            <a href={`tel:${guide.phone}`} className="flex items-center gap-2 text-ink hover:text-brand"><Phone className="w-4 h-4" />{guide.phone}</a>
            <a href={`mailto:${guide.email}`} className="flex items-center gap-2 text-ink hover:text-brand"><Mail className="w-4 h-4" />{guide.email}</a>
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-serif text-lg font-bold mb-4">Visitor</h3>
          <div className="space-y-1.5 text-sm">
            <div className="font-semibold text-base">{b.visitor}</div>
            <div className="text-ink-muted">{b.email}</div>
            <div className="text-ink-muted">{b.phone}</div>
            <div>{b.flag} {b.country}</div>
            <div className="text-xs text-ink-muted mt-3">Submitted {b.submitted}</div>
          </div>
        </AdminCard>
      </div>

      <AdminCard className="p-6 mb-6">
        <h3 className="font-serif text-lg font-bold mb-4">Tour Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Info label="Date" value={b.date} />
          <Info label="Duration" value={b.duration} />
          <Info label="Group Size" value={String(b.group)} />
          <Info label="Special Requests" value={b.notes || "—"} />
        </div>
      </AdminCard>

      {b.status === "Pending" && (
        <AdminCard className="p-6 flex gap-3">
          <Button onClick={() => setModal("confirm")}><Check className="w-4 h-4" /> Confirm Booking</Button>
          <Button variant="outline" onClick={() => setModal("decline")} className="border-red-300 text-red-600 hover:bg-red-50"><X className="w-4 h-4" /> Decline Booking</Button>
        </AdminCard>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-bold">{modal === "confirm" ? "Confirm this booking?" : "Decline this booking?"}</h3>
            <label className="block mt-4">
              <span className="block text-xs font-semibold mb-1">{modal === "decline" ? <>Reason <span className="text-red-600">*</span></> : "Optional note"}</span>
              <Textarea rows={3} required={modal === "decline"} />
            </label>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
              {modal === "confirm" ? <Button onClick={() => setModal(null)}>Confirm</Button> : <Button onClick={() => setModal(null)} className="bg-red-600 hover:bg-red-700">Decline</Button>}
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
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">{label}</div>
      <div className="text-ink mt-1 text-sm">{value}</div>
    </div>
  );
}