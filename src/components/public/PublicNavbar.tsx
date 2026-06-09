import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { useEffect, useId, useRef, useState } from "react";

const navLinks = [
  { to: "/", label: "Home", exact: true },
  { to: "/attractions", label: "Attractions" },
  { to: "/guides", label: "Guides" },
  { to: "/gallery", label: "Gallery" },
  { to: "/culture", label: "Culture" },
  { to: "/plan-your-trip", label: "Plan Your Trip" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicNavbar({
  transparentOnTop = false,
}: {
  transparentOnTop?: boolean;
}) {
  const [scrolled, setScrolled] = useState(!transparentOnTop);
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!transparentOnTop) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOnTop]);

  // Focus trap + escape + scroll lock
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const el = drawerRef.current;
    const focusables = () =>
      Array.from(
        el?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    const first = () => focusables()[0];
    const last = () => {
      const items = focusables();
      return items[items.length - 1];
    };

    const focusFirst = () => first()?.focus();
    const t = window.setTimeout(focusFirst, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const f = first();
      const l = last();
      if (!f || !l) return;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === f || !el?.contains(active)) {
          e.preventDefault();
          l.focus();
        }
      } else {
        if (active === l) {
          e.preventDefault();
          f.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Visit Harar Home"
          >
            <SiteLogo />
            <span
              className={`font-serif font-bold text-[17px] ${scrolled ? "text-ink" : "text-white"}`}
            >
              Visit Harar
            </span>
          </Link>

          <nav
            className="hidden lg:flex items-center gap-7"
            aria-label="Primary navigation"
          >
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-[13.5px] font-medium transition-colors hover:text-gold ${
                  scrolled ? "text-ink" : "text-white/90"
                }`}
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: l.exact ?? false }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/book"
              className="hidden md:inline-flex items-center px-4 py-2 rounded-md bg-gold text-ink text-sm font-semibold hover:bg-gold-dark hover:text-white transition-colors"
            >
              Book a Guide
            </Link>
            <button
              ref={triggerRef}
              onClick={() => setOpen(true)}
              className={`lg:hidden p-2 rounded-md ${scrolled ? "text-ink" : "text-white"}`}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-controls={drawerId}
              aria-expanded={open}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            ref={drawerRef}
            className="absolute inset-0 bg-brand-dark text-white flex flex-col"
          >
            <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <SiteLogo />
                <span className="font-serif font-bold text-lg">
                  Visit Harar
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav
              className="flex-1 flex flex-col items-center justify-center gap-6"
              aria-label="Mobile navigation"
            >
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="text-2xl font-serif"
                  activeProps={{ className: "text-gold" }}
                  activeOptions={{ exact: l.exact ?? false }}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/book"
                onClick={() => setOpen(false)}
                className="mt-4 px-6 py-3 rounded-md bg-gold text-ink font-semibold"
              >
                Book a Guide
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
