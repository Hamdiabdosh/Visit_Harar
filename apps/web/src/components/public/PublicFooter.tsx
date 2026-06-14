import { Link } from "@tanstack/react-router";
import {
  Download,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  Twitter,
} from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import type { ContactDto } from "@/lib/contact-fns";
import { ANDROID_APK_FILENAME, ANDROID_APK_URL } from "@/lib/app-download";
import { PwaInstallButton } from "@/components/public/PwaInstallButton";
import { useLocale } from "@/lib/contexts/LocaleContext";
import { ORG_NAME } from "@/lib/org";

export function PublicFooter({ contact }: { contact: ContactDto | null }) {
  const { t, locale, setLocale } = useLocale();
  const year = new Date().getFullYear();

  const phone = contact?.phone_primary ?? contact?.phone_secondary ?? null;
  const email = contact?.email_general ?? null;
  const officeName = contact?.office_name ?? ORG_NAME;
  const addressLines = [
    contact?.address_line1,
    contact?.address_line2,
    contact?.country,
  ].filter(Boolean) as string[];
  const hasMap =
    contact?.map_lat != null &&
    contact?.map_lng != null &&
    Number.isFinite(contact.map_lat) &&
    Number.isFinite(contact.map_lng);
  const mapUrl = hasMap
    ? `https://www.google.com/maps?q=${contact!.map_lat},${contact!.map_lng}`
    : null;
  const hoursPreview = contact?.working_hours?.slice(0, 3) ?? [];

  return (
    <footer className="mt-20 bg-brand-dark text-white/80">
      {/* Gold accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* App CTA strip */}
      <div className="border-b border-white/10 bg-white/[0.03]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-11 h-11 rounded-full bg-gold/15 border border-gold/30 grid place-items-center">
              <Smartphone className="w-5 h-5 text-gold" aria-hidden />
            </div>
            <div>
              <p className="text-white font-semibold">{t("footer.getApp")}</p>
              <p className="text-sm text-white/60 mt-0.5 max-w-md">
                {t("footer.appBlurb")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={ANDROID_APK_URL}
              download={ANDROID_APK_FILENAME}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-gold text-ink text-sm font-semibold hover:bg-gold-dark transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden />
              {t("footer.downloadAndroid")}
            </a>
            <PwaInstallButton variant="outline-dark" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <SiteLogo variant="emblem" size="lg" />
              <div>
                <span className="font-serif text-white text-xl font-bold block leading-tight">
                  {t("brand")}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-gold/90 font-semibold">
                  {t("footer.officialSite")}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70 max-w-sm">
              {t("footer.tagline")}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gold/90 bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden />
              {t("footer.unesco")}
            </p>

            <div className="flex items-center gap-3 mt-6">
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

          {/* Nav columns */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
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
            <FooterCol
              title={t("footer.plan")}
              links={[
                { to: "/plan-your-trip", label: t("nav.plan") },
                { to: "/itineraries", label: t("footer.itineraries") },
                { to: "/services", label: t("footer.services") },
                { to: "/book", label: t("nav.bookGuide") },
              ]}
            />
            <FooterCol
              title={t("footer.learn")}
              links={[
                { to: "/about", label: t("footer.aboutHarar") },
                { to: "/contact", label: t("nav.contact") },
                { to: "/news", label: t("footer.announcements") },
              ]}
            />
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold text-sm mb-4 font-sans">
              {t("footer.visitOffice")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin
                  className="w-4 h-4 shrink-0 text-gold mt-0.5"
                  aria-hidden
                />
                <div>
                  <p className="text-white font-medium">{officeName}</p>
                  {addressLines.map((line) => (
                    <p key={line} className="text-white/65">
                      {line}
                    </p>
                  ))}
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 text-gold hover:text-gold-dark text-xs font-semibold transition-colors"
                    >
                      {t("nav.map")} →
                    </a>
                  )}
                </div>
              </li>
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex gap-3 hover:text-gold transition-colors group"
                  >
                    <Phone
                      className="w-4 h-4 shrink-0 text-gold group-hover:text-gold"
                      aria-hidden
                    />
                    <span>{phone}</span>
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex gap-3 hover:text-gold transition-colors group break-all"
                  >
                    <Mail
                      className="w-4 h-4 shrink-0 text-gold group-hover:text-gold"
                      aria-hidden
                    />
                    <span>{email}</span>
                  </a>
                </li>
              )}
            </ul>

            {hoursPreview.length > 0 && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">
                  {t("footer.hours")}
                </p>
                <ul className="space-y-1 text-xs text-white/65">
                  {hoursPreview.map((row) => (
                    <li key={row.day} className="flex justify-between gap-4">
                      <span>{row.day}</span>
                      <span className="text-white/80">{row.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              to="/book"
              className="mt-6 inline-flex w-full sm:w-auto items-center justify-center px-5 py-2.5 rounded-md bg-gold text-ink text-sm font-semibold hover:bg-gold-dark transition-colors"
            >
              {t("nav.bookGuide")}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-white/55">
          <p>
            © {year} {ORG_NAME}. {t("footer.unesco")}.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div
              className="inline-flex rounded-md border border-white/20 overflow-hidden"
              role="group"
              aria-label="Language"
            >
              {(["en", "am"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    locale === code
                      ? "bg-gold text-ink"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  {code === "en" ? "EN" : "አማ"}
                </button>
              ))}
            </div>
            <span className="hidden sm:block w-px h-4 bg-white/15" aria-hidden />
            <p>
              {t("footer.builtBy")}{" "}
              <a
                href="https://raafat.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold/90 hover:text-gold font-semibold transition-colors"
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
      <h4 className="text-white font-semibold text-sm mb-4 font-sans">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={`${l.to}-${l.label}`}>
            <Link
              to={l.to}
              className="text-white/70 hover:text-gold transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
