import { Component } from 'react'

export class ErrorBoundary extends Component<
  { fallback?: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(err: unknown) {
    console.error('[SectionErrorBoundary]', err)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border border-border bg-white p-6 text-sm text-ink-muted">
            This section is temporarily unavailable.
          </div>
        )
      )
    }
    return this.props.children
  }
}

