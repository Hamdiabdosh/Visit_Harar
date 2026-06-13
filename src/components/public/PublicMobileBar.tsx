import { Link } from "@tanstack/react-router";
import { Calendar, Map } from "lucide-react";
import { useLocale } from "@/lib/contexts/LocaleContext";

/** Sticky bottom actions on mobile — Map + Book. Hidden on md+ and on /book. */
export function PublicMobileBar() {
  const { t } = useLocale();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-white/95 backdrop-blur md:hidden safe-area-pb"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-2 divide-x divide-border">
        <Link
          to="/map"
          className="flex flex-col items-center justify-center gap-1 py-3 text-ink hover:bg-surface transition-colors"
        >
          <Map className="h-5 w-5 text-brand" />
          <span className="text-xs font-semibold">{t("mobile.bar.map")}</span>
        </Link>
        <Link
          to="/book"
          className="flex flex-col items-center justify-center gap-1 py-3 bg-gold/15 text-ink hover:bg-gold/25 transition-colors"
        >
          <Calendar className="h-5 w-5 text-brand-dark" />
          <span className="text-xs font-semibold">{t("mobile.bar.book")}</span>
        </Link>
      </div>
    </nav>
  );
}
