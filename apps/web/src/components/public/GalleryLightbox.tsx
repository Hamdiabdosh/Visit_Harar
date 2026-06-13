import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { GalleryItemDto } from "@/lib/gallery-fns";
import { buildGallerySlides } from "@/lib/gallery-lightbox";

type Props = {
  items: GalleryItemDto[];
  index: number;
  onClose: () => void;
};

export function GalleryLightbox({ items, index, onClose }: Props) {
  const slides = buildGallerySlides(items);

  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Captions, Video, Download]}
      toolbar={{
        buttons: ["download", "close"],
      }}
    />
  );
}
