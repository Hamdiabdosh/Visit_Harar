import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AdminLayout, AdminCard, Button } from "@/components/AdminLayout";
import {
  bulkDeleteMediaAssets,
  deleteMediaAsset,
  getMediaAssets,
  updateAltText,
  uploadMediaAsset,
  type MediaAssetDto,
} from "@/lib/media-fns";
import { prepareMediaForUpload } from "@/lib/prepare-image-upload";
import { pickListImageUrl, toMediaSrc } from "@/lib/media-url";
import { Search, Upload, Copy, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/media")({
  component: MediaAdmin,
});

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaAdmin() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | "image" | "video">("");
  const [sort, setSort] = useState<
    "newest" | "oldest" | "largest" | "smallest"
  >("newest");
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["media", "admin", page, search, type, sort],
    queryFn: () =>
      getMediaAssets({
        data: {
          page,
          perPage: 48,
          search: search || undefined,
          type: type || undefined,
          sort,
        },
      }),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const prepared = await prepareMediaForUpload(file);
      return uploadMediaAsset({
        data: {
          data: prepared.data,
          filename: prepared.filename,
          mime: prepared.mime,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Uploaded");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMediaAsset({ data: id }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      if (res.was_in_use) toast.warning("Asset was in use elsewhere");
      else toast.success("Deleted");
    },
  });

  const bulkRemove = useMutation({
    mutationFn: () => bulkDeleteMediaAssets({ data: { ids: selected } }),
    onSuccess: (res) => {
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success(`Deleted ${res.deleted} items`);
    },
  });

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 48));

  return (
    <AdminLayout
      title="Media Library"
      breadcrumb="Media · Assets"
      action={
        <Button onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4" /> Upload Media
        </Button>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload.mutate(f);
          e.target.value = "";
        }}
      />

      <AdminCard className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search files…"
            className="w-full pl-9 pr-3 py-2 rounded border border-border text-sm"
          />
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as "" | "image" | "video");
            setPage(1);
          }}
          className="rounded border border-border px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded border border-border px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="largest">Largest</option>
          <option value="smallest">Smallest</option>
        </select>
      </AdminCard>

      {selected.length > 0 && (
        <div className="bg-ink text-white rounded-lg p-3 flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            {selected.length} items selected
          </span>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => bulkRemove.mutate()}
          >
            <Trash2 className="w-4 h-4" /> Delete Selected
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-ink-muted py-12">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-center text-ink-muted py-12">
          No media assets yet. Upload your first file.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((m) => (
            <MediaCard
              key={m.id}
              asset={m}
              selected={selected.includes(m.id)}
              onToggle={() => toggle(m.id)}
              onDelete={() => remove.mutate(m.id)}
              onAltSave={(alt) =>
                updateAltText({ data: { id: m.id, alt_text: alt } }).then(() =>
                  queryClient.invalidateQueries({ queryKey: ["media"] }),
                )
              }
            />
          ))}
        </div>
      )}

      <div className="flex justify-center items-center gap-2 mt-8 text-sm">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded hover:bg-surface disabled:opacity-40"
        >
          ←
        </button>
        <span className="text-ink-muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded hover:bg-surface disabled:opacity-40"
        >
          →
        </button>
      </div>
    </AdminLayout>
  );
}

function MediaCard({
  asset,
  selected,
  onToggle,
  onDelete,
  onAltSave,
}: {
  asset: MediaAssetDto;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAltSave: (alt: string) => void;
}) {
  const [editingAlt, setEditingAlt] = useState(false);
  const [alt, setAlt] = useState(asset.alt_text ?? "");
  const thumb =
    asset.type === "image"
      ? pickListImageUrl(asset.url, asset.thumbnail_url)
      : null;

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden group">
      <div className="relative aspect-square bg-surface">
        {asset.type === "image" && thumb ? (
          <img
            src={thumb}
            alt={asset.alt_text ?? ""}
            className="w-full h-full object-cover"
          />
        ) : asset.type === "image" ? (
          <div className="w-full h-full grid place-items-center text-ink-muted text-xs">
            —
          </div>
        ) : (
          <div className="w-full h-full grid place-items-center text-ink-muted text-xs">
            Video
          </div>
        )}
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="absolute top-2 left-2 w-4 h-4"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 grid place-items-center gap-1">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(
                toMediaSrc(asset.url) ?? asset.url,
              );
              toast.success("URL copied");
            }}
            className="px-2 py-1 rounded bg-white text-ink text-xs font-semibold inline-flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> Copy URL
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold inline-flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
      <div className="p-2">
        <div className="text-xs font-medium truncate">
          {asset.filename ?? "asset"}
        </div>
        <div className="flex gap-1 mt-1 flex-wrap">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface text-ink-muted">
            {formatSize(asset.size_bytes)}
          </span>
          {asset.used_in.map((u) => (
            <span
              key={u}
              className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700"
            >
              {u}
            </span>
          ))}
        </div>
        {editingAlt ? (
          <input
            className="w-full mt-1 text-[10px] border border-border rounded px-1 py-0.5"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onBlur={() => {
              setEditingAlt(false);
              if (alt.trim()) onAltSave(alt.trim());
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditingAlt(false);
                if (alt.trim()) onAltSave(alt.trim());
              }
            }}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingAlt(true)}
            className="text-[10px] text-ink-muted mt-1 hover:text-brand truncate block w-full text-left"
          >
            {asset.alt_text || "Add alt text…"}
          </button>
        )}
      </div>
    </div>
  );
}
