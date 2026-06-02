import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import { bookings, statusBadge, guides, type BookingStatus } from "@/lib/harar-data";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsAdmin,
});

const tabs: (BookingStatus | "All")[] = ["All", "Pending", "Confirmed", "Declined", "Cancelled"];

function BookingsAdmin() {
  const [tab, setTab] = useState<(BookingStatus | "All")>("All");
  const [guide, setGuide] = useState("All");
  const filtered = bookings.filter((b) => (tab === "All" || b.status === tab) && (guide === "All" || b.guideName === guide));

  return (
    <AdminLayout title="Bookings" breadcrumb="Manage tour bookings">
      <AdminCard className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {tabs.map((t) => {
            const count = t === "All" ? bookings.length : bookings.filter((b) => b.status === t).length;
            return (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === t ? "bg-brand text-white" : "hover:bg-surface"}`}>
                {t} <span className={`ml-1 text-xs ${tab === t ? "text-white/80" : "text-ink-muted"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex gap-2 items-center">
          <select value={guide} onChange={(e) => setGuide(e.target.value)} className="rounded border border-border px-3 py-1.5 text-sm">
            <option>All</option>
            {guides.map((g) => <option key={g.id}>{g.name}</option>)}
          </select>
          <input type="date" className="rounded border border-border px-3 py-1.5 text-sm" />
          <input type="date" className="rounded border border-border px-3 py-1.5 text-sm" />
        </div>
      </AdminCard>

      <AdminCard>
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
            <tr className="border-b border-border">
              {["Ref","Guide","Visitor","Country","Date","Duration","Group","Status","Submitted",""].map((h) => (
                <th key={h} className="p-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.ref} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="p-3 font-mono text-xs font-semibold text-brand">{b.ref}</td>
                <td className="p-3">{b.guideName}</td>
                <td className="p-3 font-medium">{b.visitor}</td>
                <td className="p-3"><span>{b.flag}</span> {b.country}</td>
                <td className="p-3">{b.date}</td>
                <td className="p-3 text-ink-muted">{b.duration}</td>
                <td className="p-3 text-ink-muted">{b.group}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] border font-medium ${statusBadge[b.status]}`}>{b.status}</span></td>
                <td className="p-3 text-ink-muted text-xs">{b.submitted}</td>
                <td className="p-3"><Link to="/admin/bookings/$ref" params={{ ref: b.ref }} className="text-brand hover:text-gold"><ArrowRight className="w-4 h-4" /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </AdminLayout>
  );
}