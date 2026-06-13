import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import { getEventRegistrations } from "@/lib/event-registrations-fns";
import { getAnnouncements } from "@/lib/announcements-fns";
import {
  eventRegistrationStatusBadge,
  formatEventDate,
} from "@/lib/event-registration-ui";
import { formatSubmittedAt } from "@/lib/booking-ui";
import type { EventRegistrationStatus } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/event-registrations/")({
  component: EventRegistrationsAdmin,
});

const tabs: (EventRegistrationStatus | "All")[] = [
  "All",
  "Pending",
  "Confirmed",
  "CheckedIn",
  "Declined",
  "Cancelled",
];

const adminSearch = { denied: false as const };

function EventRegistrationsAdmin() {
  const [tab, setTab] = useState<EventRegistrationStatus | "All">("All");
  const [eventId, setEventId] = useState("All");

  const filters = useMemo(
    () => ({
      status: tab === "All" ? undefined : tab,
      announcement_id: eventId === "All" ? undefined : eventId,
    }),
    [tab, eventId],
  );

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "event-registrations", filters],
    queryFn: () => getEventRegistrations({ data: filters }),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["admin", "event-registrations", "counts"],
    queryFn: () => getEventRegistrations({ data: {} }),
    refetchInterval: 60_000,
  });

  const { data: eventsData } = useQuery({
    queryKey: ["admin", "announcements", "events-filter"],
    queryFn: () =>
      getAnnouncements({
        data: { type: "Event", publishedOnly: false, page: 1, perPage: 50 },
      }),
  });

  const counts = useMemo(
    () => ({
      All: allItems.length,
      Pending: allItems.filter((r) => r.status === "Pending").length,
      Confirmed: allItems.filter((r) => r.status === "Confirmed").length,
      CheckedIn: allItems.filter((r) => r.status === "CheckedIn").length,
      Declined: allItems.filter((r) => r.status === "Declined").length,
      Cancelled: allItems.filter((r) => r.status === "Cancelled").length,
    }),
    [allItems],
  );

  return (
    <AdminLayout
      title="Event registrations"
      breadcrumb="Manage event attendees"
    >
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
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="ml-auto rounded border border-border px-3 py-1.5 text-sm"
        >
          <option value="All">All events</option>
          {(eventsData?.items ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </AdminCard>

      <AdminCard>
        {isLoading ? (
          <p className="p-8 text-sm text-ink-muted">Loading registrations…</p>
        ) : isError ? (
          <p className="p-8 text-sm text-red-600">Could not load registrations.</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-sm text-ink-muted">No registrations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
                <tr className="border-b border-border">
                  {[
                    "Ref",
                    "Event",
                    "Visitor",
                    "Country",
                    "Event date",
                    "Party",
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
                {items.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-0 hover:bg-surface"
                  >
                    <td className="p-3 font-mono text-xs font-semibold">
                      <Link
                        to="/admin/event-registrations/$ref"
                        params={{ ref: r.registration_ref }}
                        search={adminSearch}
                        className="text-brand hover:text-gold hover:underline"
                      >
                        {r.registration_ref}
                      </Link>
                    </td>
                    <td className="p-3">{r.event_title}</td>
                    <td className="p-3 font-medium">{r.visitor_name}</td>
                    <td className="p-3">{r.visitor_country}</td>
                    <td className="p-3">
                      {formatEventDate(r.event_date)}
                    </td>
                    <td className="p-3 text-ink-muted">{r.party_size}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] border font-medium ${eventRegistrationStatusBadge[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-ink-muted text-xs">
                      {formatSubmittedAt(r.created_at)}
                    </td>
                    <td className="p-3">
                      <Link
                        to="/admin/event-registrations/$ref"
                        params={{ ref: r.registration_ref }}
                        search={adminSearch}
                        className="inline-flex items-center gap-1 text-brand hover:text-gold"
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
