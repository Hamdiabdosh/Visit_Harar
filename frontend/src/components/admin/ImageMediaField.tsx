import { useState } from "react";
import { Button } from "@/components/AdminLayout";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { markUsedIn, unmarkUsedIn } from "@/lib/media-fns";
import { Image as ImageIcon } from "lucide-react";

type Props = {
  label?: string;
  module: string;
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  mediaAssetId: string | null;
  onMediaAssetIdChange: (id: string | null) => void;
};

export function ImageMediaField({
  label = "Image",
  module,
  value,
  onChange,
  mediaAssetId,
  onMediaAssetIdChange,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (asset: { url: string; id: string }) => {
    if (mediaAssetId) {
      void unmarkUsedIn({ data: { id: mediaAssetId, module } });
    }
    onMediaAssetIdChange(asset.id);
    onChange(asset.url);
    void markUsedIn({ data: { id: asset.id, module } });
  };

  const handleClear = () => {
    if (mediaAssetId) {
      void unmarkUsedIn({ data: { id: mediaAssetId, module } });
      onMediaAssetIdChange(null);
    }
    onChange(undefined);
  };

  return (
    <>
      {value ? (
        <img
          src={value}
          alt=""
          className="w-full h-[150px] object-cover rounded mb-3"
        />
      ) : (
        <div className="border-2 border-dashed border-border rounded h-[150px] grid place-items-center text-ink-muted mb-3">
          <ImageIcon className="w-8 h-8" />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setPickerOpen(true)}
      >
        {value ? "Change image" : "Upload or choose from Media Library"}
      </Button>
      <p className="text-[11px] text-ink-muted mt-2">
        Images are stored in Cloudinary via the media library.
      </p>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-red-600 hover:underline mt-2"
        >
          Remove image
        </button>
      )}
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelect}
        title={`Choose ${label.toLowerCase()}`}
      />
    </>
  );
}
