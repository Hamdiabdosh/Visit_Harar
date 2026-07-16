import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminLayout, AdminCard, Button } from "@/components/AdminLayout";
import { AdminCreateSheet } from "@/components/admin/AdminCreateSheet";
import {
  getAdminFeed,
  type AdminFeedItem,
  type AdminFeedKind,
} from "@/lib/admin-feed-fns";
import { getAdminDashboardStats } from "@/lib/dashboard-fns";
import { togglePublished } from "@/lib/announcements-fns";
import { toggleAttractionPublished } from "@/lib/attractions-fns";
import { toggleGuidePublished } from "@/lib/guides-fns";
import { updateAlbum } from "@/lib/gallery-fns";
import { optimizeImage } from "@/lib/media-url";
import {
  AlertCircle,
  Camera,
  Landmark,
  Megaphone,
  CalendarDays,
  Plus,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminFeedPage,
});

const kindMeta: Record<
  AdminFeedKind,
  { label: string; icon: typeof Megaphone }
> = {
  news: { label: "News", icon: Megaphone },
  event: { label: "Event", icon: CalendarDays },
  attraction: { label: "Attraction", icon: Landmark },
  photo: { label: "Photo", icon: Camera },
  guide: { label: "Guide", icon: Users },
};

function editHref(item: AdminFeedItem): {
  to: string;
  params?: Record<string, string>;
} {
  switch (item.kind) {
    case "news":
    case "event":
      return { to: "/admin/announcements/$id", params: { id: item.id } };
    case "attraction":
      return { to: "/admin/attractions/$id", params: { id: item.id } };
    case "guide":
      return { to: "/admin/guides/$id", params: { id: item.id } };
    case "photo":
      return { to: "/admin/gallery/$albumId", params: { albumId: item.id } };
  }
}

function AdminFeedPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: feed = [], isLoading } = useQuery({
    queryKey: ["admin", "feed"],
    queryFn: () => getAdminFeed(),
    refetchInterval: 60_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: () => getAdminDashboardStats(),
    refetchInterval: 60_000,
  });

  const toggle = useMutation({
    mutationFn: async (item: AdminFeedItem) => {
      if (item.kind === "news" || item.kind === "event") {
        return togglePublished({ data: item.id });
      }
      if (item.kind === "attraction") {
        return toggleAttractionPublished({ data: item.id });
      }
      if (item.kind === "guide") {
        return toggleGuidePublished({ data: item.id });
      }
      const next = !item.is_published;
      await updateAlbum({
        data: { id: item.id, data: { is_published: next } },
      });
      return { is_published: next };
    },
    onSuccess: (res, item) => {
      toast.success(res.is_published ? "Published" : "Unpublished");
      void queryClient.invalidateQueries({ queryKey: ["admin", "feed"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard-stats"],
      });
      // optimistic-ish: keep item id in toast context
      void item;
    },
    onError: (e: Error) => toast.error(e.message || "Could not update"),
  });

  const draftTotal = stats
    ? stats.unpublished_attractions +
      stats.unpublished_guides +
      stats.unpublished_announcements +
      stats.unpublished_pages +
      (stats.hero_unpublished ? 1 : 0) +
      (stats.contact_unpublished ? 1 : 0)
    : 0;

  const needsAttention =
    (stats?.pending_bookings ?? 0) +
    (stats?.unread_inquiries ?? 0) +
    draftTotal;

  return (
    <AdminLayout
      title="Feed"
      breadcrumb="Home · Recent content"
      action={
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create
        </Button>
      }
    >
      {needsAttention > 0 && stats ? (
        <AdminCard className="p-4 mb-6 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-amber-900">
              <span className="font-semibold">Needs attention · </span>
              {stats.unread_inquiries > 0 ? (
                <Link
                  to="/admin/inquiries"
                  className="font-medium underline underline-offset-2"
                >
                  {stats.unread_inquiries} message
                  {stats.unread_inquiries === 1 ? "" : "s"}
                </Link>
              ) : null}
              {stats.unread_inquiries > 0 &&
              (stats.pending_bookings > 0 || draftTotal > 0)
                ? " · "
                : null}
              {stats.pending_bookings > 0 ? (
                <Link
                  to="/admin/bookings"
                  className="font-medium underline underline-offset-2"
                >
                  {stats.pending_bookings} booking
                  {stats.pending_bookings === 1 ? "" : "s"}
                </Link>
              ) : null}
              {stats.pending_bookings > 0 && draftTotal > 0 ? " · " : null}
              {draftTotal > 0 ? (
                <span>{draftTotal} draft{draftTotal === 1 ? "" : "s"}</span>
              ) : null}
            </div>
          </div>
        </AdminCard>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-ink-muted py-12 text-center">Loading feed…</p>
      ) : feed.length === 0 ? (
        <AdminCard className="p-10 text-center">
          <p className="text-ink-muted mb-4">
            Nothing here yet. Create news, an event, attraction, photo, or guide.
          </p>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create
          </Button>
        </AdminCard>
      ) : (
        <ul className="space-y-3">
          {feed.map((item) => (
            <FeedCard
              key={`${item.kind}-${item.id}`}
              item={item}
              busy={toggle.isPending && toggle.variables?.id === item.id}
              onToggle={() => toggle.mutate(item)}
            />
          ))}
        </ul>
      )}

      <AdminCreateSheet open={createOpen} onOpenChange={setCreateOpen} />
    </AdminLayout>
  );
}

function FeedCard({
  item,
  busy,
  onToggle,
}: {
  item: AdminFeedItem;
  busy: boolean;
  onToggle: () => void;
}) {
  const meta = kindMeta[item.kind];
  const Icon = meta.icon;
  const href = editHref(item);
  const thumb = item.image
    ? optimizeImage(item.image, { width: 160 })
    : null;
  const when = new Date(item.updated_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li>
      <AdminCard className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="h-14 w-14 rounded-md object-cover shrink-0 border border-border"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-md bg-brand/10 text-brand shrink-0">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted">
                {meta.label}
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                  item.is_published
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-900 border-amber-200"
                }`}
              >
                {item.is_published ? "Published" : "Draft"}
              </span>
            </div>
            <div className="font-semibold text-ink truncate">{item.title}</div>
            <div className="text-xs text-ink-muted">
              {item.subtitle ? `${item.subtitle} · ` : null}
              Updated {when}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={href.to as never}
            params={(href.params ?? {}) as never}
            className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface"
          >
            Edit
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={onToggle}
            className="inline-flex items-center rounded-md bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand/15 disabled:opacity-50"
          >
            {busy
              ? "…"
              : item.is_published
                ? "Unpublish"
                : "Publish"}
          </button>
        </div>
      </AdminCard>
    </li>
  );
}
