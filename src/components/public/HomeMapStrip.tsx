import { Link } from "@tanstack/react-router";
import { ArrowRight, Map } from "lucide-react";
import { useLocale } from "@/lib/contexts/LocaleContext";

export function HomeMapStrip() {
  const { t } = useLocale();

  return (
    <section className="bg-brand-dark text-white border-y border-white/10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gold/20 text-gold">
            <Map className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-gold">
              {t("home.mapStrip.title")}
            </h2>
            <p className="mt-1 text-sm text-white/75 max-w-xl leading-relaxed">
              {t("home.mapStrip.subtitle")}
            </p>
          </div>
        </div>
        <Link
          to="/map"
          className="inline-flex items-center justify-center gap-2 shrink-0 px-6 py-3 rounded-md bg-gold text-ink font-semibold hover:bg-gold-dark hover:text-white transition-colors"
        >
          {t("home.mapStrip.cta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
