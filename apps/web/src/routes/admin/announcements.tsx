import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminLayout, AdminCard, Toggle } from "@/components/AdminLayout";
import {
  deleteAnnouncement,
  getAnnouncements,
  bulkSetPublished,
  pinAnnouncement,
  togglePublished,
  unpinAnnouncement,
} from "@/lib/announcements-fns";
import { Pin, Pencil, Trash2, Plus } from "lucide-react";
import { toMediaSrc } from "@/lib/media-url";

export const Route = createFileRoute("/admin/announcements")({
  component: AnnouncementsAdmin,
});

const tabs = ["All", "News", "Event", "Notice"] as const;

function AnnouncementsAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "announcements", tab],
    queryFn: () =>
      getAnnouncements({
        data: {
          type: tab === "All" ? undefined : tab,
          publishedOnly: false,
          page: 1,
          perPage: 50,
        },
      }),
    retry: false,
  });

  const items = data?.items ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });

  const pub = useMutation({
    mutationFn: (id: string) => togglePublished({ data: id }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "news"] });
    },
    onError: () => toast.error("Failed to toggle published"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteAnnouncement({ data: id }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "news"] });
      toast.success("Deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const pin = useMutation({
    mutationFn: (id: string) => pinAnnouncement({ data: id }),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to pin"),
  });

  const unpin = useMutation({
    mutationFn: (id: string) => unpinAnnouncement({ data: id }),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to unpin"),
  });

  const bulk = useMutation({
    mutationFn: (publish: boolean) =>
      bulkSetPublished({
        data: { ids: [...selected], publish },
      }),
    onSuccess: (result, publish) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["public", "news"] });
      setSelected(new Set());
      toast.success(
        publish
          ? `Published ${result.updated} item(s)`
          : `Unpublished ${result.updated} item(s)`,
      );
    },
    onError: () => toast.error("Bulk update failed"),
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((a) => a.id)));
    }
  }

  function onDelete(id: string, title: string) {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      del.mutate(id);
    }
  }

  return (
    <AdminLayout
      title="Announcements"
      breadcrumb="Content · News & Events"
      action={
        <Link
          to="/admin/announcements/$id"
          params={{ id: "new" }}
          className="px-4 py-2 rounded-md bg-brand text-white text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-brand-dark"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </Link>
      }
    >
      <AdminCard className="p-3 mb-6 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              tab === t ? "bg-brand text-white" : "hover:bg-surface"
            }`}
          >
            {t}
            {t !== "All" ? "s" : ""}
          </button>
        ))}
      </AdminCard>

      {selected.size > 0 && (
        <AdminCard className="p-3 mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-muted mr-2">
            {selected.size} selected
          </span>
          <button
            type="button"
            onClick={() => bulk.mutate(true)}
            disabled={bulk.isPending}
            className="px-3 py-1.5 rounded-md bg-brand text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-50"
          >
            Publish selected
          </button>
          <button
            type="button"
            onClick={() => bulk.mutate(false)}
            disabled={bulk.isPending}
            className="px-3 py-1.5 rounded-md border border-border text-sm font-semibold hover:bg-surface disabled:opacity-50"
          >
            Unpublish selected
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 text-sm text-ink-muted hover:text-ink"
          >
            Clear
          </button>
        </AdminCard>
      )}

      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">
            Could not load announcements.
          </p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <AdminCard>
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
              <tr className="border-b border-border">
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selected.size === items.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="p-3 w-10"></th>
                <th className="p-3 w-16">Cover</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Event</th>
                <th className="p-3">Published</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                      aria-label={`Select ${a.title}`}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-white"
                      aria-label={a.is_pinned ? "Unpin" : "Pin"}
                      onClick={() =>
                        a.is_pinned ? unpin.mutate(a.id) : pin.mutate(a.id)
                      }
                      title={a.is_pinned ? "Unpin" : "Pin"}
                    >
                      <Pin
                        className={`w-4 h-4 ${a.is_pinned ? "text-gold" : "text-gray-300"}`}
                      />
                    </button>
                  </td>
                  <td className="p-3">
                    {a.cover_image ? (
                      <img
                        src={toMediaSrc(a.cover_image) ?? a.cover_image}
                        alt=""
                        className="w-12 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-8 rounded bg-surface border border-border" />
                    )}
                  </td>
                  <td className="p-3 font-medium">{a.title}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand/10 text-brand font-semibold">
                      {a.type}
                    </span>
                  </td>
                  <td className="p-3 text-ink-muted text-xs text-center">
                    {a.type === "Event" ? (a.event_date ?? "—") : "—"}
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-block">
                      <Toggle
                        checked={a.is_published}
                        onChange={() => pub.mutate(a.id)}
                      />
                    </div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Link
                      to="/admin/announcements/$id"
                      params={{ id: a.id }}
                      className="inline-flex p-2 rounded hover:bg-surface text-ink-muted hover:text-brand"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(a.id, a.title)}
                      className="inline-flex p-2 rounded hover:bg-red-50 text-ink-muted hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      )}
    </AdminLayout>
  );
}
