import { Link } from '@tanstack/react-router'

export function ComingSoon({
  title = 'Coming soon',
  message = 'This page will be published soon.',
  backTo = '/',
}: {
  title?: string
  message?: string
  backTo?: string
}) {
  return (
    <section className="max-w-3xl mx-auto px-5 lg:px-8 py-16">
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <h2 className="font-serif text-2xl font-bold">{title}</h2>
        <p className="text-ink-muted mt-2">{message}</p>
        <div className="mt-6">
          <Link
            to={backTo}
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
          >
            Back
          </Link>
        </div>
      </div>
    </section>
  )
}

