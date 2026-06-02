import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { usePublicContact } from "@/components/public/contact-context";

export function PublicLayout({
  children,
  transparentNav = false,
}: {
  children: React.ReactNode;
  transparentNav?: boolean;
}) {
  const { contact } = usePublicContact();

  return (
    <div className="min-h-screen flex flex-col bg-white text-ink">
      <PublicNavbar transparentOnTop={transparentNav} />

      <main className="flex-1">{children}</main>

      <PublicFooter contact={contact} />
    </div>
  );
}