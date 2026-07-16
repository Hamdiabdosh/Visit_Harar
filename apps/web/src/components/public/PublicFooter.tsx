import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import type { ContactDto } from "@/lib/contact-fns";
import { ANDROID_APK_FILENAME, ANDROID_APK_URL } from "@/lib/app-download";
import { PwaInstallButton } from "@/components/public/PwaInstallButton";
import { useLocale } from "@/lib/contexts/LocaleContext";
import { usePublicSurfaces } from "@/components/public/surfaces-context";
import { ORG_NAME } from "@/lib/org";

export function PublicFooter({ contact }: { contact: ContactDto | null }) {
  const { t, locale, setLocale } = useLocale();
  const { bookingEnabled, pwaInstallEnabled, appPromoEnabled } =
    usePublicSurfaces();
  const year = new Date().getFullYear();

  const phone = contact?.phone_primary ?? contact?.phone_secondary ?? null;
  const email = contact?.email_general ?? null;

  const planLinks = [
    { to: "/plan-your-trip", label: t("nav.plan") },
    ...(bookingEnabled
      ? [{ to: "/book", label: t("nav.bookGuide") }]
      : [{ to: "/guides", label: t("nav.meetGuides") }]),
    { to: "/itineraries", label: t("footer.itineraries") },
    { to: "/services", label: t("footer.services") },
    { to: "/about", label: t("footer.aboutHarar") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const connectLinks = [
    ...(phone
      ? [{ to: `tel:${phone.replace(/\s/g, "")}`, label: phone, external: true }]
      : []),
    ...(email
      ? [{ to: `mailto:${email}`, label: email, external: true }]
      : []),
    ...(appPromoEnabled
      ? [
          {
            to: ANDROID_APK_URL,
            label: t("footer.downloadAndroid"),
            external: true,
            download: ANDROID_APK_FILENAME,
          },
        ]
      : []),
  ];

  return (
    <footer className="mt-16 bg-brand-dark text-white/75 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <SiteLogo variant="emblem" size="md" />
              <span className="font-serif text-white text-lg font-bold leading-tight">
                {t("brand")}
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-white/55 max-w-xs">
              {t("footer.unesco")}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <SocialLink
                href={contact?.facebook_url}
                label="Facebook"
                icon={<Facebook className="w-3.5 h-3.5" />}
              />
              <SocialLink
                href={contact?.twitter_url}
                label="Twitter"
                icon={<Twitter className="w-3.5 h-3.5" />}
              />
              <SocialLink
                href={contact?.instagram_url}
                label="Instagram"
                icon={<Instagram className="w-3.5 h-3.5" />}
              />
            </div>
          </div>

          <FooterCol
            title={t("footer.explore")}
            links={[
              { to: "/attractions", label: t("nav.attractions") },
              { to: "/map", label: t("nav.map") },
              { to: "/guides", label: t("nav.guides") },
              { to: "/gallery", label: t("nav.gallery") },
              { to: "/culture", label: t("nav.culture") },
              { to: "/news", label: t("nav.news") },
            ]}
          />
          <FooterCol title={t("footer.plan")} links={planLinks} />
          <FooterCol
            title={t("footer.connect")}
            links={connectLinks}
            extra={
              pwaInstallEnabled ? (
                <PwaInstallButton variant="link" className="mt-1" />
              ) : null
            }
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-white/45">
          <p>
            © {year} {ORG_NAME}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex rounded border border-white/15 overflow-hidden"
              role="group"
              aria-label="Language"
            >
              {(["en", "am"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    locale === code
                      ? "bg-gold text-ink"
                      : "text-white/60 hover:bg-white/10"
                  }`}
                >
                  {code === "en" ? "EN" : "አማ"}
                </button>
              ))}
            </div>
            <span className="text-white/25" aria-hidden>
              ·
            </span>
            <p>
              {t("footer.builtBy")}{" "}
              <a
                href="https://raafat.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-gold transition-colors"
              >
                RAAFAT-DIGITAL
              </a>
            </p>
          </div>
        </div>
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
      className="w-8 h-8 rounded-full border border-white/15 grid place-items-center hover:bg-gold hover:text-brand-dark hover:border-gold transition-colors"
    >
      {icon}
    </a>
  );
}

type FooterLink = {
  to: string;
  label: string;
  external?: boolean;
  download?: string;
};

function FooterCol({
  title,
  links,
  extra,
}: {
  title: string;
  links: FooterLink[];
  extra?: React.ReactNode;
}) {
  if (links.length === 0 && !extra) return null;

  return (
    <div>
      <h4 className="text-white/90 font-semibold text-xs uppercase tracking-wider mb-3">
        {title}
      </h4>
      <ul className="space-y-1.5 text-xs">
        {links.map((l) => (
          <li key={`${l.to}-${l.label}`}>
            {l.external ? (
              <a
                href={l.to}
                download={l.download}
                className="text-white/60 hover:text-gold transition-colors break-all line-clamp-2"
              >
                {l.label}
              </a>
            ) : (
              <Link
                to={l.to}
                className="text-white/60 hover:text-gold transition-colors"
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
      {extra}
    </div>
  );
}
