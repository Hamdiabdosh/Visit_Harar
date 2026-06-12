import { Link } from "@tanstack/react-router";
import { ORG_NAME } from "@/lib/org";

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">
          We&apos;ll be back soon
        </h1>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Visit Harar is undergoing scheduled maintenance. The {ORG_NAME} will
          restore public access shortly.
        </p>
        <p className="mt-6 text-sm text-ink-muted">
          Commission staff?{" "}
          <Link
            to="/admin/login"
            className="text-brand font-semibold hover:underline"
          >
            Sign in to admin
          </Link>
        </p>
      </div>
    </div>
  );
}
