import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebarOpen } from "@/store/sidebarStore";

export function DashboardTopbar({
  title,
  breadcrumb,
  action,
}: {
  title: string;
  breadcrumb?: string;
  action?: React.ReactNode;
}) {
  const { collapsed, setCollapsed, setOpen } = useSidebarOpen();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-md p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-semibold text-ink">
            {title}
          </h1>
          {breadcrumb && (
            <div className="mt-0.5 truncate text-[12px] text-ink-muted">
              {breadcrumb}
            </div>
          )}
        </div>
      </div>
      {action}
    </header>
  );
}
