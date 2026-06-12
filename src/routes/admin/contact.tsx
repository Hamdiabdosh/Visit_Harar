import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
  contactInputSchema,
  type ContactInput,
} from "@/lib/validators/contact";
import { getContactInfo, upsertContactInfo } from "@/lib/contact-fns";
import { MapPin, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/contact")({
  component: ContactAdmin,
});

function ContactAdmin() {
  const queryClient = useQueryClient();
  const { data: existing } = useQuery({
    queryKey: ["admin", "contact"],
    queryFn: () => getContactInfo(),
    retry: false,
  });

  type ContactForm = Omit<ContactInput, "working_hours" | "is_published"> & {
    working_hours?: ContactInput["working_hours"];
    is_published?: boolean;
  };

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactInputSchema),
    defaultValues: {
      office_name: "",
      address_line1: "",
      address_line2: "",
      country: "Ethiopia",
      phone_primary: "",
      phone_secondary: "",
      email_general: undefined,
      email_bookings: undefined,
      working_hours: [],
      map_lat: undefined,
      map_lng: undefined,
      facebook_url: undefined,
      twitter_url: undefined,
      instagram_url: undefined,
      is_published: false,
    },
    values: existing
      ? {
          office_name: existing.office_name ?? undefined,
          address_line1: existing.address_line1 ?? undefined,
          address_line2: existing.address_line2 ?? undefined,
          country: existing.country ?? undefined,
          phone_primary: existing.phone_primary ?? undefined,
          phone_secondary: existing.phone_secondary ?? undefined,
          email_general: existing.email_general ?? undefined,
          email_bookings: existing.email_bookings ?? undefined,
          working_hours: existing.working_hours ?? [],
          map_lat: existing.map_lat ?? undefined,
          map_lng: existing.map_lng ?? undefined,
          facebook_url: existing.facebook_url ?? undefined,
          twitter_url: existing.twitter_url ?? undefined,
          instagram_url: existing.instagram_url ?? undefined,
          is_published: existing.is_published,
        }
      : undefined,
  });

  const hours = form.watch("working_hours") ?? [];
  const lat = form.watch("map_lat");
  const lng = form.watch("map_lng");
  const published = form.watch("is_published") ?? false;

  const save = useMutation({
    mutationFn: (data: ContactForm) =>
      upsertContactInfo({
        data: {
          ...data,
          working_hours: data.working_hours ?? [],
          is_published: data.is_published ?? false,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contact"] });
      toast.success("Saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <AdminLayout
      title="Contact"
      breadcrumb="Content · Contact Information"
      action={
        <Button type="button" onClick={() => save.mutate(form.getValues())}>
          Save
        </Button>
      }
    >
      <AdminCard className="p-6 space-y-5 max-w-3xl">
        <Field label="Office Name">
          <Input
            {...form.register("office_name")}
            placeholder="Harari Tourism Commission"
          />
        </Field>
        <Field label="Address Line 1">
          <Input
            {...form.register("address_line1")}
            placeholder="Harar Jugol"
          />
        </Field>
        <Field label="Address Line 2">
          <Input
            {...form.register("address_line2")}
            placeholder="Harari Regional State"
          />
        </Field>
        <Field label="Country">
          <Input {...form.register("country")} placeholder="Ethiopia" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone (Primary)">
            <Input {...form.register("phone_primary")} placeholder="+251…" />
          </Field>
          <Field label="Phone (Secondary)">
            <Input {...form.register("phone_secondary")} placeholder="+251…" />
          </Field>
          <Field label="Email (General)">
            <Input
              {...form.register("email_general")}
              placeholder="info@visitharar.gov.et"
            />
          </Field>
          <Field label="Email (Bookings)">
            <Input
              {...form.register("email_bookings")}
              placeholder="bookings@visitharar.gov.et"
            />
          </Field>
        </div>

        <div>
          <SectionLabel>Working Hours</SectionLabel>
          <div className="space-y-2">
            {hours.map((h, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center"
              >
                <Input
                  value={h.day}
                  onChange={(e) => {
                    const c = [...hours];
                    c[i] = { ...c[i]!, day: e.target.value };
                    form.setValue("working_hours", c, { shouldDirty: true });
                  }}
                />
                <Input
                  value={h.hours}
                  onChange={(e) => {
                    const c = [...hours];
                    c[i] = { ...c[i]!, hours: e.target.value };
                    form.setValue("working_hours", c, { shouldDirty: true });
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    form.setValue(
                      "working_hours",
                      hours.filter((_, j) => j !== i),
                      { shouldDirty: true },
                    )
                  }
                  className="p-2 text-ink-muted hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.setValue(
                  "working_hours",
                  [...hours, { day: "", hours: "" }],
                  { shouldDirty: true },
                )
              }
            >
              <Plus className="w-4 h-4" /> Add Hours
            </Button>
          </div>
        </div>

        <div>
          <SectionLabel>Map Coordinates</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <Input
                type="number"
                step="any"
                {...form.register("map_lat", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Longitude">
              <Input
                type="number"
                step="any"
                {...form.register("map_lng", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <div className="mt-3 h-[200px] rounded-lg bg-gradient-to-br from-stone-300 to-stone-400 grid place-items-center text-stone-700 relative overflow-hidden">
            <MapPin className="w-8 h-8" />
            {lat != null && lng != null ? (
              <span className="absolute bottom-2 left-2 text-[11px] bg-white/90 px-2 py-1 rounded">
                {lat}, {lng}
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            📍 Pin will appear at these coordinates on the public site.
          </p>
        </div>

        <div>
          <SectionLabel>Social Links</SectionLabel>
          <div className="space-y-2">
            {["Facebook", "Twitter", "Instagram"].map((s) => (
              <div
                key={s}
                className="grid grid-cols-[100px_1fr] items-center gap-2"
              >
                <span className="text-sm font-medium">{s}</span>
                <Input
                  placeholder={`https://${s.toLowerCase()}.com/visitharar`}
                  {...form.register(
                    (s === "Facebook"
                      ? "facebook_url"
                      : s === "Twitter"
                        ? "twitter_url"
                        : "instagram_url") as keyof ContactInput,
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Toggle
              checked={published}
              onChange={(v) =>
                form.setValue("is_published", v, { shouldDirty: true })
              }
            />
            <span className="text-sm font-medium">Published</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                save.mutate({ ...form.getValues(), is_published: false })
              }
            >
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={() =>
                save.mutate({ ...form.getValues(), is_published: true })
              }
            >
              Save (Published)
            </Button>
          </div>
        </div>
      </AdminCard>
    </AdminLayout>
  );
}
