import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
} from "@/components/AdminLayout";
import { Plus } from "lucide-react";
import {
  createEditorAccount,
  getUsers,
  sendUserPasswordReset,
  toggleUserActive,
  updateUser,
  type UserDto,
} from "@/lib/users-fns";
import { requireAuth } from "@/lib/auth-guard";
import { useSessionContext } from "@/lib/contexts/SessionContext";

export const Route = createFileRoute("/admin/users")({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.pathname, { roles: ["superadmin"] });
  },
  component: UsersAdmin,
});

function UsersAdmin() {
  const { user: currentUser } = useSessionContext();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "harar-2026",
  });
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => getUsers(),
  });

  const createMut = useMutation({
    mutationFn: () => createEditorAccount({ data: createForm }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "harar-2026" });
      toast.success("Editor account created — welcome email sent");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMut = useMutation({
    mutationFn: () =>
      updateUser({
        data: {
          id: editUser!.id,
          name: editForm.name,
          email: editForm.email,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setEditUser(null);
      toast.success("User updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleUserActive({ data: { id, active } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetMut = useMutation({
    mutationFn: (id: string) => sendUserPasswordReset({ data: id }),
    onSuccess: () => toast.success("Password reset email sent"),
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <AdminLayout
      title="Users"
      breadcrumb="System · Editors & Admins"
      action={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New Editor
        </Button>
      }
    >
      <AdminCard>
        {isLoading ? (
          <p className="p-6 text-sm text-ink-muted">Loading users…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
              <tr className="border-b border-border">
                {[
                  "Name",
                  "Email",
                  "Role",
                  "Status",
                  "Last Login",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="p-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentUser?.id === u.id;
                const roleColor =
                  u.role === "superadmin"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700";
                const statusColor = u.is_active
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700";
                return (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-surface"
                  >
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-ink-muted">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${roleColor}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${statusColor}`}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-ink-muted">
                      {u.last_login
                        ? new Date(u.last_login).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="p-3 text-ink-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td
                      className={`p-3 text-xs space-x-3 ${isSelf || u.role === "superadmin" ? "text-ink-muted/50" : ""}`}
                    >
                      {isSelf || u.role === "superadmin" ? (
                        <span>—</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="text-brand hover:underline"
                            onClick={() => {
                              setEditUser(u);
                              setEditForm({ name: u.name, email: u.email });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={
                              u.is_active
                                ? "text-red-600 hover:underline"
                                : "text-emerald-700 hover:underline"
                            }
                            onClick={() =>
                              toggleMut.mutate({
                                id: u.id,
                                active: !u.is_active,
                              })
                            }
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="text-ink-muted hover:underline"
                            onClick={() => resetMut.mutate(u.id)}
                          >
                            Reset Password
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AdminCard>

      {createOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl font-bold">New Editor</h3>
            <Field label="Name">
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </Field>
            <Field label="Temporary Password">
              <Input
                type="text"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMut.mutate()}
                disabled={createMut.isPending}
              >
                {createMut.isPending
                  ? "Creating…"
                  : "Create Account & Send Welcome"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => setEditUser(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl font-bold">Edit User</h3>
            <Field label="Name">
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditUser(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => updateMut.mutate()}
                disabled={updateMut.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
