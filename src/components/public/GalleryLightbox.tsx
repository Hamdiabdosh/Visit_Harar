import { useCallback } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Download } from "lucide-react";
import type { GalleryItemDto } from "@/lib/gallery-fns";
import {
  buildGallerySlides,
  triggerGalleryDownload,
} from "@/lib/gallery-lightbox";

type Props = {
  items: GalleryItemDto[];
  index: number;
  onClose: () => void;
};

export function GalleryLightbox({ items, index, onClose }: Props) {
  const slides = buildGallerySlides(items);
  const activeItem = index >= 0 ? items[index] : null;

  const onDownloadActive = useCallback(() => {
    if (activeItem) triggerGalleryDownload(activeItem, index);
  }, [activeItem, index]);

  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Captions, Video]}
      toolbar={{
        buttons: [
          <button
            key="download"
            type="button"
            className="yarl__button"
            aria-label="Download image"
            title="Download image"
            onClick={onDownloadActive}
          >
            <Download className="w-5 h-5" />
          </button>,
          "close",
        ],
      }}
    />
  );
}
