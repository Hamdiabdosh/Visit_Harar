import { Outlet, createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { SessionProvider } from "@/lib/contexts/SessionContext";
import { isPublicAdminPath, requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>) => ({
    denied:
      search.denied === true ||
      search.denied === "1" ||
      search.denied === 1 ||
      search.denied === "true",
  }),
  beforeLoad: async ({ location }) => {
    if (isPublicAdminPath(location.pathname)) {
      return {};
    }
    const session = await requireAuth(location.pathname);
    return { session };
  },
  component: AdminRouteLayout,
});

function AdminRouteLayout() {
  const search = useSearch({ from: "/admin" });

  useEffect(() => {
    if (search.denied) {
      toast.error("Access denied", {
        description: "You do not have permission to view that page.",
      });
    }
  }, [search.denied]);

  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  );
}
