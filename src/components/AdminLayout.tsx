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
  FolderOpen,
  Shield,
  ClipboardList,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { getPendingBookingsCount } from "@/lib/bookings-fns";
import { useSessionContext } from "@/lib/contexts/SessionContext";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: number;
  badgeKey?: "bookings";
};
type NavSection = { label: string; muted?: boolean; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: "Content",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/hero", label: "Hero", icon: ImageIcon },
      { to: "/admin/attractions", label: "Attractions", icon: Landmark },
      { to: "/admin/gallery", label: "Gallery", icon: GalleryHorizontal },
      { to: "/admin/pages", label: "Pages", icon: FileText },
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/admin/guides", label: "Guides", icon: UsersIcon },
      { to: "/admin/contact", label: "Contact", icon: Phone },
    ],
  },
  {
    label: "Bookings",
    items: [
      {
        to: "/admin/bookings",
        label: "Bookings",
        icon: Calendar,
        badgeKey: "bookings" as const,
      },
    ],
  },
  {
    label: "Media",
    items: [{ to: "/admin/media", label: "Media Library", icon: FolderOpen }],
  },
  {
    label: "System",
    muted: true,
    items: [
      { to: "/admin/users", label: "Users", icon: Shield },
      { to: "/admin/audit", label: "Audit Log", icon: ClipboardList },
      { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export function AdminLayout({
  title,
  breadcrumb,
  action,
  children,
}: {
  title: string;
  breadcrumb?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
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

  const visibleSections = sections.filter(
    (section) => section.label !== "System" || role === "superadmin",
  );

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-ink flex">
      <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-border flex flex-col z-30">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-border">
          <SiteLogo size="sm" />
          <div className="leading-tight">
            <div className="font-serif font-bold text-[15px]">
              Visit Harar CMS
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted">
              Content Management
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <div
                className={`px-2 mb-2 text-[10px] uppercase tracking-wider font-semibold ${section.muted ? "text-ink-muted/60" : "text-ink-muted"}`}
              >
                {section.label}
              </div>
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
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors ${
                          isActive
                            ? "bg-brand text-white"
                            : "text-ink hover:bg-surface"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badgeKey === "bookings" && pendingBookings > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                            {pendingBookings}
                          </span>
                        ) : "badge" in item && item.badge ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3 flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-brand-dark text-white grid place-items-center font-semibold text-sm">
            {initials}
          </span>
          <div className="flex-1 leading-tight min-w-0">
            <div className="text-[13px] font-semibold truncate">
              {user?.name ?? "User"}
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-medium">
              {role ?? "—"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="p-2 text-ink-muted hover:text-ink"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <div className="ml-60 flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur border-b border-border px-8 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-[18px] text-ink">{title}</h1>
            {breadcrumb && (
              <div className="text-[12px] text-ink-muted mt-0.5">
                {breadcrumb}
              </div>
            )}
          </div>
          {action}
        </header>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

// Reusable admin primitives
export function AdminCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors ${checked ? "bg-brand" : "bg-gray-300"}`}
      aria-pressed={checked}
      aria-label={label}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
      />
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-ink mb-1.5 uppercase tracking-wide">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-[11px] text-ink-muted mt-1">{hint}</span>
      )}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`w-full rounded border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted mb-3">
      {children}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "gold" | "danger" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    ghost: "bg-transparent text-ink hover:bg-surface",
    gold: "bg-gold text-ink hover:bg-gold-dark hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-border text-ink hover:bg-surface",
  };
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
