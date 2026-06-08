import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import {
  deleteGuide,
  getGuides,
  reorderGuides,
  toggleGuideAvailable,
  toggleGuidePublished,
} from "@/lib/guides-fns";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ClientOnly } from "@/components/admin/ClientOnly";
import {
  GuidesSortableTable,
  GuidesTableStatic,
} from "@/components/admin/GuidesSortableTable";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/guides/")({
  component: GuidesAdmin,
});

function GuidesAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "guides"],
    queryFn: () => getGuides(),
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
    queryClient.invalidateQueries({ queryKey: ["admin", "guides"] });

  const remove = useMutation({
    mutationFn: (id: string) => deleteGuide({ data: id }),
    onSuccess: () => {
      invalidate();
      toast.success("Guide deleted");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  const togglePub = useMutation({
    mutationFn: (id: string) => toggleGuidePublished({ data: id }),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to toggle"),
  });

  const toggleAvail = useMutation({
    mutationFn: (id: string) => toggleGuideAvailable({ data: id }),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to toggle"),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => reorderGuides({ data: ids }),
    onSuccess: () => toast.success("Order updated"),
    onError: () => toast.error("Failed to reorder"),
  });

  function onDelete(id: string, name: string) {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
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
    onToggleAvailable: (id: string) => toggleAvail.mutate(id),
    onTogglePublished: (id: string) => togglePub.mutate(id),
    onEdit: (id: string) =>
      navigate({
        to: "/admin/guides/$id",
        params: { id },
        search: { denied: false },
      }),
    onDelete,
  };

  return (
    <AdminLayout
      title="Guides"
      breadcrumb="Content · Licensed Guides"
      action={
        <Link
          to="/admin/guides/$id"
          params={{ id: "new" }}
          search={{ denied: false }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> New Guide
        </Link>
      }
    >
      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">Could not load guides.</p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <AdminCard>
          <ClientOnly
            fallback={
              <GuidesTableStatic items={orderedItems} actions={tableActions} />
            }
          >
            <GuidesSortableTable
              items={orderedItems}
              orderedIds={orderedIds}
              onDragEnd={onDragEnd}
              actions={tableActions}
            />
          </ClientOnly>
        </AdminCard>
      )}
    </AdminLayout>
  );
}
