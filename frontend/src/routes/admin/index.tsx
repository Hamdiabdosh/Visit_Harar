import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import { useMemo } from "react";
import { Calendar, Clock, Landmark, Users, Plus, Activity } from "lucide-react";
import { getBookings, getPendingBookingsCount } from "@/lib/bookings-fns";
import { getAttractions } from "@/lib/attractions-fns";
import { getGuides } from "@/lib/guides-fns";
import { getAuditLogs, getSystemHealth } from "@/lib/audit-fns";
import { useSessionContext } from "@/lib/contexts/SessionContext";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { role } = useSessionContext();
  const isSuperadmin = role === "superadmin";

  const { data: pending = 0 } = useQuery({
    queryKey: ["admin", "bookings", "pending-count"],
    queryFn: () => getPendingBookingsCount(),
    refetchInterval: 60_000,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["admin", "bookings", "dashboard"],
    queryFn: () => getBookings({ data: {} }),
  });

  const { data: publishedAttractions = [] } = useQuery({
    queryKey: ["admin", "attractions", "dashboard"],
    queryFn: () => getAttractions({ data: { published: true } }),
  });

  const { data: guideList = [] } = useQuery({
    queryKey: ["admin", "guides", "dashboard"],
    queryFn: () => getGuides({ data: {} }),
  });

  const { data: auditFeed } = useQuery({
    queryKey: ["admin", "audit", "feed"],
    queryFn: () => getAuditLogs({ data: { page: 1, perPage: 10 } }),
    enabled: isSuperadmin,
  });

  const { data: health } = useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: () => getSystemHealth(),
    enabled: isSuperadmin,
    refetchInterval: 120_000,
  });

  const bookingsThisMonth = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return allBookings.filter((b) => {
      const d = new Date(b.created_at);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
  }, [allBookings]);

  const publishedAttractionCount = publishedAttractions.length;
  const activeGuideCount = guideList.filter((g) => g.is_published).length;

  return (
    <AdminLayout title="Dashboard" breadcrumb="Overview of CMS activity">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric
          icon={Calendar}
          color="bg-blue-100 text-blue-700"
          label="Bookings This Month"
          value={String(bookingsThisMonth)}
        />
        <Metric
          icon={Clock}
          color="bg-amber-100 text-amber-700"
          label="Pending Bookings"
          value={String(pending)}
          highlight={pending > 0}
        />
        <Metric
          icon={Landmark}
          color="bg-emerald-100 text-emerald-700"
          label="Published Attractions"
          value={String(publishedAttractionCount)}
        />
        <Metric
          icon={Users}
          color="bg-purple-100 text-purple-700"
          label="Active Guides"
          value={String(activeGuideCount)}
        />
      </div>

      <AdminCard className="p-5 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { l: "+ New Attraction", to: "/admin/attractions" },
            { l: "+ New Guide", to: "/admin/guides" },
            { l: "+ Announcement", to: "/admin/announcements" },
            { l: "View Bookings", to: "/admin/bookings" },
          ].map((a) => (
            <Link
              key={a.l}
              to={a.to as never}
              search={{ denied: false } as never}
              className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-surface inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> {a.l.replace("+ ", "")}
            </Link>
          ))}
        </div>
      </AdminCard>

      {isSuperadmin && health && (
        <AdminCard className="p-6 mb-6">
          <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" /> System Status
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <StatusItem label="Database" value={health.database} />
            <StatusItem label="Cloudinary" value={health.cloudinary} />
            <StatusItem label="Email (Resend)" value={health.email} />
            <StatusItem
              label="Maintenance"
              value={health.maintenance_mode ? "Active" : "Off"}
              warn={health.maintenance_mode}
            />
          </div>
        </AdminCard>
      )}

      <AdminCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold">Recent Activity</h2>
          {isSuperadmin && (
            <Link
              to="/admin/audit"
              className="text-xs text-brand hover:underline"
            >
              Full audit log →
            </Link>
          )}
        </div>
        {isSuperadmin ? (
          auditFeed?.items.length ? (
            <ul className="space-y-2 text-sm">
              {auditFeed.items.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap gap-x-2 gap-y-1 py-2 border-b border-border last:border-0"
                >
                  <span className="text-ink-muted font-mono text-xs">
                    {new Date(e.created_at).toLocaleString()}
                  </span>
                  <span className="font-medium">
                    {e.user_name ?? e.user_email ?? "System"}
                  </span>
                  <span className="text-ink-muted">
                    {e.action} {e.module}
                  </span>
                  {e.record_title && (
                    <span className="text-ink-muted truncate">
                      — {e.record_title}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">
              No audit entries yet. Changes in the CMS will appear here.
            </p>
          )
        ) : (
          <p className="text-sm text-ink-muted">
            Use the module screens above to manage content.
          </p>
        )}
        <Link
          to="/admin/settings"
          className="inline-block mt-4 text-xs text-brand hover:underline"
        >
          Site settings →
        </Link>
      </AdminCard>
    </AdminLayout>
  );
}

function StatusItem({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  const ok = value === "Connected" || value === "Configured" || value === "Off";
  return (
    <div
      className={`rounded border p-3 ${warn ? "border-amber-300 bg-amber-50" : ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
    >
      <div className="text-xs text-ink-muted uppercase tracking-wide">
        {label}
      </div>
      <div className="font-medium mt-1">{value}</div>
    </div>
  );
}

function Metric({
  icon: Icon,
  color,
  label,
  value,
  highlight,
}: {
  icon: typeof Calendar;
  color: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <AdminCard className={`p-5 ${highlight ? "ring-2 ring-amber-300" : ""}`}>
      <div
        className={`w-10 h-10 rounded-md grid place-items-center ${color} mb-3`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold font-serif">{value}</div>
      <div className="text-xs text-ink-muted mt-1">{label}</div>
    </AdminCard>
  );
}
