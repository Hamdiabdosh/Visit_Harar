import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout, AdminCard, Button } from "@/components/AdminLayout";
import { getAuditLogs, type AuditLogDto } from "@/lib/audit-fns";
import { requireAuth } from "@/lib/auth-guard";

const MODULES = [
  "hero",
  "attractions",
  "guides",
  "announcements",
  "pages",
  "contact",
  "gallery",
  "bookings",
  "settings",
  "media",
  "users",
];

export const Route = createFileRoute("/admin/audit")({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.pathname, { roles: ["superadmin"] });
  },
  component: AuditAdmin,
});

function AuditAdmin() {
  const [diff, setDiff] = useState<AuditLogDto | null>(null);
  const [module, setModule] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit", page, module, dateFrom, dateTo],
    queryFn: () =>
      getAuditLogs({
        data: {
          page,
          perPage: 50,
          module: module || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      }),
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 50));

  return (
    <AdminLayout title="Audit Log" breadcrumb="System · Change history">
      <AdminCard className="p-4 mb-6 flex flex-wrap gap-3">
        <select
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setPage(1);
          }}
          className="rounded border border-border px-3 py-2 text-sm"
        >
          <option value="">All modules</option>
          {MODULES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="rounded border border-border px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="rounded border border-border px-3 py-2 text-sm"
        />
      </AdminCard>

      <AdminCard>
        {isLoading ? (
          <p className="p-6 text-sm text-ink-muted">Loading audit log…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-ink-muted">No audit entries yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
              <tr className="border-b border-border">
                {[
                  "Timestamp",
                  "User",
                  "Module",
                  "Action",
                  "Record",
                  "Diff",
                ].map((h) => (
                  <th key={h} className="p-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="p-3 text-ink-muted font-mono text-xs">
                    {formatTime(e.created_at)}
                  </td>
                  <td className="p-3">{e.user_name ?? e.user_email ?? "—"}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-surface text-xs">
                      {e.module}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{e.action}</td>
                  <td className="p-3 text-ink-muted">
                    {e.record_title ?? e.record_id ?? "—"}
                  </td>
                  <td className="p-3">
                    {(e.before || e.after) && (
                      <button
                        type="button"
                        onClick={() => setDiff(e)}
                        className="text-brand text-xs font-semibold hover:underline"
                      >
                        View Diff
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>

      <div className="flex justify-center items-center gap-2 mt-4 text-sm">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded hover:bg-surface disabled:opacity-40"
        >
          ←
        </button>
        <span className="text-ink-muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded hover:bg-surface disabled:opacity-40"
        >
          →
        </button>
      </div>

      {diff && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => setDiff(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl font-bold mb-4">
              Change Diff — {diff.record_title ?? diff.record_id}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="text-red-700 uppercase font-bold mb-2 text-[10px]">
                  Before
                </div>
                <pre className="whitespace-pre-wrap text-red-900">
                  {diff.before
                    ? JSON.stringify(diff.before, null, 2)
                    : "(none)"}
                </pre>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                <div className="text-emerald-700 uppercase font-bold mb-2 text-[10px]">
                  After
                </div>
                <pre className="whitespace-pre-wrap text-emerald-900">
                  {diff.after ? JSON.stringify(diff.after, null, 2) : "(none)"}
                </pre>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="ghost" onClick={() => setDiff(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString();
}
