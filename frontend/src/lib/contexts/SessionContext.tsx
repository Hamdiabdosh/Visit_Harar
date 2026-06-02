import { createContext, useContext, useMemo } from 'react'
import { authClient } from '@/lib/auth-client'
import type { SessionUser, UserRole } from '@/lib/types'

type SessionContextValue = {
  user: SessionUser | null
  role: UserRole | null
  isLoading: boolean
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession()

  const value = useMemo<SessionContextValue>(() => {
    const u = data?.user as
      | (typeof data.user & { role?: string; isActive?: boolean })
      | undefined

    const user: SessionUser | null = u
      ? {
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role === 'superadmin' ? 'superadmin' : 'editor') as UserRole,
          isActive: u.isActive ?? true,
        }
      : null

    return {
      user,
      role: user?.role ?? null,
      isLoading: isPending,
      logout: async () => {
        await authClient.signOut()
        window.location.href = '/admin/login'
      },
    }
  }, [data, isPending])

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSessionContext() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSessionContext must be used within SessionProvider')
  }
  return ctx
}
