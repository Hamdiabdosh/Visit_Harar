import { Link } from "@tanstack/react-router";
import { Globe, Menu, Search } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  PublicSearchButton,
  PublicSearchDialog,
} from "@/components/public/PublicSearch";
import { useLocale } from "@/lib/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/i18n";
import { useEffect, useState } from "react";

/** Top nav: 7 links — Gallery & Culture live in footer only. Map is 2nd. */
const navItems: { to: string; labelKey: TranslationKey; exact?: boolean }[] = [
  { to: "/", labelKey: "nav.home", exact: true },
  { to: "/map", labelKey: "nav.map" },
  { to: "/attractions", labelKey: "nav.attractions" },
  { to: "/guides", labelKey: "nav.guides" },
  { to: "/plan-your-trip", labelKey: "nav.plan" },
  { to: "/news", labelKey: "nav.news" },
  { to: "/contact", labelKey: "nav.contact" },
];

export function PublicNavbar({
  transparentOnTop = false,
}: {
  transparentOnTop?: boolean;
}) {
  const { locale, setLocale, t } = useLocale();
  const [scrolled, setScrolled] = useState(!transparentOnTop);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!transparentOnTop) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOnTop]);

  const textClass = scrolled ? "text-ink" : "text-white";
  const trustClass = scrolled ? "text-ink-muted" : "text-white/60";

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3">
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 min-w-0"
              aria-label={`${t("brand")} Home`}
            >
              <SiteLogo />
              <div className="min-w-0 leading-tight">
                <span
                  className={`block font-serif font-bold text-[17px] truncate ${textClass}`}
                >
                  {t("brand")}
                </span>
                <span
                  className={`hidden sm:block text-[10px] tracking-wide truncate ${trustClass}`}
                >
                  {t("header.official")}
                </span>
              </div>
            </Link>

            <nav
              className="hidden lg:flex items-center gap-5 xl:gap-6"
              aria-label="Primary navigation"
            >
              {navItems.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-[13.5px] font-medium transition-colors hover:text-gold whitespace-nowrap ${
                    scrolled ? "text-ink" : "text-white/90"
                  }`}
                  activeProps={{ className: "text-gold" }}
                  activeOptions={{ exact: l.exact ?? false }}
                >
                  {t(l.labelKey)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <PublicSearchButton
                scrolled={scrolled}
                open={searchOpen}
                onOpenChange={setSearchOpen}
              />

              <div
                className={`hidden sm:flex items-center rounded-md border text-xs overflow-hidden ${
                  scrolled ? "border-border" : "border-white/25"
                }`}
              >
                {(["en", "am"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLocale(code)}
                    className={`px-2.5 py-1.5 font-medium transition-colors ${
                      locale === code
                        ? scrolled
                          ? "bg-brand text-white"
                          : "bg-white/20 text-white"
                        : scrolled
                          ? "text-ink-muted hover:text-ink"
                          : "text-white/70 hover:text-white"
                    }`}
                    aria-label={t(code === "en" ? "locale.en" : "locale.am")}
                  >
                    {code === "en" ? "EN" : "አማ"}
                  </button>
                ))}
              </div>

              <Link
                to="/book"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-md bg-gold text-ink text-sm font-semibold hover:bg-gold-dark hover:text-white transition-colors whitespace-nowrap"
              >
                {t("nav.bookGuide")}
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className={`lg:hidden p-2 rounded-md ${textClass}`}
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <PublicSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="flex h-full w-[min(85vw,320px)] min-h-0 flex-col border-white/10 bg-brand-dark p-0 text-white sm:max-w-[320px] [&>button]:text-white/80 [&>button]:hover:text-white [&>button]:focus:ring-gold"
        >
          <SheetHeader className="border-b border-white/10 px-5 py-4 text-left">
            <div className="flex items-center gap-2 pr-8">
              <SiteLogo />
              <div className="min-w-0">
                <SheetTitle className="font-serif text-lg font-bold text-white">
                  {t("brand")}
                </SheetTitle>
                <p className="text-[10px] text-white/60 mt-0.5">
                  {t("header.official")}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
            <Globe className="w-4 h-4 text-white/60 shrink-0" />
            {(["en", "am"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  locale === code
                    ? "bg-gold text-ink"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                {t(code === "en" ? "locale.en" : "locale.am")}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={openSearch}
            className="mx-3 mt-3 flex items-center gap-3 rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white/90 hover:bg-white/10"
          >
            <Search className="h-4 w-4 text-gold" />
            {t("nav.search")}
          </button>

          <nav
            className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
            aria-label="Mobile navigation"
          >
            <ul className="space-y-1">
              {navItems.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2.5 font-serif text-lg text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    activeProps={{
                      className:
                        "bg-white/10 text-gold font-semibold hover:text-gold",
                    }}
                    activeOptions={{ exact: l.exact ?? false }}
                  >
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
              <li className="pt-2 mt-2 border-t border-white/10">
                <Link
                  to="/gallery"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                >
                  {t("nav.gallery")}
                </Link>
              </li>
              <li>
                <Link
                  to="/culture"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                >
                  {t("nav.culture")}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              to="/book"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center justify-center rounded-md bg-gold px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-dark hover:text-white"
            >
              {t("nav.bookGuide")}
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
