import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/public/PageHero";
import { usePublicContact } from "@/components/public/contact-context";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import { ComingSoon } from "@/components/public/ComingSoon";
import { buildHeadAsync } from "@/lib/metadata";
import { submitInquiry } from "@/lib/inquiry-fns";

export const Route = createFileRoute("/contact")({
  head: async () =>
    buildHeadAsync({
      title: "Contact",
      description:
        "Contact the Harari Regional Tourism Bureau for visit information, bookings, and bureau inquiries.",
      canonicalPath: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { contact: info } = usePublicContact();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const inquiry = useMutation({
    mutationFn: () => submitInquiry({ data: form }),
    onSuccess: () => {
      toast.success("Inquiry sent", {
        description: "The bureau will respond to your email soon.",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: (err: Error) => {
      toast.error("Could not send inquiry", {
        description: err.message || "Please try again later.",
      });
    },
  });

  if (!info) {
    return (
      <PublicLayout>
        <PageHero
          title="Contact the Bureau"
          subtitle="We're here to help with any question about visiting Harar."
        />
        <ComingSoon
          message="Contact information will be published by the bureau soon."
          backTo="/"
        />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageHero
        title="Contact the Bureau"
        subtitle="We're here to help with any question about visiting Harar."
      />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12 grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-border p-8">
          <h2 className="font-serif text-2xl font-bold mb-4">
            {info.office_name ?? "Harari Regional Tourism Bureau"}
          </h2>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="w-4 h-4 text-brand mt-0.5" />
              <span>
                {info.address_line1 ?? "—"}
                <br />
                {[info.address_line2, info.country]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </li>
            {info.phone_primary ? (
              <li className="flex gap-3">
                <Phone className="w-4 h-4 text-brand mt-0.5" />
                <a
                  href={`tel:${info.phone_primary}`}
                  className="hover:text-brand"
                >
                  {info.phone_primary}
                </a>
              </li>
            ) : null}
            {info.email_general ? (
              <li className="flex gap-3">
                <Mail className="w-4 h-4 text-brand mt-0.5" />
                <a
                  href={`mailto:${info.email_general}`}
                  className="hover:text-brand"
                >
                  {info.email_general}
                </a>
              </li>
            ) : null}
          </ul>
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Working Hours</h3>
            <table className="text-sm w-full">
              <tbody>
                {info.working_hours.length === 0 ? (
                  <tr className="border-t border-border">
                    <td className="py-2 text-ink-muted" colSpan={2}>
                      Hours not published yet.
                    </td>
                  </tr>
                ) : (
                  info.working_hours.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2">{row.day}</td>
                      <td className="text-right text-ink-muted">{row.hours}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 h-48 rounded-lg bg-gradient-to-br from-stone-300 to-stone-400 grid place-items-center text-stone-700 relative overflow-hidden">
            <MapPin className="w-8 h-8" />
            {info.map_lat != null && info.map_lng != null ? (
              <span className="absolute bottom-2 left-2 text-[11px] bg-white/90 px-2 py-1 rounded">
                {info.map_lat}, {info.map_lng}
              </span>
            ) : null}
          </div>
          <div className="flex gap-2 mt-4">
            {[
              { Icon: Facebook, href: info.facebook_url },
              { Icon: Twitter, href: info.twitter_url },
              { Icon: Instagram, href: info.instagram_url },
            ]
              .filter((s) => Boolean(s.href))
              .map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href!}
                  className="w-9 h-9 rounded-full border border-border grid place-items-center hover:bg-brand hover:text-white hover:border-brand transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            inquiry.mutate();
          }}
          className="bg-white rounded-lg border border-border p-8 space-y-4"
        >
          <h2 className="font-serif text-2xl font-bold mb-4">
            Send an Inquiry
          </h2>
          {[
            { l: "Name", t: "text", key: "name" as const },
            { l: "Email", t: "email", key: "email" as const },
            { l: "Subject", t: "text", key: "subject" as const },
          ].map((f) => (
            <label key={f.l} className="block">
              <span className="block text-xs font-semibold text-ink mb-1">
                {f.l}
              </span>
              <input
                type={f.t}
                required
                value={form[f.key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                className="w-full rounded border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
          ))}
          <label className="block">
            <span className="block text-xs font-semibold text-ink mb-1">
              Message
            </span>
            <textarea
              rows={6}
              required
              minLength={10}
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full rounded border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <button
            type="submit"
            disabled={inquiry.isPending}
            className="px-6 py-3 rounded-md bg-brand text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {inquiry.isPending ? "Sending…" : "Send Inquiry"}
          </button>
        </form>
      </section>
    </PublicLayout>
  );
}
