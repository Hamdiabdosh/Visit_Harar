import { API_VERSION, type ApiErrorBody, type ApiMeta } from "@visit-harar/shared";
import { isAppError } from "@/lib/errors";
import { ZodError } from "zod";

export const CACHE_PUBLIC_SHORT =
  "public, max-age=60, stale-while-revalidate=300";

export const CACHE_PUBLIC_LONG =
  "public, max-age=300, stale-while-revalidate=600";

function apiMeta(): ApiMeta {
  return { version: API_VERSION, generated_at: new Date().toISOString() };
}

export function jsonOk<T>(
  data: T,
  init?: ResponseInit & { cache?: string },
): Response {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  if (init?.cache) headers.set("cache-control", init.cache);
  return new Response(JSON.stringify({ ok: true, data, meta: apiMeta() }), {
    ...init,
    headers,
  });
}

export function jsonError(
  code: string,
  message: string,
  statusCode = 400,
): Response {
  const body: ApiErrorBody = { ok: false, error: { code, message } };
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function jsonFromError(err: unknown): Response {
  if (isAppError(err)) {
    return jsonError(err.code, err.message, err.status);
  }
  if (err instanceof ZodError) {
    const msg = err.issues.map((i) => i.message).join("; ") || "Invalid input";
    return jsonError("VALIDATION_ERROR", msg, 422);
  }
  if (err instanceof SyntaxError) {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 422);
  }
  console.error("[api]", err);
  return jsonError("INTERNAL", "Internal server error", 500);
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const allowed =
    process.env.API_CORS_ORIGIN ??
    process.env.VITE_APP_URL ??
    process.env.APP_URL ??
    "*";
  let value = "*";
  if (allowed === "*") {
    value = "*";
  } else if (origin && allowed.split(",").includes(origin)) {
    value = origin;
  } else {
    value = allowed.split(",")[0]?.trim() ?? "*";
  }
  return {
    "access-control-allow-origin": value,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  };
}

export function withCors(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function optionsResponse(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function readJsonBody<T = unknown>(request: Request): Promise<T> {
  const text = await request.text();
  if (!text.trim()) return {} as T;
  return JSON.parse(text) as T;
}
