import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout, AdminCard, Button, Field, Input, SectionLabel, Toggle } from "@/components/AdminLayout";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const [maint, setMaint] = useState(false);
  const [booking, setBooking] = useState(true);
  return (
    <AdminLayout title="Settings" breadcrumb="System · Configuration">
      <div className="max-w-3xl space-y-6">
        <AdminCard className="p-6 space-y-4">
          <SectionLabel>General</SectionLabel>
          <Field label="Site Name"><Input defaultValue="Visit Harar" /></Field>
          <Field label="Site Tagline"><Input defaultValue="Official Tourism Website of the Harari Regional State" /></Field>
          <Field label="Default OG Image">
            <div className="flex items-center gap-3">
              <div className="w-24 h-14 rounded bg-gradient-to-br from-brand-dark to-gold border border-border" />
              <Button variant="outline">Choose from Media</Button>
            </div>
          </Field>
        </AdminCard>

        <AdminCard className="p-6 space-y-5">
          <SectionLabel>System</SectionLabel>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maintenance Mode</span>
              <Toggle checked={maint} onChange={setMaint} />
            </div>
            <div className="mt-2 p-3 rounded bg-amber-50 border border-amber-200 text-[12px] text-amber-900">⚠️ Turning this on will show a maintenance page to all public visitors.</div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Booking System</span>
              <Toggle checked={booking} onChange={setBooking} />
            </div>
            <div className="mt-2 p-3 rounded bg-amber-50 border border-amber-200 text-[12px] text-amber-900">Turning this off disables the booking form on the public site.</div>
          </div>

          <Field label="Bureau Email"><Input defaultValue="info@visitharar.gov.et" /></Field>
          <Field label="Google Analytics ID"><Input defaultValue="G-XXXXXXXXXX" /></Field>
        </AdminCard>

        <div className="flex justify-between items-center">
          <span className="text-xs text-ink-muted">Last updated by Super Admin · 3 days ago</span>
          <Button>Save Settings</Button>
        </div>
      </div>
    </AdminLayout>
  );
}