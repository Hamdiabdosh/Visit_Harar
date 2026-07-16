import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Image as ImageIcon,
  Landmark,
  GalleryHorizontal,
  FileText,
  Megaphone,
  Users as UsersIcon,
  Phone,
  Calendar,
  Ticket,
  FolderOpen,
  Shield,
  ClipboardList,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Mail,
  Handshake,
  Route,
  BarChart3,
  House,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdminCreateSheet } from "@/components/admin/AdminCreateSheet";
import { getPendingBookingsCount } from "@/lib/bookings-fns";
import { getPendingEventRegistrationsCount } from "@/lib/event-registrations-fns";
import { getUnreadInquiriesCount } from "@/lib/inquiry-fns";
import { useSessionContext } from "@/lib/contexts/SessionContext";
import { useSidebarOpen } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof House;
  exact?: boolean;
  badgeKey?: "bookings" | "inquiries" | "event_registrations";
};

/** Primary chrome — Feed · Create · Media · Messages (L-006). */
const primaryItems: NavItem[] = [
  { to: "/admin", label: "Feed", icon: House, exact: true },
  { to: "/admin/media", label: "Media", icon: FolderOpen },
  {
    to: "/admin/inquiries",
    label: "Messages",
    icon: Mail,
    badgeKey: "inquiries",
  },
];

