import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/map-places")({
  component: () => <Outlet />,
});
