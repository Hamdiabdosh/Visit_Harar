import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout, AdminCard, Button, Field, Input } from "@/components/AdminLayout";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

const users = [
  { name: "Super Admin", email: "admin@visitharar.gov.et", role: "superadmin", roleColor: "bg-emerald-100 text-emerald-700", status: "Active", statusColor: "bg-emerald-100 text-emerald-700", login: "Today", created: "Jan 2026", self: true },
  { name: "Tigist Bekele", email: "tigist@visitharar.gov.et", role: "editor", roleColor: "bg-blue-100 text-blue-700", status: "Active", statusColor: "bg-emerald-100 text-emerald-700", login: "Yesterday", created: "Mar 2026", self: false },
  { name: "Abdi Noor", email: "abdi@visitharar.gov.et", role: "editor", roleColor: "bg-blue-100 text-blue-700", status: "Inactive", statusColor: "bg-red-100 text-red-700", login: "May 12, 2026", created: "Apr 2026", self: false },
];

function UsersAdmin() {
  const [modal, setModal] = useState(false);
  return (
    <AdminLayout title="Users" breadcrumb="System · Editors & Admins" action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> New Editor</Button>}>
      <AdminCard>
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
            <tr className="border-b border-border">{["Name","Email","Role","Status","Last Login","Created","Actions"].map((h) => <th key={h} className="p-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-ink-muted">{u.email}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-medium ${u.roleColor}`}>{u.role}</span></td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-medium ${u.statusColor}`}>{u.status}</span></td>
                <td className="p-3 text-ink-muted">{u.login}</td>
                <td className="p-3 text-ink-muted">{u.created}</td>
                <td className={`p-3 text-xs space-x-3 ${u.self ? "text-ink-muted/50" : ""}`}>
                  {u.self ? <span>—</span> : (
                    <>
                      <button className="text-brand hover:underline">Edit</button>
                      <button className={u.status === "Active" ? "text-red-600 hover:underline" : "text-emerald-700 hover:underline"}>{u.status === "Active" ? "Deactivate" : "Activate"}</button>
                      <button className="text-ink-muted hover:underline">Reset Password</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-bold">New Editor</h3>
            <Field label="Name"><Input /></Field>
            <Field label="Email"><Input type="email" /></Field>
            <Field label="Temporary Password"><Input type="text" defaultValue="harar-2026" /></Field>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => setModal(false)}>Create Account & Send Welcome</Button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}