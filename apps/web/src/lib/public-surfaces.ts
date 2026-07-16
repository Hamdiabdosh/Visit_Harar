import { createServerFn } from "@tanstack/react-start";
import { getPublicSurfaces, type PublicSurfaces } from "@/lib/settings";

export type { PublicSurfaces };

/** Public visitor feature flags (V2-001 / L-005). Fail closed. */
export const getPublicSurfacesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSurfaces> => {
    try {
      return await getPublicSurfaces();
    } catch {
      return {
        bookingEnabled: false,
        eventRsvpEnabled: false,
        pwaInstallEnabled: false,
        appPromoEnabled: false,
      };
    }
  },
);
