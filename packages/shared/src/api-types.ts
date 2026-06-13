/** Public REST API envelope types — shared by web, PWA, and future mobile app. */

export const API_VERSION = "v1" as const;

export type ApiMeta = {
  version: typeof API_VERSION;
  generated_at: string;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: ApiMeta;
};

export type ApiErrorBody = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
};

export const PUBLIC_PAGE_KEYS = ["about", "culture", "plan"] as const;
export type PublicPageKey = (typeof PUBLIC_PAGE_KEYS)[number];

export function isPublicPageKey(key: string): key is PublicPageKey {
  return (PUBLIC_PAGE_KEYS as readonly string[]).includes(key);
}
