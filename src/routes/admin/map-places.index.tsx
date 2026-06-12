import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout, AdminCard, Button } from "@/components/AdminLayout";
import {
  deleteMapPlace,
  getMapPlaces,
  toggleMapPlacePublished,
} from "@/lib/map-places-fns";
import { mapPlaceTypeLabel } from "@/lib/map-place-styles";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/map-places/")({
  component: MapPlacesAdmin,
});

function MapPlacesAdmin() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "map-places"],
    queryFn: () => getMapPlaces(),
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "map-places"] });

  const togglePub = useMutation({
    mutationFn: (id: string) => toggleMapPlacePublished({ data: id }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "map-places"] });
    },
    onError: () => toast.error("Failed to update published status"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMapPlace({ data: id }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "map-places"] });
      toast.success("Place removed from map");
    },
    onError: () => toast.error("Failed to delete"),
  });

  function onDelete(id: string, title: string) {
    if (window.confirm(`Remove "${title}" from the map?`)) {
      remove.mutate(id);
    }
  }

  return (
    <AdminLayout
      title="Map Places"
      breadcrumb="Content · Map"
      action={
        <Link to="/admin/map-places/$id" params={{ id: "new" }}>
          <Button>
            <Plus className="w-4 h-4" /> Add Place
          </Button>
        </Link>
      }
    >
      <AdminCard>
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
            <tr className="border-b border-border">
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Coordinates</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="p-4" colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-ink-muted">
                  No map places yet. Add pins for museums, hotels, gates, and
                  more.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="p-4 font-medium">{p.title}</td>
                  <td className="p-4 text-ink-muted">
                    {mapPlaceTypeLabel(p.place_type)}
                  </td>
                  <td className="p-4 text-ink-muted text-xs font-mono">
                    {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => togglePub.mutate(p.id)}
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        p.is_published
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {p.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to="/admin/map-places/$id"
                        params={{ id: p.id }}
                        className="text-brand hover:text-gold"
                        aria-label={`Edit ${p.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id, p.title)}
                        className="text-ink-muted hover:text-red-600"
                        aria-label={`Delete ${p.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminCard>
    </AdminLayout>
  );
}
