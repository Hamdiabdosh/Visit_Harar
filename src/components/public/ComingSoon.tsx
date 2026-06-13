import { Link } from "@tanstack/react-router";
import { ArrowRight, Landmark, Map, Mail } from "lucide-react";
import { useLocale } from "@/lib/contexts/LocaleContext";

export function ComingSoon({
  title,
  message,
  backTo = "/",
}: {
  title?: string;
  message?: string;
  backTo?: string;
}) {
  const { t } = useLocale();
  const heading = title ?? t("comingSoon.title");
  const body = message ?? t("comingSoon.message");

  return (
    <section className="max-w-3xl mx-auto px-5 lg:px-8 py-16">
      <div className="rounded-lg border border-border bg-gradient-to-br from-surface to-white p-8 md:p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
          <Landmark className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink">
          {heading}
        </h2>
        <p className="text-ink-muted mt-3 max-w-md mx-auto leading-relaxed">
          {body}
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
          <QuickLink
            to="/map"
            icon={<Map className="h-4 w-4" />}
            label={t("comingSoon.exploreMap")}
          />
          <QuickLink
            to="/attractions"
            icon={<Landmark className="h-4 w-4" />}
            label={t("comingSoon.viewAttractions")}
          />
          <QuickLink
            to="/contact"
            icon={<Mail className="h-4 w-4" />}
            label={t("comingSoon.contactUs")}
          />
        </div>

        <Link
          to={backTo}
          className="inline-flex items-center gap-1 mt-8 text-sm font-semibold text-brand hover:text-gold transition-colors"
        >
          {t("comingSoon.backHome")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function QuickLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-ink hover:border-brand/30 hover:bg-surface transition-colors"
    >
      <span className="text-brand shrink-0">{icon}</span>
      {label}
    </Link>
  );
}
