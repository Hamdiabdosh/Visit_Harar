import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
  Textarea,
  Toggle,
  SectionLabel,
} from "@/components/AdminLayout";
import { AdminAlbumEditorSkeleton } from "@/components/public/GallerySkeletons";
import {
  bulkPublish,
  deleteMediaItem,
  getAlbumById,
  reorderItems,
  setAlbumCover,
  updateAlbum,
  updateMediaItem,
  uploadMediaItem,
} from "@/lib/gallery-fns";
import { pickListImageUrl } from "@/lib/media-url";
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
  ArrowLeft,
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/admin/gallery/$albumId")({
  loader: async ({ params }) => {
    const data = await getAlbumById({ data: params.albumId });
    if (!data) throw notFound();
    return data;
  },
  pendingComponent: AlbumManagerPending,
  component: AlbumManager,
});

function applyAlbumData(
  data: NonNullable<Awaited<ReturnType<typeof getAlbumById>>>,
  setters: {
    setAlbumTitle: (v: string) => void;
    setAlbumDesc: (v: string) => void;
    setAlbumPublished: (v: boolean) => void;
    setCover: (v: string | null) => void;
    setItems: (v: Awaited<ReturnType<typeof getAlbumById>>["items"]) => void;
    setOrderedIds: (v: string[]) => void;
    setSelected: (v: Set<string>) => void;
  },
) {
  setters.setAlbumTitle(data.album.title);
  setters.setAlbumDesc(data.album.description ?? "");
  setters.setAlbumPublished(data.album.is_published);
  setters.setCover(data.album.cover_image ?? null);
  setters.setItems(data.items);
  setters.setOrderedIds(data.items.map((i) => i.id));
  setters.setSelected(new Set());
}

function AlbumManagerPending() {
  return (
    <AdminLayout title="Gallery" breadcrumb="Gallery">
      <AdminAlbumEditorSkeleton />
    </AdminLayout>
  );
}

type UploadProgress = {
  id: string;
  filename: string;
  progress: number;
  status: "reading" | "uploading" | "done" | "error";
};

const UPLOAD_DONE_REMOVE_MS = 1200;
const UPLOAD_ERROR_REMOVE_MS = 4000;

