import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth.server'
import type { SessionUser, UserRole } from '@/lib/types'

export const getSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ user: SessionUser } | null> => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) return null

    const role = (session.user as { role?: string }).role as UserRole
    const isActive = (session.user as { isActive?: boolean }).isActive ?? true

    if (!isActive) return null

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: role === 'superadmin' ? 'superadmin' : 'editor',
        isActive,
      },
    }
  },
)
