import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
  Select,
  Toggle,
} from "@/components/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  pinAnnouncement,
  unpinAnnouncement,
  updateAnnouncement,
} from "@/lib/announcements-fns";
import { generateSlug } from "@/lib/slug";
import {
  announcementInputSchema,
  type AnnouncementInput,
} from "@/lib/validators/announcements";
import { ImageMediaField } from "@/components/admin/ImageMediaField";
import { ArrowLeft, Trash2 } from "lucide-react";
import { z } from "zod";

const announcementSearchSchema = z.object({
  type: z.enum(["News", "Event", "Notice"]).optional(),
});

export const Route = createFileRoute("/admin/announcements/$id")({
  validateSearch: (search: Record<string, unknown>) =>
    announcementSearchSchema.parse({
      type:
        search.type === "News" ||
        search.type === "Event" ||
        search.type === "Notice"
          ? search.type
          : undefined,
    }),
  component: AnnouncementEditor,
});

const defaultValues: AnnouncementInput = {
  title: "",
  slug: "",
  type: "News",
  body: "",
  cover_image: undefined,
  event_date: undefined,
  event_location: undefined,
  registration_enabled: false,
  registration_capacity: undefined,
  registration_deadline: undefined,
  registration_note: undefined,
  registration_auto_confirm: true,
  is_pinned: false,
  is_published: false,
};