function AlbumManager() {
  const { albumId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [albumTitle, setAlbumTitle] = useState(loaderData.album.title);
  const [albumDesc, setAlbumDesc] = useState(
    loaderData.album.description ?? "",
  );
  const [albumPublished, setAlbumPublished] = useState(
    loaderData.album.is_published,
  );
  const [cover, setCover] = useState<string | null>(
    loaderData.album.cover_image ?? null,
  );

  const [items, setItems] = useState(loaderData.items);
  const [orderedIds, setOrderedIds] = useState(
    loaderData.items.map((i) => i.id),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [savingAlbum, setSavingAlbum] = useState(false);

  useEffect(() => {
    applyAlbumData(loaderData, {
      setAlbumTitle,
      setAlbumDesc,
      setAlbumPublished,
      setCover,
      setItems,
      setOrderedIds,
      setSelected,
    });
  }, [loaderData]);

  async function refresh() {
    setRefreshing(true);
    try {
      const data = await getAlbumById({ data: albumId });
      if (!data) {
        void navigate({ to: "/admin/gallery" });
        return;
      }
      applyAlbumData(data, {
        setAlbumTitle,
        setAlbumDesc,
        setAlbumPublished,
        setCover,
        setItems,
        setOrderedIds,
        setSelected,
      });
    } finally {
      setRefreshing(false);
    }
  }

  const itemsById = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );
  const orderedItems = useMemo(() => {
    const list = orderedIds.map((id) => itemsById.get(id)).filter(Boolean);
    if (list.length === items.length) return list;
    return items;
  }, [orderedIds, itemsById, items]);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(items.map((i) => i.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function saveAlbumMeta() {
    setSavingAlbum(true);
    try {
      await updateAlbum({
        data: {
          id: albumId,
          data: {
            title: albumTitle,
            description: albumDesc,
            is_published: albumPublished,
            cover_image: cover,
          },
        },
      });
      toast.success("Album updated");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingAlbum(false);
    }
  }

  async function onDeleteItem(id: string) {
    if (!window.confirm("Delete this media item?")) return;
    try {
      await deleteMediaItem({ data: id });
      toast.success("Item deleted");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function onBulkPublish(published: boolean) {
    if (selected.size === 0) return;
    try {
      await bulkPublish({ data: { ids: Array.from(selected), published } });
      toast.success(published ? "Published" : "Unpublished");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk update failed");
    }
  }

  async function onBulkDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected items?`)) return;
    try {
      for (const id of Array.from(selected)) {
        // sequential uploads to avoid overloading the server

        await deleteMediaItem({ data: id });
      }
      toast.success("Deleted selected items");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk delete failed");
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      const next = arrayMove(prev, oldIndex, newIndex);
      reorderItems({ data: { albumId, ids: next } })
        .then(() => toast.success("Order updated"))
        .catch(() => toast.error("Failed to reorder"))
        .finally(() => refresh());
      return next;
    });
  }

  function removeUploadLater(id: string, delayMs: number) {
    window.setTimeout(() => {
      setUploads((prev) => prev.filter((u) => u.id !== id));
    }, delayMs);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    for (const f of list) {
      const uploadId = crypto.randomUUID();
      setUploads((prev) => [
        ...prev,
        { id: uploadId, filename: f.name, progress: 0, status: "reading" },
      ]);
      try {
        const base64 = await fileToBase64WithProgress(f, (p) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? { ...u, progress: p, status: "reading" }
                : u,
            ),
          );
        });
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? { ...u, progress: 100, status: "uploading" }
              : u,
          ),
        );
        await uploadMediaItem({
          data: {
            albumId,
            filename: f.name,
            mime: f.type || "application/octet-stream",
            data: base64,
          },
        });
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? { ...u, progress: 100, status: "done" }
              : u,
          ),
        );
        removeUploadLater(uploadId, UPLOAD_DONE_REMOVE_MS);
      } catch {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, status: "error" } : u,
          ),
        );
        toast.error(`Failed to upload ${f.name}`);
        removeUploadLater(uploadId, UPLOAD_ERROR_REMOVE_MS);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
    await refresh();
  }

  if (refreshing) {
    return (
      <AdminLayout
        title={albumTitle || "Album"}
        breadcrumb={`Gallery › ${albumTitle || "Album"}`}
        action={
          <Link
            to="/admin/gallery"
            className="text-sm text-ink-muted inline-flex items-center gap-1 hover:text-brand"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      >
        <AdminAlbumEditorSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={albumTitle || "Album"}
      breadcrumb={`Gallery › ${albumTitle || "Album"}`}
      action={
        <Link
          to="/admin/gallery"
          className="text-sm text-ink-muted inline-flex items-center gap-1 hover:text-brand"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <AdminCard className="p-6">
          <SectionLabel>Upload</SectionLabel>
          <div
            className="border-2 border-dashed border-border rounded-lg p-10 text-center text-ink-muted hover:border-brand transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void handleFiles(e.dataTransfer.files);
            }}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-brand" />
            <div className="font-semibold text-ink">
              Drag files here or click to browse
            </div>
            <div className="text-xs mt-1">
              Images or videos. Alt text required before publishing.
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => void handleFiles(e.target.files)}
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fileRef.current?.click()}
            >
              Choose Files
            </Button>
          </div>

          {uploads.length > 0 && (
            <div className="mt-5 space-y-2" aria-live="polite">
              {uploads.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-medium truncate">{u.filename}</div>
                    <div className="h-2 bg-surface rounded mt-1 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          u.status === "error"
                            ? "bg-red-500"
                            : u.status === "done"
                              ? "bg-emerald-500"
                              : "bg-brand"
                        }`}
                        style={{
                          width: `${
                            u.status === "uploading" || u.status === "done"
                              ? 100
                              : u.progress
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className={`text-xs w-20 text-right shrink-0 ${
                      u.status === "error" ? "text-red-600" : "text-ink-muted"
                    }`}
                  >
                    {u.status === "reading"
                      ? "Reading…"
                      : u.status === "uploading"
                        ? "Uploading…"
                        : u.status === "done"
                          ? "Done"
                          : "Error"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard className="p-6 space-y-4">
          <SectionLabel>Album</SectionLabel>
          <Field label="Title">
            <Input
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={4}
              value={albumDesc}
              onChange={(e) => setAlbumDesc(e.target.value)}
            />
          </Field>
          <div className="flex items-center justify-between">
            <span className="text-sm">Published</span>
            <Toggle checked={albumPublished} onChange={setAlbumPublished} />
          </div>
          <Button onClick={() => void saveAlbumMeta()} disabled={savingAlbum}>
            {savingAlbum ? "Saving…" : "Save Album"}
          </Button>
        </AdminCard>
      </div>

      {selected.size > 0 && (
        <AdminCard className="p-4 mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-semibold">{selected.size}</span> selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void onBulkPublish(true)}>
              Publish
            </Button>
            <Button variant="outline" onClick={() => void onBulkPublish(false)}>
              Unpublish
            </Button>
            <Button variant="danger" onClick={() => void onBulkDelete()}>
              Delete
            </Button>
            <Button variant="ghost" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </AdminCard>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={selected.size === items.length ? clearSelection : selectAll}
          className="text-sm text-ink-muted inline-flex items-center gap-2 hover:text-ink"
        >
          {selected.size === items.length ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {selected.size === items.length ? "Clear selection" : "Select all"}
        </button>
      </div>

      {items.length === 0 ? (
        <AdminCard className="p-10 mt-4 text-center">
          <p className="text-sm text-ink-muted">No items in this album yet.</p>
        </AdminCard>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {orderedItems.map((it) => (
                <SortableMediaCard
                  key={it.id}
                  id={it.id}
                  item={it}
                  isSelected={selected.has(it.id)}
                  isCover={Boolean(cover && it.url === cover)}
                  onSelect={() => toggleSelected(it.id)}
                  onDelete={() => void onDeleteItem(it.id)}
                  onSetCover={() =>
                    void setAlbumCover({ data: { albumId, itemId: it.id } })
                      .then(refresh)
                      .catch(() => toast.error("Failed to set cover"))
                  }
                  onSave={async (data) => {
                    const updated = await updateMediaItem({
                      data: { id: it.id, data },
                    });
                    setItems((prev) =>
                      prev.map((row) => (row.id === it.id ? updated : row)),
                    );
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </AdminLayout>
  );
}

function SortableMediaCard({
  id,
  item,
  isSelected,
  isCover,
  onSelect,
  onDelete,
  onSetCover,
  onSave,
}: {
  id: string;
  item: {
    url: string;
    caption: string | null;
    alt_text: string | null;
    is_published: boolean;
    type: string;
  };
  isSelected: boolean;
  isCover: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onSetCover: () => void;
  onSave: (data: {
    caption?: string | null;
    alt_text?: string | null;
    is_published?: boolean;
  }) => Promise<void>;
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

  const [caption, setCaption] = useState(item.caption ?? "");
  const [altText, setAltText] = useState(item.alt_text ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCaption(item.caption ?? "");
    setAltText(item.alt_text ?? "");
  }, [item.caption, item.alt_text, id]);

  async function saveFields(fields: {
    caption?: string | null;
    alt_text?: string | null;
    is_published?: boolean;
  }) {
    setSaving(true);
    try {
      await onSave(fields);
    } catch (e) {
      setCaption(item.caption ?? "");
      setAltText(item.alt_text ?? "");
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-border overflow-hidden"
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="relative aspect-square bg-surface overflow-hidden">
          {item.type === "video" ? (
            <div className="absolute inset-0 grid place-items-center text-ink-muted">
              <ImageIcon className="w-10 h-10" />
              <span className="text-xs mt-2">Video</span>
            </div>
          ) : (
            <img
              src={pickListImageUrl(item.url, item.thumbnail_url) ?? item.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <span
            className={`absolute top-2 left-2 w-5 h-5 rounded border ${isSelected ? "bg-brand border-brand" : "bg-white/90 border-border"}`}
          />
          {isCover && (
            <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] bg-gold text-ink font-semibold inline-flex items-center gap-1">
              <Star className="w-3 h-3" /> Cover
            </span>
          )}
        </div>
      </button>
      <div className="p-3 space-y-2">
        <input
          className="w-full rounded border border-border px-2 py-1 text-xs"
          value={caption}
          placeholder="Caption"
          disabled={saving}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => {
            if (caption === (item.caption ?? "")) return;
            void saveFields({ caption: caption || null });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <input
          className="w-full rounded border border-border px-2 py-1 text-xs"
          value={altText}
          placeholder="Alt text (required to publish)"
          disabled={saving}
          onChange={(e) => setAltText(e.target.value)}
          onBlur={() => {
            if (altText === (item.alt_text ?? "")) return;
            void saveFields({ alt_text: altText || null });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <div className="flex items-center justify-between text-xs">
          <Toggle
            checked={item.is_published}
            disabled={saving}
            onChange={(v) => void saveFields({ is_published: v })}
          />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-surface text-ink-muted"
              title="Drag to reorder"
              aria-label="Drag to reorder"
              {...attributes}
              {...listeners}
            >
              <Upload className="w-3.5 h-3.5 rotate-90 opacity-60" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-surface text-ink-muted"
              onClick={onSetCover}
            >
              <Star className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-red-50 text-ink-muted hover:text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function fileToBase64WithProgress(
  file: File,
  onProgress: (p: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (!e.lengthComputable) return;
      onProgress(Math.round((e.loaded / e.total) * 100));
    };
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
