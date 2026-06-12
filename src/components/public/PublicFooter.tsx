import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import type { ContactDto } from "@/lib/contact-fns";
import { ORG_NAME } from "@/lib/org";

export function PublicFooter({ contact }: { contact: ContactDto | null }) {
  const year = new Date().getFullYear();

  const phone = contact?.phone_primary ?? contact?.phone_secondary ?? null;
  const email = contact?.email_general ?? null;

  return (
    <footer className="bg-brand-dark text-white/80 pt-16 pb-6 mt-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 lg:grid-cols-6 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <SiteLogo />
            <span className="font-serif text-white text-xl font-bold">
              Visit Harar
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Official tourism website of the {ORG_NAME} —
            Africa&apos;s fourth holiest Islamic city and a UNESCO World
            Heritage Site.
          </p>

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
          title="Explore"
          links={[
            { to: "/attractions", label: "Attractions" },
            { to: "/gallery", label: "Gallery" },
            { to: "/culture", label: "Culture" },
            { to: "/news", label: "News" },
          ]}
        />
        <FooterCol
          title="Plan"
          links={[
            { to: "/plan-your-trip", label: "Plan Your Trip" },
            { to: "/book", label: "Book a Guide" },
          ]}
        />
        <FooterCol
          title="Learn"
          links={[
            { to: "/about", label: "About Harar" },
            { to: "/contact", label: "Contact" },
          ]}
        />
        <FooterCol
          title="Connect"
          links={[
            { to: "/contact", label: "Contact Commission" },
            { to: "/news", label: "Announcements" },
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

        <div className="flex items-center gap-3">
          <span className="text-white/60">
            © {year} {ORG_NAME}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded bg-gold/20 text-gold border border-gold/30 text-[10px] uppercase tracking-wider">
            Language: EN (v2)
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
        Built with care by{" "}
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
