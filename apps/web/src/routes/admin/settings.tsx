import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
  SectionLabel,
  Toggle,
} from "@/components/AdminLayout";
import {
  getSiteSettings,
  updateSiteSettings,
  type SiteSettingsDto,
} from "@/lib/settings-fns";
import { requireAuth } from "@/lib/auth-guard";
import { ImageMediaField } from "@/components/admin/ImageMediaField";

export const Route = createFileRoute("/admin/settings")({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.pathname, { roles: ["superadmin"] });
  },
  loader: async () => {
    const settings = await getSiteSettings();
    return { settings };
  },
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const { settings } = Route.useLoaderData();
  const [form, setForm] = useState({
    site_name: settings?.site_name ?? "Visit Harar",
    site_tagline:
      settings?.site_tagline ??
      "Official Tourism Website of the Harari Regional State",
    default_og_image: settings?.default_og_image ?? "",
    maintenance_mode: settings?.maintenance_mode ?? false,
    booking_enabled: settings?.booking_enabled ?? false,
    event_rsvp_enabled: settings?.event_rsvp_enabled ?? false,
    pwa_install_enabled: settings?.pwa_install_enabled ?? false,
    app_promo_enabled: settings?.app_promo_enabled ?? false,
    bureau_email: settings?.bureau_email ?? "",
    analytics_id: settings?.analytics_id ?? "",
    chat_knowledge_extra: settings?.chat_knowledge_extra ?? "",
  });
  const [lastSaved, setLastSaved] = useState<SiteSettingsDto | null>(settings);
  const [ogMediaId, setOgMediaId] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name ?? "Visit Harar",
        site_tagline: settings.site_tagline ?? "",
        default_og_image: settings.default_og_image ?? "",
        maintenance_mode: settings.maintenance_mode,
        booking_enabled: settings.booking_enabled,
        event_rsvp_enabled: settings.event_rsvp_enabled,
        pwa_install_enabled: settings.pwa_install_enabled,
        app_promo_enabled: settings.app_promo_enabled,
        bureau_email: settings.bureau_email ?? "",
        analytics_id: settings.analytics_id ?? "",
        chat_knowledge_extra: settings.chat_knowledge_extra ?? "",
      });
      setLastSaved(settings);
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: () =>
      updateSiteSettings({
        data: {
          site_name: form.site_name,
          site_tagline: form.site_tagline,
          default_og_image: form.default_og_image || null,
          maintenance_mode: form.maintenance_mode,
          booking_enabled: form.booking_enabled,
          event_rsvp_enabled: form.event_rsvp_enabled,
          pwa_install_enabled: form.pwa_install_enabled,
          app_promo_enabled: form.app_promo_enabled,
          bureau_email: form.bureau_email || null,
          analytics_id: form.analytics_id || null,
          chat_knowledge_extra: form.chat_knowledge_extra || null,
        },
      }),
    onSuccess: (data) => {
      setLastSaved(data);
      toast.success("Settings saved");
    },
    onError: (err: Error) => {
      toast.error("Could not save settings", { description: err.message });
    },
  });

  return (
    <AdminLayout title="Settings" breadcrumb="System · Configuration">
      <div className="max-w-3xl space-y-6">
        <AdminCard className="p-6 space-y-4">
          <SectionLabel>General</SectionLabel>
          <Field label="Site Name">
            <Input
              value={form.site_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, site_name: e.target.value }))
              }
            />
          </Field>
          <Field label="Site Tagline">
            <Input
              value={form.site_tagline}
              onChange={(e) =>
                setForm((f) => ({ ...f, site_tagline: e.target.value }))
              }
            />
          </Field>
          <Field label="Default OG Image">
            <ImageMediaField
              label="OG image"
              module="settings"
              value={form.default_og_image || undefined}
              onChange={(url) =>
                setForm((f) => ({ ...f, default_og_image: url ?? "" }))
              }
              mediaAssetId={ogMediaId}
              onMediaAssetIdChange={setOgMediaId}
            />
          </Field>
        </AdminCard>

        <AdminCard className="p-6 space-y-5">
          <SectionLabel>System</SectionLabel>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maintenance Mode</span>
              <Toggle
                checked={form.maintenance_mode}
                onChange={(v) =>
                  setForm((f) => ({ ...f, maintenance_mode: v }))
                }
              />
            </div>
            <div className="mt-2 p-3 rounded bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
              Turning this on shows a maintenance page to all public visitors.
              Admin remains accessible.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Booking System</span>
              <Toggle
                checked={form.booking_enabled}
                onChange={(v) => setForm((f) => ({ ...f, booking_enabled: v }))}
              />
            </div>
            <div className="mt-2 p-3 rounded bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
              Public guide booking (/book). Off for V2 by default — turn on for
              V3. When off, CTAs point visitors to Guides / Contact.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Event registration (RSVP)</span>
              <Toggle
                checked={form.event_rsvp_enabled}
                onChange={(v) =>
                  setForm((f) => ({ ...f, event_rsvp_enabled: v }))
                }
              />
            </div>
            <div className="mt-2 p-3 rounded bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
              Public event RSVP on news pages. Events stay readable when off.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PWA install UI</span>
              <Toggle
                checked={form.pwa_install_enabled}
                onChange={(v) =>
                  setForm((f) => ({ ...f, pwa_install_enabled: v }))
                }
              />
            </div>
            <div className="mt-2 p-3 rounded bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
              “Add to home screen” button in the footer.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">App download promo</span>
              <Toggle
                checked={form.app_promo_enabled}
                onChange={(v) =>
                  setForm((f) => ({ ...f, app_promo_enabled: v }))
                }
              />
            </div>
            <div className="mt-2 p-3 rounded bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
              Android APK link in the footer. Keep OFF until an APK is in the
              image (`/downloads/visit-harar.apk`) or{" "}
              <code className="text-[11px]">VITE_ANDROID_APK_URL</code> is set
              — otherwise the link 404s. Flutter store ship is V3.
            </div>
          </div>

          <Field label="Commission Email">
            <Input
              value={form.bureau_email}
              onChange={(e) =>
                setForm((f) => ({ ...f, bureau_email: e.target.value }))
              }
              placeholder="info@visitharar.gov.et"
            />
          </Field>
          <Field label="Google Analytics ID">
            <Input
              value={form.analytics_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, analytics_id: e.target.value }))
              }
              placeholder="G-XXXXXXXXXX"
            />
          </Field>
        </AdminCard>

        <AdminCard className="p-6 space-y-4">
          <SectionLabel>AI Chat</SectionLabel>
          <Field label="Extra knowledge (plain text)">
            <textarea
              value={form.chat_knowledge_extra}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  chat_knowledge_extra: e.target.value,
                }))
              }
              rows={8}
              className="w-full rounded-md border border-border px-3 py-2 text-sm font-mono"
              placeholder="Additional facts for the chat assistant — festivals, seasonal tips, commission policies…"
            />
          </Field>
          <p className="text-xs text-ink-muted">
            Appended to the auto-generated site knowledge snapshot. No HTML —
            plain text only.
          </p>
        </AdminCard>

        <div className="flex justify-between items-center">
          <span className="text-xs text-ink-muted">
            {lastSaved?.updated_by_name
              ? `Last updated by ${lastSaved.updated_by_name}`
              : "Not saved yet"}
          </span>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
