import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import { getBookings } from "@/lib/bookings-fns";
import { getGuides } from "@/lib/guides-fns";
import {
  statusBadge,
  formatBookingDate,
  formatSubmittedAt,
} from "@/lib/booking-ui";
import type { BookingStatus } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/bookings/")({
  component: BookingsAdmin,
});

const tabs: (BookingStatus | "All")[] = [
  "All",
  "Pending",
  "Confirmed",
  "Declined",
  "Cancelled",
];

const adminSearch = { denied: false as const };

function BookingsAdmin() {
  const [tab, setTab] = useState<BookingStatus | "All">("All");
  const [guideId, setGuideId] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = useMemo(
    () => ({
      status: tab === "All" ? undefined : tab,
      guide_id: guideId === "All" ? undefined : guideId,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [tab, guideId, dateFrom, dateTo],
  );

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "bookings", filters],
    queryFn: () => getBookings({ data: filters }),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["admin", "bookings", "counts"],
    queryFn: () => getBookings({ data: {} }),
    refetchInterval: 60_000,
  });

  const { data: guideList = [] } = useQuery({
    queryKey: ["admin", "guides", "bookings-filter"],
    queryFn: () => getGuides({ data: {} }),
  });

  const counts = useMemo(
    () => ({
      All: allItems.length,
      Pending: allItems.filter((b) => b.status === "Pending").length,
      Confirmed: allItems.filter((b) => b.status === "Confirmed").length,
      Declined: allItems.filter((b) => b.status === "Declined").length,
      Cancelled: allItems.filter((b) => b.status === "Cancelled").length,
    }),
    [allItems],
  );

  return (
    <AdminLayout title="Bookings" breadcrumb="Manage tour bookings">
      <AdminCard className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === t ? "bg-brand text-white" : "hover:bg-surface"}`}
            >
              {t}{" "}
              <span
                className={`ml-1 text-xs ${tab === t ? "text-white/80" : "text-ink-muted"}`}
              >
                {tab === t ? items.length : counts[t]}
              </span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2 items-center flex-wrap">
          <select
            value={guideId}
            onChange={(e) => setGuideId(e.target.value)}
            className="rounded border border-border px-3 py-1.5 text-sm"
          >
            <option value="All">All guides</option>
            {guideList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded border border-border px-3 py-1.5 text-sm"
            aria-label="Tour date from"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded border border-border px-3 py-1.5 text-sm"
            aria-label="Tour date to"
          />
        </div>
      </AdminCard>

      <AdminCard>
        {isLoading ? (
          <p className="p-8 text-sm text-ink-muted">Loading bookings…</p>
        ) : isError ? (
          <p className="p-8 text-sm text-red-600">Could not load bookings.</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-sm text-ink-muted">
            {tab === "All"
              ? "No bookings yet. New requests will appear here."
              : `No ${tab.toLowerCase()} bookings match your filters.`}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
                <tr className="border-b border-border">
                  {[
                    "Ref",
                    "Guide",
                    "Visitor",
                    "Country",
                    "Date",
                    "Duration",
                    "Group",
                    "Status",
                    "Submitted",
                    "",
                  ].map((h) => (
                    <th key={h} className="p-3 text-left whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border last:border-0 hover:bg-surface"
                  >
                    <td className="p-3 font-mono text-xs font-semibold">
                      <Link
                        to="/admin/bookings/$ref"
                        params={{ ref: b.booking_ref }}
                        search={adminSearch}
                        className="text-brand hover:text-gold hover:underline"
                      >
                        {b.booking_ref}
                      </Link>
                    </td>
                    <td className="p-3">{b.guide_name}</td>
                    <td className="p-3 font-medium">{b.visitor_name}</td>
                    <td className="p-3">{b.visitor_country}</td>
                    <td className="p-3">{formatBookingDate(b.tour_date)}</td>
                    <td className="p-3 text-ink-muted">{b.tour_duration}</td>
                    <td className="p-3 text-ink-muted">{b.group_size}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] border font-medium ${statusBadge[b.status]}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-ink-muted text-xs">
                      {formatSubmittedAt(b.created_at)}
                    </td>
                    <td className="p-3">
                      <Link
                        to="/admin/bookings/$ref"
                        params={{ ref: b.booking_ref }}
                        search={adminSearch}
                        className="inline-flex items-center gap-1 text-brand hover:text-gold"
                        aria-label={`View booking ${b.booking_ref}`}
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminLayout>
  );
}
