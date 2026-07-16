import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import { useMemo } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  Landmark,
  Mail,
  Megaphone,
  Users,
  Plus,
  Activity,
  AlertCircle,
} from "lucide-react";
import { getBookings } from "@/lib/bookings-fns";
import { getAttractions } from "@/lib/attractions-fns";
import { getGuides } from "@/lib/guides-fns";
import { getAuditLogs, getSystemHealth } from "@/lib/audit-fns";
import { getAdminDashboardStats } from "@/lib/dashboard-fns";
import { useSessionContext } from "@/lib/contexts/SessionContext";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { role } = useSessionContext();
  const isSuperadmin = role === "superadmin";

  const { data: stats } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: () => getAdminDashboardStats(),
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

  const draftTotal = stats
    ? stats.unpublished_attractions +
      stats.unpublished_guides +
      stats.unpublished_announcements +
      stats.unpublished_pages +
      (stats.hero_unpublished ? 1 : 0) +
      (stats.contact_unpublished ? 1 : 0)
    : 0;

  const needsAttention =
    (stats?.pending_bookings ?? 0) +
    (stats?.unread_inquiries ?? 0) +
    draftTotal;

  return (
    <AdminLayout title="Feed" breadcrumb="Home · Overview (activity feed in next sprint)">
      {needsAttention > 0 && stats && (
        <AdminCard className="p-5 mb-6 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-amber-900">Needs attention</h2>
              <ul className="mt-2 space-y-1 text-sm text-amber-800">
                {stats.pending_bookings > 0 && (
                  <li>
                    <Link
                      to="/admin/bookings"
                      className="hover:underline font-medium"
                    >
                      {stats.pending_bookings} pending booking
                      {stats.pending_bookings === 1 ? "" : "s"}
                    </Link>
                  </li>
                )}
                {stats.unread_inquiries > 0 && (
                  <li>
                    <Link
                      to="/admin/inquiries"
                      className="hover:underline font-medium"
                    >
                      {stats.unread_inquiries} unread inquir
                      {stats.unread_inquiries === 1 ? "y" : "ies"}
                    </Link>
                  </li>
                )}
                {draftTotal > 0 && (
                  <li>
                    {draftTotal} unpublished content item
                    {draftTotal === 1 ? "" : "s"} across CMS modules
                  </li>
                )}
              </ul>
            </div>
          </div>
        </AdminCard>
      )}

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
          value={String(stats?.pending_bookings ?? 0)}
          highlight={(stats?.pending_bookings ?? 0) > 0}
          href="/admin/bookings"
        />
        <Metric
          icon={Mail}
          color="bg-rose-100 text-rose-700"
          label="Unread Inquiries"
          value={String(stats?.unread_inquiries ?? 0)}
          highlight={(stats?.unread_inquiries ?? 0) > 0}
          href="/admin/inquiries"
        />
        <Metric
          icon={FileText}
          color="bg-orange-100 text-orange-700"
          label="Unpublished Drafts"
          value={String(draftTotal)}
          highlight={draftTotal > 0}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <Metric
          icon={Megaphone}
          color="bg-sky-100 text-sky-700"
          label="Draft Announcements"
          value={String(stats?.unpublished_announcements ?? 0)}
          href="/admin/announcements"
        />
        <Metric
          icon={ImageIcon}
          color="bg-indigo-100 text-indigo-700"
          label="Hero Unpublished"
          value={stats?.hero_unpublished ? "Yes" : "No"}
          highlight={stats?.hero_unpublished}
          href="/admin/hero"
        />
      </div>

      <AdminCard className="p-5 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { l: "+ New Attraction", to: "/admin/attractions" },
            { l: "+ New Guide", to: "/admin/guides" },
            { l: "+ Announcement", to: "/admin/announcements" },
            { l: "View Bookings", to: "/admin/bookings" },
            { l: "View Inquiries", to: "/admin/inquiries" },
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
            <StatusItem label="Media storage" value={health.storage} />
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
  const ok =
    value === "Connected" ||
    value === "Configured" ||
    value === "Writable" ||
    value === "Off";
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
  href,
}: {
  icon: typeof Calendar;
  color: string;
  label: string;
  value: string;
  highlight?: boolean;
  href?: string;
}) {
  const card = (
    <AdminCard
      className={`p-5 ${highlight ? "ring-2 ring-amber-300" : ""} ${href ? "hover:bg-surface transition-colors" : ""}`}
    >
      <div
        className={`w-10 h-10 rounded-md grid place-items-center ${color} mb-3`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold font-serif">{value}</div>
      <div className="text-xs text-ink-muted mt-1">{label}</div>
    </AdminCard>
  );

  if (href) {
    return (
      <Link to={href as never} search={{ denied: false } as never}>
        {card}
      </Link>
    );
  }

  return card;
}
