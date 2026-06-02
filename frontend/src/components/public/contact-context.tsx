import { createContext, useContext } from 'react'
import type { ContactDto } from '@/lib/contact-fns'

type PublicContactContextValue = {
  contact: ContactDto | null
}

const PublicContactContext = createContext<PublicContactContextValue>({ contact: null })

export function PublicContactProvider({
  contact,
  children,
}: {
  contact: ContactDto | null
  children: React.ReactNode
}) {
  return <PublicContactContext.Provider value={{ contact }}>{children}</PublicContactContext.Provider>
}

export function usePublicContact() {
  return useContext(PublicContactContext)
}

