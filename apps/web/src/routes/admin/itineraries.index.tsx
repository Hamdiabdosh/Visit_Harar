import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout, AdminCard, Toggle } from "@/components/AdminLayout";
import {
  deleteItinerary,
  getItineraries,
  toggleItineraryPublished,
} from "@/lib/itineraries-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/itineraries/")({
  component: ItinerariesAdmin,
});

function ItinerariesAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "itineraries"],
    queryFn: () => getItineraries(),
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "itineraries"] });

  const remove = useMutation({
    mutationFn: (id: string) => deleteItinerary({ data: id }),
    onSuccess: () => {
      invalidate();
      toast.success("Itinerary deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const togglePub = useMutation({
    mutationFn: (id: string) => toggleItineraryPublished({ data: id }),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to toggle"),
  });

  return (
    <AdminLayout
      title="Itineraries"
      breadcrumb="Content · Pre-built trip plans"
      action={
        <Link
          to="/admin/itineraries/$id"
          params={{ id: "new" }}
          search={{ denied: false }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> New Itinerary
        </Link>
      }
    >
      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">Could not load itineraries.</p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !items.length ? (
        <AdminCard className="p-8 text-center text-sm text-ink-muted">
          No itineraries yet. Create 2-day, 3-day, and weekend templates for
          visitors.
        </AdminCard>
      ) : (
        <AdminCard>
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
              <tr className="border-b border-border">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3">Days</th>
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
                  <td className="p-3 font-medium">{item.title}</td>
                  <td className="p-3 text-ink-muted">{item.duration}</td>
                  <td className="p-3 text-center">{item.days.length}</td>
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
                            to: "/admin/itineraries/$id",
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
                            window.confirm(`Delete "${item.title}"?`)
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
