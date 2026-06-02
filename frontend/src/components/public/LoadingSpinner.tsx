export function LoadingSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-ink-muted">
      <span
        aria-hidden="true"
        className="inline-block w-4 h-4 rounded-full border-2 border-border border-t-brand animate-spin"
      />
      <span className="text-sm">{label}</span>
    </div>
  )
}

