import { type z } from 'zod'
import type { UserRole } from '@/lib/types'
import { AppError, createError } from '@/lib/errors'

export type AuthSession = {
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    isActive: boolean
  }
}

export function withValidation<TSchema extends z.ZodTypeAny, TResult>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>) => Promise<TResult> | TResult,
) {
  return async (raw: unknown) => {
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      throw createError(
        'VALIDATION_ERROR',
        parsed.error.errors.map((e) => e.message).join(', '),
      )
    }
    return handler(parsed.data)
  }
}

export function withAuth<TSession extends AuthSession, TResult>(
  roles: UserRole[] | undefined,
  handler: (session: TSession) => Promise<TResult> | TResult,
) {
  return async (session: TSession | null) => {
    if (!session?.user) {
      throw createError('UNAUTHORIZED', 'Authentication required')
    }
    if (!session.user.isActive) {
      throw createError('FORBIDDEN', 'Account is disabled')
    }
    if (roles && !roles.includes(session.user.role)) {
      throw createError('FORBIDDEN', 'Insufficient permissions')
    }
    return handler(session)
  }
}

export type AuditParams = {
  module: string
  action: string
  recordId?: string
  recordTitle?: string
}

/** Fire-and-forget audit hook — full implementation in Module 6. */
export async function logAction(_params: AuditParams & { userId: string }) {
  // no-op until audit server module is wired
}

export function withAudit<TParams extends AuditParams, TResult>(
  params: TParams,
  handler: () => Promise<TResult> | TResult,
  getUserId: () => string | undefined,
) {
  return async () => {
    const result = await handler()
    const userId = getUserId()
    if (userId) {
      logAction({ ...params, userId }).catch(() => undefined)
    }
    return result
  }
}

export function wrapHandler<TResult>(
  fn: () => Promise<TResult> | TResult,
): Promise<TResult> {
  return Promise.resolve().then(fn).catch((err) => {
    if (err instanceof AppError) throw err
    throw createError(
      'INTERNAL',
      err instanceof Error ? err.message : 'Unexpected error',
    )
  })
}
