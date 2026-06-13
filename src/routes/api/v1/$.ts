import { createFileRoute } from "@tanstack/react-router";
import { handleV1Request } from "@/lib/api/v1/handle";
import { optionsResponse, withCors } from "@/lib/api/http";

async function dispatch(
  request: Request,
  splat: string,
  method: string,
): Promise<Response> {
  const response = await handleV1Request(request, splat, method);
  return withCors(response, request);
}

export const Route = createFileRoute("/api/v1/$")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        dispatch(request, params._splat ?? "", "GET"),
      POST: ({ request, params }) =>
        dispatch(request, params._splat ?? "", "POST"),
      OPTIONS: ({ request }) => optionsResponse(request),
    },
  },
});
