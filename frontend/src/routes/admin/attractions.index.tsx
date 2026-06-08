import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import { ClientOnly } from "@/components/admin/ClientOnly";
import {
  AttractionsSortableTable,
  AttractionsTableStatic,
} from "@/components/admin/AttractionsSortableTable";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  deleteAttraction,
  getAttractions,
  updateSortOrder,
  toggleAttractionFeatured,
  toggleAttractionPublished,
} from "@/lib/attractions-fns";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/attractions/")({
  component: AttractionsAdmin,
});

function AttractionsAdmin() {
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "attractions"],
    queryFn: () => getAttractions(),
    retry: false,
  });

  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const itemsById = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );
  const orderedItems = useMemo(() => {
    const list = orderedIds
      .map((id) => itemsById.get(id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
    if (list.length === items.length) return list;
    return items;
  }, [orderedIds, itemsById, items]);

  useEffect(() => {
    setOrderedIds(items.map((i) => i.id));
  }, [items]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "attractions"] });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => updateSortOrder({ data: ids }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "attractions"] });
      toast.success("Order updated");
    },
    onError: () => toast.error("Failed to reorder"),
  });

  const togglePub = useMutation({
    mutationFn: (id: string) => toggleAttractionPublished({ data: id }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "attractions"] });
    },
    onError: () => toast.error("Failed to update published status"),
  });

  const toggleFeat = useMutation({
    mutationFn: (id: string) => toggleAttractionFeatured({ data: id }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "attractions"] });
    },
    onError: () => toast.error("Failed to update featured status"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAttraction({ data: id }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "attractions"] });
      toast.success("Attraction deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  function onDelete(id: string, title: string) {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      remove.mutate(id);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      const next = arrayMove(prev, oldIndex, newIndex);
      reorder.mutate(next);
      return next;
    });
  }

  const tableActions = {
    onToggleFeatured: (id: string) => toggleFeat.mutate(id),
    onTogglePublished: (id: string) => togglePub.mutate(id),
    onDelete,
  };

  return (
    <AdminLayout
      title="Attractions"
      breadcrumb="Content · Attractions"
      action={
        <Link
          to="/admin/attractions/$id"
          params={{ id: "new" }}
          search={{ denied: false }}
          className="px-4 py-2 rounded-md bg-brand text-white text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-brand-dark"
        >
          <Plus className="w-4 h-4" /> New Attraction
        </Link>
      }
    >
      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">
            Could not load attractions. Run{" "}
            <code className="font-mono">
              docker compose up -d && bun run db:push && bun run db:seed
            </code>
          </p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <AdminCard>
          {items.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-muted">
              No attractions yet.{" "}
              <Link
                to="/admin/attractions/$id"
                params={{ id: "new" }}
                search={{ denied: false }}
                className="text-brand font-medium"
              >
                Create one
              </Link>
            </p>
          ) : (
            <ClientOnly
              fallback={
                <AttractionsTableStatic
                  items={orderedItems}
                  actions={tableActions}
                />
              }
            >
              <AttractionsSortableTable
                items={orderedItems}
                orderedIds={orderedIds}
                onDragEnd={onDragEnd}
                actions={tableActions}
              />
            </ClientOnly>
          )}
        </AdminCard>
      )}
    </AdminLayout>
  );
}
