import { useRouterState } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicMobileBar } from "@/components/public/PublicMobileBar";
import { ChatWidget } from "@/components/public/ChatWidget";
import { PwaRegister } from "@/components/public/PwaRegister";
import { usePublicContact } from "@/components/public/contact-context";
import { usePublicSurfaces } from "@/components/public/surfaces-context";
import { LocaleProvider } from "@/lib/contexts/LocaleContext";

function PublicLayoutInner({
  children,
  transparentNav,
}: {
  children: React.ReactNode;
  transparentNav: boolean;
}) {
  const { contact } = usePublicContact();
  const { pwaInstallEnabled } = usePublicSurfaces();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideMobileBar = pathname === "/book" || pathname.startsWith("/book/");
  const showMobileBar = !hideMobileBar;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink">
      <PublicNavbar transparentOnTop={transparentNav} />

      <main
        className={`flex-1 ${showMobileBar ? "pb-[4.5rem] md:pb-0" : ""}`}
      >
        {children}
      </main>

      <PublicFooter contact={contact} />
      {showMobileBar && <PublicMobileBar />}
      <ChatWidget />
      {pwaInstallEnabled ? <PwaRegister /> : null}
    </div>
  );
}

export function PublicLayout({
  children,
  transparentNav = false,
}: {
  children: React.ReactNode;
  transparentNav?: boolean;
}) {
  return (
    <LocaleProvider>
      <PublicLayoutInner transparentNav={transparentNav}>
        {children}
      </PublicLayoutInner>
    </LocaleProvider>
  );
}
