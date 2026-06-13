import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createError } from "@/lib/errors";

export type GeocodeResult = {
  lat: number;
  lng: number;
  display_name: string;
};

const geocodeInputSchema = z.object({
  query: z.string().trim().min(3).max(200),
});

export const geocodeAddress = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => geocodeInputSchema.parse(raw))
  .handler(async ({ data }): Promise<GeocodeResult[]> => {
    const q = encodeURIComponent(`${data.query}, Harar, Ethiopia`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=et`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "VisitHarar/1.0 (tourism website; contact@visitharar.gov.et)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw createError(
        "INTERNAL",
        "Geocoding service unavailable. Try picking on the map instead.",
      );
    }

    const rows = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    return rows.map((r) => ({
      lat: Number(r.lat),
      lng: Number(r.lon),
      display_name: r.display_name,
    }));
  });
