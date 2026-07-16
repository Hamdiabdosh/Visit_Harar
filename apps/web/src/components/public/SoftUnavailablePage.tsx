import { Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";

type Props = {
  title: string;
  subtitle: string;
  body: string;
};

/** Soft-gate for hidden public booking / RSVP routes (V2-001). No bare 404. */
export function SoftUnavailablePage({ title, subtitle, body }: Props) {
  return (
    <PublicLayout>
      <PageHero title={title} subtitle={subtitle} />
      <section className="max-w-xl mx-auto px-5 py-16 text-center">
        <p className="text-ink-muted mb-8">{body}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/guides"
            className="inline-flex px-6 py-3 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark"
          >
            Meet our guides
          </Link>
          <Link
            to="/contact"
            className="inline-flex px-6 py-3 rounded-md border border-border font-semibold hover:bg-surface"
          >
            Contact the Commission
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
