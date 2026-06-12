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
    booking_enabled: settings?.booking_enabled ?? true,
    bureau_email: settings?.bureau_email ?? "",
    analytics_id: settings?.analytics_id ?? "",
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
        bureau_email: settings.bureau_email ?? "",
        analytics_id: settings.analytics_id ?? "",
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
          bureau_email: form.bureau_email || null,
          analytics_id: form.analytics_id || null,
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
              Turning this off disables the booking form on the public site.
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
