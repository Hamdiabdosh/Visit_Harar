import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Button, Toggle } from "@/components/AdminLayout";
import { useState } from "react";
import { Calendar, Clock, Landmark, Users, Plus } from "lucide-react";
import { attractions, guides, recentActivity, bookings, pendingCount } from "@/lib/harar-data";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [maint, setMaint] = useState(false);
  return (
    <AdminLayout title="Dashboard" breadcrumb="Overview of CMS activity">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric icon={Calendar} color="bg-blue-100 text-blue-700" label="Bookings This Month" value={bookings.length.toString()} />
        <Metric icon={Clock} color="bg-amber-100 text-amber-700" label="Pending Bookings" value={pendingCount.toString()} highlight />
        <Metric icon={Landmark} color="bg-emerald-100 text-emerald-700" label="Published Attractions" value={attractions.filter(a => a.published).length.toString()} />
        <Metric icon={Users} color="bg-purple-100 text-purple-700" label="Active Guides" value={guides.length.toString()} />
      </div>

      <AdminCard className="p-5 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { l: "+ New Attraction", to: "/admin/attractions" },
            { l: "+ New Guide", to: "/admin/guides" },
            { l: "+ Announcement", to: "/admin/announcements" },
            { l: "View Bookings", to: "/admin/bookings" },
          ].map((a) => (
            <Link key={a.l} to={a.to as never} className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-surface inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> {a.l.replace("+ ", "")}
            </Link>
          ))}
        </div>
      </AdminCard>

      <div className="grid lg:grid-cols-3 gap-6">
        <AdminCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold">Recent Activity</h2>
            <Link to="/admin/audit" className="text-xs text-brand hover:underline">View full audit log →</Link>
          </div>
          <ul className="space-y-3">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm py-2 border-b border-border last:border-0">
                <span className={`mt-1.5 w-2 h-2 rounded-full ${a.color}`} />
                <div className="flex-1">
                  <div>{a.text}</div>
                  <div className="text-xs text-ink-muted mt-0.5">{a.user} · {a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard className="p-6">
          <h2 className="font-serif text-xl font-bold mb-4">System Status</h2>
          <ul className="space-y-3 text-sm">
            {[
              ["Database", "Connected"],
              ["Cloudinary", "Connected"],
              ["Email Service", "Connected"],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between items-center">
                <span className="text-ink-muted">{k}</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {v}
                </span>
              </li>
            ))}
            <li className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-ink-muted">Maintenance Mode</span>
              <Toggle checked={maint} onChange={setMaint} />
            </li>
          </ul>
          <Button variant="ghost" className="mt-4 w-full text-xs">Open status page</Button>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}

function Metric({ icon: Icon, color, label, value, highlight }: { icon: typeof Calendar; color: string; label: string; value: string; highlight?: boolean }) {
  return (
    <AdminCard className={`p-5 ${highlight ? "ring-2 ring-amber-300" : ""}`}>
      <div className={`w-10 h-10 rounded-md grid place-items-center ${color} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold font-serif">{value}</div>
      <div className="text-xs text-ink-muted mt-1">{label}</div>
    </AdminCard>
  );
}