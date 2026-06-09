export type ErrorCode =
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "TERMINAL_STATUS"
  | "UPLOAD_FAILED"
  | "EMAIL_FAILED"
  | "INTERNAL";

const statusByCode: Record<ErrorCode, number> = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 422,
  CONFLICT: 409,
  TERMINAL_STATUS: 409,
  UPLOAD_FAILED: 500,
  EMAIL_FAILED: 500,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string, status?: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status ?? statusByCode[code];
  }

  toJSON() {
    return { code: this.code, message: this.message, status: this.status };
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function createError(code: ErrorCode, message: string, status?: number) {
  return new AppError(code, message, status);
}

/** Extract a user-facing message from server fn / mutation errors. */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (isAppError(err)) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = (err as { message: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return fallback;
}