function AnnouncementEditor() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [slugTouched, setSlugTouched] = useState(false);
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);

  const [existing, setExisting] = useState<Awaited<
    ReturnType<typeof getAnnouncementById>
  > | null>(null);
  const [loading, setLoading] = useState(!isNew);

  const formDefaults: AnnouncementInput = {
    ...defaultValues,
    type: isNew && search.type ? search.type : defaultValues.type,
  };

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    getAnnouncementById({ data: id })
      .then((row) => {
        if (!row) throw notFound();
        setExisting(row);
      })
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const form = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementInputSchema),
    defaultValues: formDefaults,
    values: existing
      ? {
          title: existing.title,
          slug: existing.slug,
          type: existing.type,
          body: existing.body ?? "",
          cover_image: existing.cover_image ?? undefined,
          event_date: existing.event_date ?? undefined,
          event_location: existing.event_location ?? undefined,
          registration_enabled: existing.registration_enabled,
          registration_capacity: existing.registration_capacity ?? undefined,
          registration_deadline: existing.registration_deadline ?? undefined,
          registration_note: existing.registration_note ?? undefined,
          registration_auto_confirm: existing.registration_auto_confirm,
          is_pinned: existing.is_pinned,
          is_published: existing.is_published,
        }
      : undefined,
  });

  const title = form.watch("title");
  const slug = form.watch("slug");
  const type = form.watch("type");
  const body = form.watch("body") ?? "";
  const cover = form.watch("cover_image");
  const pinned = form.watch("is_pinned");
  const published = form.watch("is_published");
  const registrationEnabled = form.watch("registration_enabled");

  useEffect(() => {
    if (!slugTouched && title && isNew) {
      form.setValue("slug", generateSlug(title));
    }
  }, [title, slugTouched, isNew, form]);

  async function save(publish: boolean) {
    const values = form.getValues();
    const payload: AnnouncementInput = { ...values, is_published: publish };
    try {
      if (isNew) {
        const created = await createAnnouncement({ data: payload });
        if (created.is_pinned) {
          await pinAnnouncement({ data: created.id });
        }
        toast.success(publish ? "Published" : "Draft saved");
        await navigate({
          to: "/admin/announcements/$id",
          params: { id: created.id },
          replace: true,
        });
      } else {
        const updated = await updateAnnouncement({
          data: { id, data: payload },
        });
        if (payload.is_pinned) await pinAnnouncement({ data: id });
        else await unpinAnnouncement({ data: id });
        toast.success(publish ? "Published" : "Saved");
        setExisting(updated);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  }

  async function onDelete() {
    if (isNew) return;
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement({ data: id });
      toast.success("Deleted");
      await navigate({ to: "/admin/announcements" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Announcement" breadcrumb="Announcements">
        <p className="text-sm text-ink-muted">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "New Announcement" : "Edit Announcement"}
      breadcrumb={`Announcements › ${title || "New"}`}
      action={
        <Link
          to="/admin/announcements"
          className="text-sm text-ink-muted inline-flex items-center gap-1 hover:text-brand"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <AdminCard className="p-6 space-y-5">
          <Field label="Title">
            <Input
              {...form.register("title")}
              className="text-lg"
              placeholder="Eid al-Fitr Celebrations 2026"
            />
          </Field>
          <Field label="Slug">
            <Input
              {...form.register("slug", {
                onChange: () => setSlugTouched(true),
              })}
              className="font-mono text-xs"
              placeholder="eid-al-fitr-celebrations-2026"
            />
          </Field>
          <Field label="Type">
            <Select {...form.register("type")}>
              <option value="News">News</option>
              <option value="Event">Event</option>
              <option value="Notice">Notice</option>
            </Select>
          </Field>
          {type === "Event" && (
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Event Date">
                <Input type="date" {...form.register("event_date")} />
              </Field>
              <Field label="Event Location">
                <Input
                  placeholder="Grand Jami Mosque, Jugol"
                  {...form.register("event_location")}
                />
              </Field>
            </div>
          )}
          {type === "Event" && (
            <AdminCard className="p-5 space-y-4 border border-brand/20 bg-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">Registration</div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Allow visitors to register and receive a ticket.
                  </p>
                </div>
                <Toggle
                  checked={registrationEnabled}
                  onChange={(v) =>
                    form.setValue("registration_enabled", v, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
              {registrationEnabled && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Capacity (optional)">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Unlimited"
                        {...form.register("registration_capacity", {
                          setValueAs: (v) =>
                            v === "" || v == null ? undefined : Number(v),
                        })}
                      />
                    </Field>
                    <Field label="Registration deadline">
                      <Input
                        type="date"
                        {...form.register("registration_deadline")}
                      />
                    </Field>
                  </div>
                  <Field label="Registration note (shown to visitors)">
                    <Input
                      placeholder="Free entry — bring a photo ID"
                      {...form.register("registration_note")}
                    />
                  </Field>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-confirm when spots available</span>
                    <Toggle
                      checked={form.watch("registration_auto_confirm")}
                      onChange={(v) =>
                        form.setValue("registration_auto_confirm", v, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                  {existing?.registration && (
                    <p className="text-xs text-ink-muted">
                      {existing.registration.registered_count} registered
                      {existing.registration.registration_capacity != null
                        ? ` · ${existing.registration.spots_remaining ?? 0} spots left`
                        : ""}
                      {!isNew && (
                        <>
                          {" · "}
                          <Link
                            to="/admin/event-registrations"
                            search={{ denied: false }}
                            className="text-brand font-semibold hover:underline"
                          >
                            View attendees
                          </Link>
                        </>
                      )}
                    </p>
                  )}
                </>
              )}
            </AdminCard>
          )}
          <Field label="Body">
            <RichTextEditor
              value={body}
              onChange={(html) =>
                form.setValue("body", html, { shouldDirty: true })
              }
              placeholder="Write the announcement…"
            />
          </Field>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard className="p-5">
            <Field label="Cover Image">
              <ImageMediaField
                label="Cover image"
                module="announcements"
                value={cover}
                onChange={(url) =>
                  form.setValue("cover_image", url, { shouldDirty: true })
                }
                mediaAssetId={mediaAssetId}
                onMediaAssetIdChange={setMediaAssetId}
              />
            </Field>
          </AdminCard>

          <AdminCard className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pinned</span>
              <Toggle
                checked={pinned}
                onChange={(v) =>
                  form.setValue("is_pinned", v, { shouldDirty: true })
                }
              />
            </div>
            {pinned && (
              <p className="text-xs text-amber-700">
                Only one announcement can be pinned. Pinning will unpin the
                current pinned post.
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Published</span>
              <Toggle
                checked={published}
                onChange={(v) =>
                  form.setValue("is_published", v, { shouldDirty: true })
                }
              />
            </div>
          </AdminCard>

          {!isNew && (
            <AdminCard className="p-5">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => void onDelete()}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </AdminCard>
          )}
        </div>
      </div>

      <div className="mt-6 -mx-8 px-8 py-4 bg-white border-t border-border flex items-center justify-end gap-2 sticky bottom-0">
        <Button variant="outline" onClick={() => void save(false)}>
          Save Draft
        </Button>
        <Button onClick={() => void save(true)}>Publish</Button>
      </div>
    </AdminLayout>
  );
}
