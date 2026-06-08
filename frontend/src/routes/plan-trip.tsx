import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/plan-trip")({
  beforeLoad: () => {
    throw redirect({ to: "/plan-your-trip" });
  },
});
