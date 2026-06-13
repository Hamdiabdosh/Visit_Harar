import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout, AdminCard, SectionLabel } from "@/components/AdminLayout";
import { getAdminAnalytics } from "@/lib/analytics-fns";
import { BarChart3, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsAdmin,
});

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="text-[11px] uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div className="mt-2 font-serif text-3xl font-bold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-ink-muted">{sub}</div> : null}
    </div>
  );
}

function AnalyticsAdmin() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => getAdminAnalytics(),
    retry: false,
  });

  return (
    <AdminLayout
      title="Analytics"
      breadcrumb="System · Site performance"
    >
      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">Could not load analytics.</p>
        </AdminCard>
      ) : isLoading || !data ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <div className="space-y-8">
          {data.analytics_id ? (
            <AdminCard className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <SectionLabel>Google Analytics</SectionLabel>
                <p className="text-sm text-ink-muted mt-1">
                  Page views and traffic details are tracked in Google Analytics
                  ({data.analytics_id}).
                </p>
              </div>
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                Open GA <ExternalLink className="w-4 h-4" />
              </a>
            </AdminCard>
          ) : (
            <AdminCard className="p-5 border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-900">
                Add a Google Analytics ID in{" "}
                <Link to="/admin/settings" className="font-semibold underline">
                  Settings
                </Link>{" "}
                to track page views externally.
              </p>
            </AdminCard>
          )}

          <div>
            <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand" /> Bookings
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard label="Total" value={data.bookings.total} />
              <StatCard label="Pending" value={data.bookings.pending} />
              <StatCard label="Confirmed" value={data.bookings.confirmed} />
              <StatCard label="Cancelled" value={data.bookings.cancelled} />
              <StatCard
                label="Last 30 days"
                value={data.bookings.last_30_days}
              />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold mb-4">Inquiries</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard label="Total" value={data.inquiries.total} />
              <StatCard label="Unread" value={data.inquiries.unread} />
              <StatCard
                label="Last 30 days"
                value={data.inquiries.last_30_days}
              />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold mb-4">
              Published content
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                label="Attractions"
                value={data.content.published_attractions}
              />
              <StatCard label="Guides" value={data.content.published_guides} />
              <StatCard
                label="News"
                value={data.content.published_announcements}
              />
              <StatCard
                label="Partners"
                value={data.content.published_partners}
              />
              <StatCard
                label="Itineraries"
                value={data.content.published_itineraries}
              />
            </div>
          </div>

          {data.top_guides.length > 0 ? (
            <AdminCard className="p-6">
              <SectionLabel>Top guides by bookings</SectionLabel>
              <table className="w-full text-sm mt-4">
                <thead className="text-[11px] uppercase text-ink-muted">
                  <tr className="border-b border-border">
                    <th className="p-2 text-left">Guide</th>
                    <th className="p-2 text-right">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_guides.map((g) => (
                    <tr key={g.slug} className="border-b border-border">
                      <td className="p-2">{g.name}</td>
                      <td className="p-2 text-right font-medium">{g.bookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminCard>
          ) : null}

          {data.recent_bookings.length > 0 ? (
            <AdminCard className="p-6">
              <SectionLabel>Recent bookings</SectionLabel>
              <table className="w-full text-sm mt-4">
                <thead className="text-[11px] uppercase text-ink-muted">
                  <tr className="border-b border-border">
                    <th className="p-2 text-left">Reference</th>
                    <th className="p-2 text-left">Visitor</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_bookings.map((b) => (
                    <tr key={b.reference} className="border-b border-border">
                      <td className="p-2">
                        <Link
                          to="/admin/bookings/$ref"
                          params={{ ref: b.reference }}
                          search={{ denied: false }}
                          className="text-brand hover:underline font-mono text-xs"
                        >
                          {b.reference}
                        </Link>
                      </td>
                      <td className="p-2">{b.visitor_name}</td>
                      <td className="p-2 text-center">{b.status}</td>
                      <td className="p-2 text-right text-ink-muted text-xs">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminCard>
          ) : null}
        </div>
      )}
    </AdminLayout>
  );
}
