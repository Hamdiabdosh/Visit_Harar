import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
  Textarea,
  Select,
  SectionLabel,
  Toggle,
} from "@/components/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ATTRACTION_CATEGORIES } from "@/lib/attraction-styles";
import { generateSlug } from "@/lib/slug";
import {
  createAttraction,
  getAttractionById,
  updateAttraction,
} from "@/lib/attractions-fns";
import { ImageMediaField } from "@/components/admin/ImageMediaField";
import { LocationPickerFields } from "@/components/admin/LocationPickerFields";
import {
  attractionInputSchema,
  type AttractionInput,
} from "@/lib/validators/attractions";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/attractions/$id")({
  component: AttractionEditor,
});

const defaultValues: AttractionInput = {
  title: "",
  slug: "",
  short_desc: "",
  full_desc: "",
  image: undefined,
  category: "Heritage",
  is_featured: false,
  is_published: false,
  sort_order: 0,
  latitude: undefined,
  longitude: undefined,
  opening_hours: "",
  best_time_to_visit: "",
  visitor_tips: "",
  audio_url: "",
};

function AttractionEditor() {
  const { id } = useParams({ from: "/admin/attractions/$id" });
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin", "attraction", id],
    queryFn: () => getAttractionById({ data: id }),
    enabled: !isNew,
    retry: false,
  });

  const form = useForm<AttractionInput>({
    resolver: zodResolver(attractionInputSchema),
    defaultValues,
    values: existing
      ? {
          title: existing.title,
          slug: existing.slug,
          short_desc: existing.short_desc ?? "",
          full_desc: existing.full_desc ?? "",
          image: existing.image ?? undefined,
          category: existing.category as AttractionInput["category"],
          is_featured: existing.is_featured,
          is_published: existing.is_published,
          sort_order: existing.sort_order,
          latitude: existing.latitude ?? undefined,
          longitude: existing.longitude ?? undefined,
          opening_hours: existing.opening_hours ?? "",
          best_time_to_visit: existing.best_time_to_visit ?? "",
          visitor_tips: existing.visitor_tips ?? "",
          audio_url: existing.audio_url ?? "",
        }
      : undefined,
  });

  const title = form.watch("title");
  const slug = form.watch("slug");
  const shortDesc = form.watch("short_desc");
  const fullDesc = form.watch("full_desc");
  const image = form.watch("image");
  const featured = form.watch("is_featured");
  const published = form.watch("is_published");
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  useEffect(() => {
    if (!slugTouched && title && isNew) {
      form.setValue("slug", generateSlug(title));
    }
  }, [title, slugTouched, isNew, form]);

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const values = form.getValues();
      const payload: AttractionInput = { ...values, is_published: publish };
      if (isNew) {
        const created = await createAttraction({ data: payload });
        return created;
      }
      return updateAttraction({ data: { id, data: payload } });
    },
    onSuccess: (result, publish) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attractions"] });
      queryClient.invalidateQueries({ queryKey: ["public", "attractions"] });
      toast.success(publish ? "Published" : "Draft saved");
      if (isNew && result?.id) {
        navigate({
          to: "/admin/attractions/$id",
          params: { id: result.id },
          replace: true,
        });
      }
    },
    onError: (err: Error) =>
      toast.error("Failed to save", { description: err.message }),
  });

  if (!isNew && isLoading) {
    return (
      <AdminLayout title="Edit Attraction" breadcrumb="Attractions">
        <p className="text-sm text-ink-muted">Loading…</p>
      </AdminLayout>
    );
  }

  if (!isNew && !isLoading && !existing) {
    return (
      <AdminLayout title="Not found" breadcrumb="Attractions">
        <AdminCard className="p-6">
          <p className="text-sm text-ink-muted">Attraction not found.</p>
          <Link
            to="/admin/attractions"
            className="text-brand text-sm mt-3 inline-block"
          >
            Back to list
          </Link>
        </AdminCard>
      </AdminLayout>
    );
  }

  const previewSlug = slug || generateSlug(title) || "new-attraction";

  return (
    <AdminLayout
      title={isNew ? "New Attraction" : "Edit Attraction"}
      breadcrumb={`Attractions › ${title || "New"}`}
      action={
        <Link
          to="/admin/attractions"
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
              placeholder="Harar Jugol Walled City"
            />
          </Field>
          <Field label="Slug">
            <Input
              {...form.register("slug", {
                onChange: () => setSlugTouched(true),
              })}
              className="font-mono text-xs"
              placeholder="harar-jugol"
            />
          </Field>
          <Field label="Short Description" hint="160 characters">
            <Textarea
              rows={3}
              maxLength={160}
              {...form.register("short_desc")}
              placeholder="One-line summary for cards and SEO"
            />
          </Field>
          <Field
            label="Full Description"
            hint="Rich text rendered publicly as HTML"
          >
            <RichTextEditor
              value={fullDesc ?? ""}
              onChange={(html) =>
                form.setValue("full_desc", html, { shouldDirty: true })
              }
              placeholder="Write the full story…"
            />
          </Field>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard className="p-5">
            <SectionLabel>Media</SectionLabel>
            <ImageMediaField
              label="Image"
              module="attractions"
              value={image}
              onChange={(url) =>
                form.setValue("image", url, { shouldDirty: true })
              }
              mediaAssetId={mediaAssetId}
              onMediaAssetIdChange={setMediaAssetId}
            />
          </AdminCard>

          <AdminCard className="p-5">
            <SectionLabel>Category</SectionLabel>
            <Select {...form.register("category")}>
              {ATTRACTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </AdminCard>

          <AdminCard className="p-5">
            <SectionLabel>Visibility</SectionLabel>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Featured</span>
                <Toggle
                  checked={featured}
                  onChange={(v) =>
                    form.setValue("is_featured", v, { shouldDirty: true })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Published</span>
                <Toggle
                  checked={published}
                  onChange={(v) =>
                    form.setValue("is_published", v, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <SectionLabel>Location</SectionLabel>
            <LocationPickerFields
              latitude={latitude}
              longitude={longitude}
              addressQuery={[title, form.watch("short_desc")].filter(Boolean).join(", ")}
              hint="Required when publishing. Search an address or click the map."
              latError={form.formState.errors.latitude?.message}
              lngError={form.formState.errors.longitude?.message}
              onPick={(lat, lng) => {
                form.setValue("latitude", lat, { shouldDirty: true });
                form.setValue("longitude", lng, { shouldDirty: true });
              }}
            />
          </AdminCard>

          <AdminCard className="p-5">
            <SectionLabel>Visitor info</SectionLabel>
            <div className="space-y-4 mt-3">
              <Field label="Opening hours">
                <Input
                  {...form.register("opening_hours")}
                  placeholder="Daily 8am–6pm"
                />
              </Field>
              <Field label="Best time to visit">
                <Input
                  {...form.register("best_time_to_visit")}
                  placeholder="Early morning"
                />
              </Field>
              <Field label="Visitor tips">
                <Textarea rows={3} {...form.register("visitor_tips")} />
              </Field>
              <Field label="Audio guide URL">
                <Input
                  {...form.register("audio_url")}
                  placeholder="https://…/audio.mp3"
                />
              </Field>
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <SectionLabel>SEO Preview</SectionLabel>
            <div className="rounded border border-border overflow-hidden">
              <div className="h-6 bg-surface border-b border-border flex items-center gap-1.5 px-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="p-3">
                <div className="text-blue-700 text-sm font-medium truncate">
                  {title || "New Attraction"} — Visit Harar
                </div>
                <div className="text-emerald-700 text-[11px]">
                  visitharar.gov.et/attractions/{previewSlug}
                </div>
                <div className="text-xs text-ink-muted mt-1 line-clamp-2">
                  {shortDesc}
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      <div className="mt-6 -mx-8 px-8 py-4 bg-white border-t border-border flex items-center justify-between sticky bottom-0">
        <Link
          to="/admin/attractions"
          className="text-sm text-ink-muted inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={form.handleSubmit(() => saveMutation.mutate(false))}
          >
            Save Draft
          </Button>
          <Button
            disabled={saveMutation.isPending}
            onClick={form.handleSubmit(() => saveMutation.mutate(true))}
          >
            Publish
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
