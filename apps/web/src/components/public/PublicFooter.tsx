import { Link, useRouterState } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import type { ContactDto } from "@/lib/contact-fns";
import { useLocale } from "@/lib/contexts/LocaleContext";
import { ORG_NAME } from "@/lib/org";

export function PublicFooter({ contact }: { contact: ContactDto | null }) {
  const { t, locale, setLocale } = useLocale();
  const year = new Date().getFullYear();

  const phone = contact?.phone_primary ?? contact?.phone_secondary ?? null;
  const email = contact?.email_general ?? null;

  return (
    <footer className="bg-brand-dark text-white/80 pt-16 pb-6 mt-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 lg:grid-cols-6 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <SiteLogo variant="emblem" size="lg" />
            <span className="font-serif text-white text-xl font-bold">
              {t("brand")}
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">{t("footer.tagline")}</p>

          <div className="flex items-center gap-3 mt-5">
            <SocialLink
              href={contact?.facebook_url}
              label="Facebook"
              icon={<Facebook className="w-4 h-4" />}
            />
            <SocialLink
              href={contact?.twitter_url}
              label="Twitter"
              icon={<Twitter className="w-4 h-4" />}
            />
            <SocialLink
              href={contact?.instagram_url}
              label="Instagram"
              icon={<Instagram className="w-4 h-4" />}
            />
          </div>
        </div>

        <FooterCol
          title={t("footer.explore")}
          links={[
            { to: "/attractions", label: t("nav.attractions") },
            { to: "/map", label: t("nav.map") },
            { to: "/gallery", label: t("nav.gallery") },
            { to: "/culture", label: t("nav.culture") },
            { to: "/news", label: t("nav.news") },
          ]}
        />
        <FooterCol
          title={t("footer.plan")}
          links={[
            { to: "/plan-your-trip", label: t("nav.plan") },
            { to: "/itineraries", label: "Itineraries" },
            { to: "/services", label: "Local Services" },
            { to: "/book", label: t("nav.bookGuide") },
          ]}
        />
        <FooterCol
          title={t("footer.learn")}
          links={[
            { to: "/about", label: t("footer.aboutHarar") },
            { to: "/contact", label: t("nav.contact") },
          ]}
        />
        <FooterCol
          title={t("footer.connect")}
          links={[
            { to: "/contact", label: t("footer.contactCommission") },
            { to: "/news", label: t("footer.announcements") },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-10 pt-6 border-t border-white/10 text-xs flex flex-col md:flex-row justify-between gap-3">
        <div className="text-white/60">
          {[
            contact?.office_name ?? ORG_NAME,
            contact?.address_line1,
            contact?.address_line2,
            contact?.country,
            phone,
            email,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-white/60">
            © {year} {ORG_NAME}
          </span>
          <div className="inline-flex rounded border border-white/20 overflow-hidden">
            {(["en", "am"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  locale === code
                    ? "bg-gold text-ink"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                {code === "en" ? "EN" : "አማ"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
        {t("footer.builtBy")}{" "}
        <a
          href="https://raafat.site"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          RAAFAT-DIGITAL
        </a>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string | null | undefined;
  label: string;
  icon: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full border border-white/20 grid place-items-center hover:bg-gold hover:text-brand-dark hover:border-gold transition-colors"
    >
      {icon}
    </a>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-white font-semibold text-sm mb-4 font-sans">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-gold transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
