import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type Props = {
  path: string;
  title: string;
};

export function AttractionQr({ path, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = `${window.location.origin}${path}`;
    void QRCode.toCanvas(canvas, url, {
      width: 128,
      margin: 1,
      color: { dark: "#1a99b1", light: "#ffffff" },
    });
  }, [path]);

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`QR code linking to ${title}`}
        className="rounded"
      />
      <p className="text-[11px] text-center text-ink-muted max-w-[140px]">
        Scan to open this attraction on your phone
      </p>
    </div>
  );
}
