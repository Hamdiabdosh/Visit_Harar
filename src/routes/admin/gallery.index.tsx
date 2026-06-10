import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  AdminLayout,
  AdminCard,
  Button,
  Toggle,
  Field,
  Input,
  Textarea,
} from "@/components/AdminLayout";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createAlbum,
  deleteAlbum,
  getAlbums,
  reorderAlbums,
  updateAlbum,
} from "@/lib/gallery-fns";
import { AdminGalleryListSkeleton } from "@/components/public/GallerySkeletons";

export const Route = createFileRoute("/admin/gallery/")({
  component: GalleryAdmin,
});

function GalleryAdmin() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [items, setItems] = useState<Awaited<ReturnType<typeof getAlbums>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const rows = await getAlbums();
      setItems(rows);
      setOrderedIds(rows.map((r) => r.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load albums");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const itemsById = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );
  const orderedItems = useMemo(() => {
    const list = orderedIds.map((id) => itemsById.get(id)).filter(Boolean);
    if (list.length === items.length) return list;
    return items;
  }, [orderedIds, itemsById, items]);

  async function onCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await createAlbum({
        data: {
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
        },
      });
      toast.success("Album created");
      setNewTitle("");
      setNewDesc("");
      setShowNew(false);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string, title: string) {
    if (
      !window.confirm(
        `Delete album "${title}"? This will delete ALL items inside it.`,
      )
    )
      return;
    try {
      await deleteAlbum({ data: id });
      toast.success("Album deleted");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function onTogglePublished(id: string, next: boolean) {
    try {
      await updateAlbum({ data: { id, data: { is_published: next } } });
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      const next = arrayMove(prev, oldIndex, newIndex);
      reorderAlbums({ data: next })
        .then(() => toast.success("Order updated"))
        .catch(() => toast.error("Failed to reorder"))
        .finally(() => refresh());
      return next;
    });
  }

  return (
    <AdminLayout
      title="Gallery"
      breadcrumb="Content · Gallery"
      action={
        <Button onClick={() => setShowNew((v) => !v)}>
          <Plus className="w-4 h-4" /> New Album
        </Button>
      }
    >
      {showNew && (
        <AdminCard className="p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Album Title">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Harar Jugol Walls"
              />
            </Field>
            <Field label="Description (optional)">
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                placeholder="Short description for visitors…"
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowNew(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void onCreate()}
              disabled={creating || !newTitle.trim()}
            >
              {creating ? "Creating…" : "Create Album"}
            </Button>
          </div>
        </AdminCard>
      )}

      {error ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">{error}</p>
        </AdminCard>
      ) : loading ? (
        <AdminGalleryListSkeleton />
      ) : items.length === 0 ? (
        <AdminCard className="p-10 text-center">
          <p className="text-sm text-ink-muted">No albums yet.</p>
        </AdminCard>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {orderedItems.map((a) => (
                <SortableAlbumCard
                  key={a.id}
                  id={a.id}
                  title={a.title}
                  count={a.item_count}
                  cover={a.cover_image}
                  published={a.is_published}
                  onTogglePublished={(v) => void onTogglePublished(a.id, v)}
                  onDelete={() => void onDelete(a.id, a.title)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </AdminLayout>
  );
}

function SortableAlbumCard({
  id,
  title,
  count,
  cover,
  published,
  onTogglePublished,
  onDelete,
}: {
  id: string;
  title: string;
  count: number;
  cover: string | null;
  published: boolean;
  onTogglePublished: (v: boolean) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AdminCard className="overflow-hidden">
        <div className="aspect-[4/3] bg-surface relative overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-gold/10 to-surface" />
          )}
          <button
            type="button"
            className="absolute top-3 left-3 inline-flex p-2 rounded bg-white/90 border border-border text-ink-muted hover:text-ink cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-white/90 text-ink font-semibold">
            {count} items
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold truncate">{title}</h3>
              <div className="text-xs text-ink-muted mt-0.5">
                {published ? "Published" : "Draft"}
              </div>
            </div>
            <div className="shrink-0">
              <Toggle checked={published} onChange={onTogglePublished} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Link
              to="/admin/gallery/$albumId"
              params={{ albumId: id }}
              className="text-sm font-medium text-brand hover:underline"
            >
              Manage items →
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="p-2 text-ink-muted hover:text-red-600"
              aria-label="Delete album"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
