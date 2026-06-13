import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/AdminLayout";
import {
  getMediaAssets,
  uploadMediaAsset,
  type MediaAssetDto,
} from "@/lib/media-fns";
import { prepareMediaForUpload } from "@/lib/prepare-image-upload";
import { pickListImageUrl } from "@/lib/media-url";
import { Upload } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: { url: string; id: string }) => void;
  title?: string;
};

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  title = "Choose media",
}: Props) {
  const [tab, setTab] = useState<"existing" | "upload">("existing");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["media", "picker", search],
    queryFn: () =>
      getMediaAssets({
        data: {
          page: 1,
          perPage: 48,
          search: search || undefined,
          sort: "newest",
        },
      }),
    enabled: open,
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
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      onSelect({ url: asset.url, id: asset.id });
      onOpenChange(false);
      toast.success("Uploaded and selected");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const items = data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setTab("existing")}
            className={`px-3 py-1.5 text-sm rounded ${tab === "existing" ? "bg-brand text-white" : "hover:bg-surface"}`}
          >
            Choose existing
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`px-3 py-1.5 text-sm rounded ${tab === "upload" ? "bg-brand text-white" : "hover:bg-surface"}`}
          >
            Upload new
          </button>
        </div>

        {tab === "existing" ? (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="w-full rounded border border-border px-3 py-2 text-sm"
            />
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <p className="text-sm text-ink-muted py-8 text-center">
                  Loading…
                </p>
              ) : items.length === 0 ? (
                <p className="text-sm text-ink-muted py-8 text-center">
                  No media yet. Upload a file first.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-2">
                  {items.map((m) => (
                    <MediaThumb
                      key={m.id}
                      asset={m}
                      onClick={() => {
                        onSelect({ url: m.url, id: m.id });
                        onOpenChange(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
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
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
            >
              <Upload className="w-4 h-4" />
              {upload.isPending ? "Uploading…" : "Select file to upload"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MediaThumb({
  asset,
  onClick,
}: {
  asset: MediaAssetDto;
  onClick: () => void;
}) {
  const thumb =
    asset.type === "image"
      ? (pickListImageUrl(asset.url, asset.thumbnail_url) ?? asset.url)
      : (asset.thumbnail_url ?? asset.url);

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-border overflow-hidden hover:ring-2 hover:ring-brand text-left"
    >
      <div className="aspect-square bg-surface">
        {asset.type === "image" ? (
          <img
            src={thumb ?? asset.url}
            alt={asset.alt_text ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-xs text-ink-muted">
            Video
          </div>
        )}
      </div>
      <div className="p-1.5 text-[10px] truncate">
        {asset.filename ?? "asset"}
      </div>
    </button>
  );
}
