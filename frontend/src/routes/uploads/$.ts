import { createFileRoute } from "@tanstack/react-router";
import { serveStorageFile } from "@/lib/storage.server";

export const Route = createFileRoute("/uploads/$")({
  server: {
    handlers: {
      GET: ({ params, request }) => {
        const storageKey = params._splat ?? "";
        const download = new URL(request.url).searchParams.get("download") === "1";
        return serveStorageFile(storageKey, { download });
      },
    },
  },
});
