import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout, AdminCard, Button } from "@/components/AdminLayout";
import { auditEntries } from "@/lib/harar-data";

export const Route = createFileRoute("/admin/audit")({
  component: AuditAdmin,
});

function AuditAdmin() {
  const [diff, setDiff] = useState<typeof auditEntries[number] | null>(null);
  return (
    <AdminLayout title="Audit Log" breadcrumb="System · Change history">
      <AdminCard className="p-4 mb-6 flex flex-wrap gap-3">
        <select className="rounded border border-border px-3 py-2 text-sm"><option>All users</option><option>Super Admin</option><option>Tigist Bekele</option><option>Abdi Noor</option></select>
        <select className="rounded border border-border px-3 py-2 text-sm"><option>All modules</option><option>hero</option><option>attractions</option><option>bookings</option></select>
        <input type="date" className="rounded border border-border px-3 py-2 text-sm" />
        <input type="date" className="rounded border border-border px-3 py-2 text-sm" />
      </AdminCard>

      <AdminCard>
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
            <tr className="border-b border-border">{["Timestamp","User","Module","Action","Record","Diff"].map((h) => <th key={h} className="p-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {auditEntries.map((e, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="p-3 text-ink-muted font-mono text-xs">{e.time}</td>
                <td className="p-3">{e.user}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-surface text-xs">{e.module}</span></td>
                <td className="p-3 font-medium">{e.action}</td>
                <td className="p-3 text-ink-muted">{e.record}</td>
                <td className="p-3"><button onClick={() => setDiff(e)} className="text-brand text-xs font-semibold hover:underline">View Diff</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      {diff && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setDiff(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-bold mb-4">Change Diff — {diff.record}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="text-red-700 uppercase font-bold mb-2 text-[10px]">Before</div>
                <pre className="whitespace-pre-wrap text-red-900">{"{\n  title: \"Old title\",\n  published: false\n}"}</pre>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                <div className="text-emerald-700 uppercase font-bold mb-2 text-[10px]">After</div>
                <pre className="whitespace-pre-wrap text-emerald-900">{`{\n  title: "${diff.record}",\n  published: true\n}`}</pre>
              </div>
            </div>
            <div className="flex justify-end mt-4"><Button variant="ghost" onClick={() => setDiff(null)}>Close</Button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}