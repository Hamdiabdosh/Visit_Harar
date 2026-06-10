import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useSidebarOpen } from "@/store/sidebarStore";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarOpen();

  return (
    <div
      className="flex min-h-screen bg-[#f5f5f2] text-ink"
      data-sidebar-collapsed={collapsed}
    >
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
