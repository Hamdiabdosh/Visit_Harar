import { createContext, useContext } from "react";
import type { PublicSurfaces } from "@/lib/settings";

const defaults: PublicSurfaces = {
  bookingEnabled: false,
  eventRsvpEnabled: false,
  pwaInstallEnabled: false,
  appPromoEnabled: false,
};

const PublicSurfacesContext = createContext<PublicSurfaces>(defaults);

export function PublicSurfacesProvider({
  surfaces,
  children,
}: {
  surfaces: PublicSurfaces;
  children: React.ReactNode;
}) {
  return (
    <PublicSurfacesContext.Provider value={surfaces}>
      {children}
    </PublicSurfacesContext.Provider>
  );
}

export function usePublicSurfaces() {
  return useContext(PublicSurfacesContext);
}
