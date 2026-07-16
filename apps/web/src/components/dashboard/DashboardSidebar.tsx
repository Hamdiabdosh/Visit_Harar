import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
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
} from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getPendingBookingsCount } from "@/lib/bookings-fns";
import { getPendingEventRegistrationsCount } from "@/lib/event-registrations-fns";
import { getUnreadInquiriesCount } from "@/lib/inquiry-fns";
import { useSessionContext } from "@/lib/contexts/SessionContext";
import { useSidebarOpen } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: number;
  badgeKey?: "bookings" | "inquiries" | "event_registrations";
};
type NavSection = { label: string; muted?: boolean; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: "Content",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
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
    ],
  },
  {
    label: "Inbox",
    items: [
      {
        to: "/admin/inquiries",
        label: "Inquiries",
        icon: Mail,
        badgeKey: "inquiries" as const,
      },
    ],
  },
  {
    label: "Media",
    items: [{ to: "/admin/media", label: "Media Library", icon: FolderOpen }],
  },
  {
    label: "More",
    muted: true,
    items: [
      {
        to: "/admin/bookings",
        label: "Bookings",
        icon: Calendar,
        badgeKey: "bookings" as const,
      },
      {
        to: "/admin/event-registrations",
        label: "Event registrations",
        icon: Ticket,
        badgeKey: "event_registrations" as const,
      },
      { to: "/admin/users", label: "Users", icon: Shield },
      { to: "/admin/audit", label: "Audit Log", icon: ClipboardList },
      { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

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

  const visibleSections = sections
    .map((section) => {
      if (section.label !== "More") return section;
      // Editors: bookings + event regs under More; superadmin also Users/Audit/Settings
      if (role === "superadmin") return section;
      return {
        ...section,
        items: section.items.filter(
          (item) =>
            item.to === "/admin/bookings" ||
            item.to === "/admin/event-registrations",
        ),
      };
    })
    .filter((section) => section.items.length > 0);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

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

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {visibleSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div
                className={cn(
                  "mb-2 px-2 text-[10px] uppercase tracking-widest text-zinc-500",
                  section.muted && "text-zinc-600",
                )}
              >
                {section.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? path === item.to
                  : path === item.to || path.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <li key={item.to}>
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
                          {item.badgeKey === "bookings" &&
                          pendingBookings > 0 ? (
                            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                              {pendingBookings}
                            </span>
                          ) : item.badgeKey === "event_registrations" &&
                            pendingEventRegistrations > 0 ? (
                            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                              {pendingEventRegistrations}
                            </span>
                          ) : item.badgeKey === "inquiries" &&
                            unreadInquiries > 0 ? (
                            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                              {unreadInquiries}
                            </span>
                          ) : "badge" in item && item.badge ? (
                            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>
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
