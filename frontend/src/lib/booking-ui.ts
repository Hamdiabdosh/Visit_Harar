import type { BookingStatus } from "@/lib/types";

export const statusBadge: Record<BookingStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Declined: "bg-red-100 text-red-800 border-red-200",
  Cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

export function formatBookingDate(value: string | Date): string {
  const d =
    typeof value === "string"
      ? new Date(value + (value.length === 10 ? "T12:00:00" : ""))
      : value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSubmittedAt(value: Date): string {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
