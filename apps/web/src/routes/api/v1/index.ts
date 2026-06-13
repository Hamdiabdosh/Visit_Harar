import { createFileRoute } from "@tanstack/react-router";
import { withCors } from "@/lib/api/http";
import { handleV1Request } from "@/lib/api/v1/handle";

export const Route = createFileRoute("/api/v1/")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        withCors(await handleV1Request(request, "", "GET"), request),
      OPTIONS: ({ request }) =>
        withCors(new Response(null, { status: 204 }), request),
    },
  },
});
