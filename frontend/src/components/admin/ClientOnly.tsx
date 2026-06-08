"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Renders children only after hydration — use for libraries that break SSR (e.g. @dnd-kit). */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
