import type { EventRegistrationStatus } from "@/lib/types";

export const eventRegistrationStatusBadge: Record<
  EventRegistrationStatus,
  string
> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Declined: "bg-red-100 text-red-800 border-red-200",
  Cancelled: "bg-zinc-100 text-zinc-700 border-zinc-200",
  CheckedIn: "bg-blue-100 text-blue-800 border-blue-200",
};

export function formatEventDate(date: string | null) {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
