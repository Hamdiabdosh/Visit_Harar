import { Link } from "@tanstack/react-router";
import { Globe, Menu, Search } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  PublicSearchButton,
  PublicSearchDialog,
} from "@/components/public/PublicSearch";
import { useLocale } from "@/lib/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/i18n";
import { useEffect, useState } from "react";

type NavItem = { to: string; labelKey: TranslationKey; exact?: boolean };

/** Primary bar: Map first — Home via logo; Contact in footer + mobile More. */
const primaryNavItems: NavItem[] = [
  { to: "/map", labelKey: "nav.map" },
  { to: "/attractions", labelKey: "nav.attractions" },
  { to: "/guides", labelKey: "nav.guides" },
  { to: "/plan-your-trip", labelKey: "nav.plan" },
  { to: "/news", labelKey: "nav.news" },
];

/** Mobile drawer + footer — secondary discovery. */
const moreNavItems: NavItem[] = [
  { to: "/gallery", labelKey: "nav.gallery" },
  { to: "/culture", labelKey: "nav.culture" },
  { to: "/about", labelKey: "footer.aboutHarar" },
  { to: "/contact", labelKey: "nav.contact" },
];

function NavLink({
  item,
  scrolled,
  onNavigate,
  size = "desktop",
}: {
  item: NavItem;
  scrolled: boolean;
  onNavigate?: () => void;
  size?: "desktop" | "mobile-primary" | "mobile-secondary";
}) {
  const { t } = useLocale();

  if (size === "desktop") {
    return (
      <Link
        to={item.to}
        className={`text-[13.5px] font-medium transition-colors hover:text-gold whitespace-nowrap ${
          scrolled ? "text-ink" : "text-white/90"
        }`}
        activeProps={{ className: "text-gold" }}
        activeOptions={{ exact: item.exact ?? false }}
      >
        {t(item.labelKey)}
      </Link>
    );
  }

  const primaryClass =
    "block rounded-md px-3 py-2.5 font-serif text-lg text-white/90 transition-colors hover:bg-white/10 hover:text-white";
  const secondaryClass =
    "block rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white";

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={size === "mobile-primary" ? primaryClass : secondaryClass}
      activeProps={{
        className:
          size === "mobile-primary"
            ? "bg-white/10 text-gold font-semibold hover:text-gold"
            : "bg-white/10 text-gold",
      }}
      activeOptions={{ exact: item.exact ?? false }}
    >
      {t(item.labelKey)}
    </Link>
  );
}

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

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  function closeMenu() {
    setMenuOpen(false);
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
              className="flex items-center shrink-0 min-w-0"
              aria-label={`${t("brand")} Home`}
            >
              <SiteLogo
                variant="horizontal"
                size="md"
                className="hidden sm:block"
              />
              <SiteLogo variant="emblem" size="md" className="sm:hidden" />
            </Link>

            <nav
              className="hidden md:flex items-center gap-5 lg:gap-6"
              aria-label="Primary navigation"
            >
              {primaryNavItems.map((item) => (
                <NavLink key={item.to} item={item} scrolled={scrolled} />
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
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-md bg-gold text-ink text-sm font-semibold hover:bg-gold-dark hover:text-white transition-colors whitespace-nowrap"
              >
                {t("nav.bookGuide")}
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className={`md:hidden p-2 rounded-md ${textClass}`}
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
            <div className="flex items-center pr-8">
              <SiteLogo variant="horizontal" size="sm" />
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
              {primaryNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    item={item}
                    scrolled={false}
                    onNavigate={closeMenu}
                    size="mobile-primary"
                  />
                </li>
              ))}
            </ul>

            <p className="mt-5 mb-2 px-3 text-[10px] uppercase tracking-widest text-white/45 font-semibold">
              {t("nav.more")}
            </p>
            <ul className="space-y-0.5">
              {moreNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    item={item}
                    scrolled={false}
                    onNavigate={closeMenu}
                    size="mobile-secondary"
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              to="/book"
              onClick={closeMenu}
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
