import { Link } from "@tanstack/react-router";
import { optimizeImage } from "@/lib/cloudinary-url";
import type { MediaType } from "@/lib/types";

export type GalleryThumbData = {
  url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  alt?: string | null;
  type: MediaType;
  albumId?: string;
  onClick?: () => void;
};

function ThumbMedia({
  url,
  thumbnail_url,
  caption,
  alt,
  type,
}: GalleryThumbData) {
  const src =
    optimizeImage(thumbnail_url ?? url, { width: 800 }) ?? thumbnail_url ?? url;
  const imgAlt =
    alt?.trim() ||
    caption?.trim() ||
    (type === "video" ? "Video" : "Gallery photo");

  return (
    <div className="group relative overflow-hidden rounded-lg bg-surface border border-border">
      {type === "video" ? (
        <div className="absolute inset-0">
          <img
            src={src}
            alt={imgAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-black/60 text-white uppercase tracking-wider">
            Video
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={imgAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="aspect-[4/3]" />
      {caption?.trim() ? (
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90">
          <div className="text-white text-xs line-clamp-2">{caption}</div>
        </div>
      ) : null}
      <div className="absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-gold transition-all" />
    </div>
  );
}

export function GalleryThumb(props: GalleryThumbData) {
  const { albumId, onClick } = props;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg"
      >
        <ThumbMedia {...props} />
      </button>
    );
  }

  if (albumId) {
    return (
      <Link
        to="/gallery/$id"
        params={{ id: albumId }}
        className="block hover:opacity-95 transition-opacity"
      >
        <ThumbMedia {...props} />
      </Link>
    );
  }

  return <ThumbMedia {...props} />;
}