const moreItems: NavItem[] = [
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/hero", label: "Hero", icon: ImageIcon },
  { to: "/admin/attractions", label: "Attractions", icon: Landmark },
  { to: "/admin/gallery", label: "Gallery", icon: GalleryHorizontal },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/guides", label: "Guides", icon: UsersIcon },
  { to: "/admin/partners", label: "Partners", icon: Handshake },
  { to: "/admin/itineraries", label: "Itineraries", icon: Route },
  { to: "/admin/contact", label: "Contact", icon: Phone },
  {
    to: "/admin/bookings",
    label: "Bookings",
    icon: Calendar,
    badgeKey: "bookings",
  },
  {
    to: "/admin/event-registrations",
    label: "Event registrations",
    icon: Ticket,
    badgeKey: "event_registrations",
  },
  { to: "/admin/users", label: "Users", icon: Shield },
  { to: "/admin/audit", label: "Audit Log", icon: ClipboardList },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const SUPERADMIN_ONLY = new Set([
  "/admin/users",
  "/admin/audit",
  "/admin/settings",
]);

function SidebarContent({
  collapsed,
  onNavigate,
  showCollapseToggle,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
  onToggleCollapse?: () => void;
}) {
  const location = useLocation();
  const path = location.pathname;
  const { user, role, logout } = useSessionContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(() =>
    moreItems.some((item) =>
      item.exact
        ? path === item.to
        : path === item.to || path.startsWith(item.to + "/"),
    ),
  );

  const { data: pendingBookings = 0 } = useQuery({
    queryKey: ["admin", "bookings", "pending-count"],
    queryFn: () => getPendingBookingsCount(),
    refetchInterval: 60_000,
    enabled: !!user,
  });

  const { data: unreadInquiries = 0 } = useQuery({
    queryKey: ["admin", "inquiries", "unread-count"],
    queryFn: () => getUnreadInquiriesCount(),
    refetchInterval: 60_000,
    enabled: !!user,
  });

  const { data: pendingEventRegistrations = 0 } = useQuery({
    queryKey: ["admin", "event-registrations", "pending-count"],
    queryFn: () => getPendingEventRegistrationsCount(),
    refetchInterval: 60_000,
    enabled: !!user,
  });

  const visibleMore = moreItems.filter(
    (item) => role === "superadmin" || !SUPERADMIN_ONLY.has(item.to),
  );

  const moreActive = visibleMore.some((item) =>
    item.exact
      ? path === item.to
      : path === item.to || path.startsWith(item.to + "/"),
  );

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  function badgeFor(key: NavItem["badgeKey"]) {
    if (key === "bookings" && pendingBookings > 0) return pendingBookings;
    if (key === "event_registrations" && pendingEventRegistrations > 0) {
      return pendingEventRegistrations;
    }
    if (key === "inquiries" && unreadInquiries > 0) return unreadInquiries;
    return 0;
  }

  function renderLink(item: NavItem) {
    const isActive = item.exact
      ? path === item.to
      : path === item.to || path.startsWith(item.to + "/");
    const Icon = item.icon;
    const badge = badgeFor(item.badgeKey);
    return (
      <Link
        to={item.to as never}
        search={{ denied: false } as never}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors",
          collapsed && "justify-center px-2",
          isActive
            ? "bg-blue-600/90 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-900/6 hover:text-zinc-900",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {badge > 0 ? (
              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                {badge}
              </span>
            ) : null}
          </>
        )}
      </Link>
    );
  }

  return (
    <div className="flex h-full flex-col bg-transparent text-zinc-800">
      <div
        className={cn(
          "flex items-center border-b border-zinc-900/8 px-4 py-4",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <SiteLogo size="sm" />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate font-serif text-[15px] font-bold text-zinc-900">
              Visit Harar CMS
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Content Management System
            </div>
          </div>
        )}
      </div>

      {showCollapseToggle && (
        <div className="hidden justify-end border-b border-zinc-900/8 px-3 py-2 md:flex">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/6 text-zinc-500 transition-colors hover:bg-zinc-900/10 hover:text-zinc-800"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <div className="mb-2 px-2 text-[10px] uppercase tracking-widest text-zinc-500">
            Main
          </div>
        )}
        <ul className="space-y-0.5">
          <li key="feed">
            {renderLink(primaryItems[0]!)}
          </li>
          <li>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              title={collapsed ? "Create" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors",
                collapsed && "justify-center px-2",
                "bg-gold/20 text-ink font-semibold hover:bg-gold/30",
              )}
            >
              <Plus className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate text-left">Create</span>
              )}
            </button>
          </li>
          {primaryItems.slice(1).map((item) => (
            <li key={item.to}>{renderLink(item)}</li>
          ))}
        </ul>

        <div className="pt-4">
          {!collapsed && (
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className={cn(
                "mb-2 flex w-full items-center gap-2 px-2 text-[10px] uppercase tracking-widest transition-colors",
                moreActive ? "text-zinc-800" : "text-zinc-500 hover:text-zinc-700",
              )}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">More</span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  moreOpen && "rotate-90",
                )}
              />
            </button>
          )}
          {collapsed ? (
            <ul className="space-y-0.5">
              {visibleMore.map((item) => (
                <li key={item.to}>{renderLink(item)}</li>
              ))}
            </ul>
          ) : moreOpen ? (
            <ul className="space-y-0.5">
              {visibleMore.map((item) => (
                <li key={item.to}>{renderLink(item)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </nav>

      <div
        className={cn(
          "flex items-center gap-3 border-t border-zinc-900/8 p-3",
          collapsed && "flex-col",
        )}
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-900/8 text-sm font-semibold text-zinc-700"
          title={collapsed ? (user?.name ?? "User") : undefined}
        >
          {initials}
        </span>
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-semibold text-zinc-800">
                {user?.name ?? "User"}
              </div>
              <span className="inline-flex items-center rounded bg-zinc-900/6 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                {role ?? "—"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="p-2 text-zinc-500 transition-colors hover:text-zinc-800"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => void logout()}
            className="p-2 text-zinc-500 transition-colors hover:text-zinc-800"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        className={cn(
          "border-t border-border/40 px-4 py-3",
          collapsed && "flex justify-center px-0",
        )}
      >
        {collapsed ? (
          <a
            href="https://raafat.site"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Built by RAAFAT-DIGITAL"
          >
            R
          </a>
        ) : (
          <a
            href="https://raafat.site"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>Built by</span>
            <span className="font-semibold text-foreground/80 transition-colors group-hover:text-foreground">
              RAAFAT-DIGITAL
            </span>
          </a>
        )}
      </div>

      <AdminCreateSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

export function DashboardSidebar() {
  const { open, collapsed, setOpen, setCollapsed } = useSidebarOpen();

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen shrink-0 flex-col border-r border-zinc-900/10 bg-white/45 backdrop-blur-xl transition-all duration-300 ease-in-out md:sticky md:top-0 md:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          showCollapseToggle
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex w-72 flex-col border-zinc-900/10 bg-white/55 p-0 backdrop-blur-xl [&>button]:text-zinc-500 [&>button]:hover:text-zinc-800"
        >
          <SidebarContent
            collapsed={false}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
