import { Link } from "@tanstack/react-router";
import { Calendar, Map, Users } from "lucide-react";
import { useLocale } from "@/lib/contexts/LocaleContext";
import { usePublicSurfaces } from "@/components/public/surfaces-context";

/** Sticky bottom actions on mobile — Map + Book (or Guides when booking off). */
export function PublicMobileBar() {
  const { t } = useLocale();
  const { bookingEnabled } = usePublicSurfaces();

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
        {bookingEnabled ? (
          <Link
            to="/book"
            className="flex flex-col items-center justify-center gap-1 py-3 bg-gold/15 text-ink hover:bg-gold/25 transition-colors"
          >
            <Calendar className="h-5 w-5 text-brand-dark" />
            <span className="text-xs font-semibold">{t("mobile.bar.book")}</span>
          </Link>
        ) : (
          <Link
            to="/guides"
            className="flex flex-col items-center justify-center gap-1 py-3 bg-gold/15 text-ink hover:bg-gold/25 transition-colors"
          >
            <Users className="h-5 w-5 text-brand-dark" />
            <span className="text-xs font-semibold">
              {t("mobile.bar.guides")}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
