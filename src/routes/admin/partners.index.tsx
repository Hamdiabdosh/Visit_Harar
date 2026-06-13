import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout, AdminCard, Toggle } from "@/components/AdminLayout";
import {
  deletePartner,
  getPartners,
  togglePartnerPublished,
} from "@/lib/partners-fns";
import { PARTNER_CATEGORIES } from "@/lib/validators/partners";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/partners/")({
  component: PartnersAdmin,
});

function PartnersAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("All");

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "partners", category],
    queryFn: () =>
      getPartners({
        data: category === "All" ? undefined : { category },
      }),
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "partners"] });

  const remove = useMutation({
    mutationFn: (id: string) => deletePartner({ data: id }),
    onSuccess: () => {
      invalidate();
      toast.success("Partner deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const togglePub = useMutation({
    mutationFn: (id: string) => togglePartnerPublished({ data: id }),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to toggle"),
  });

  return (
    <AdminLayout
      title="Partners & Services"
      breadcrumb="Content · Local businesses"
      action={
        <Link
          to="/admin/partners/$id"
          params={{ id: "new" }}
          search={{ denied: false }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> New Partner
        </Link>
      }
    >
      <AdminCard className="p-3 mb-6 flex flex-wrap gap-1">
        {["All", ...PARTNER_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              category === c ? "bg-brand text-white" : "hover:bg-surface"
            }`}
          >
            {c}
          </button>
        ))}
      </AdminCard>

      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">Could not load partners.</p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !items.length ? (
        <AdminCard className="p-8 text-center text-sm text-ink-muted">
          No partners yet. Add hotels, restaurants, and other local services.
        </AdminCard>
      ) : (
        <AdminCard>
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
              <tr className="border-b border-border">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3">Published</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-ink-muted">{item.category}</td>
                  <td className="p-3 text-center">
                    <Toggle
                      checked={item.is_published}
                      onChange={() => togglePub.mutate(item.id)}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="p-2 text-ink-muted hover:text-brand"
                        onClick={() =>
                          navigate({
                            to: "/admin/partners/$id",
                            params: { id: item.id },
                            search: { denied: false },
                          })
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-ink-muted hover:text-red-600"
                        onClick={() => {
                          if (
                            window.confirm(`Delete "${item.name}"?`)
                          ) {
                            remove.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      )}
    </AdminLayout>
  );
}
