export function MapSkeleton({ className = "h-[400px]" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border bg-gradient-to-br from-stone-200 to-stone-300 animate-pulse ${className}`}
      role="status"
      aria-label="Loading map"
    >
      <div className="h-full w-full grid place-items-center text-stone-500 text-sm">
        Loading map…
      </div>
    </div>
  );
}
