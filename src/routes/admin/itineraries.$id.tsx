import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
  Textarea,
  SectionLabel,
  Toggle,
} from "@/components/AdminLayout";
import {
  createItinerary,
  getItineraryById,
  updateItinerary,
} from "@/lib/itineraries-fns";
import { generateSlug } from "@/lib/slug";
import {
  itineraryInputSchema,
  type ItineraryInput,
} from "@/lib/validators/itineraries";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/itineraries/$id")({
  component: ItineraryEditor,
});

const defaultValues: ItineraryInput = {
  title: "",
  slug: "",
  duration: "",
  summary: "",
  days: [{ label: "Day 1", items: [{ title: "", description: "" }] }],
  is_published: false,
  sort_order: 0,
};

function ItineraryEditor() {
  const { id } = useParams({ from: "/admin/itineraries/$id" });
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin", "itinerary", id],
    queryFn: () => getItineraryById({ data: id }),
    enabled: !isNew,
    retry: false,
  });

  const form = useForm<ItineraryInput>({
    resolver: zodResolver(itineraryInputSchema),
    defaultValues,
    values: existing
      ? {
          title: existing.title,
          slug: existing.slug,
          duration: existing.duration,
          summary: existing.summary ?? "",
          days: existing.days.length
            ? existing.days
            : [{ label: "Day 1", items: [{ title: "" }] }],
          is_published: existing.is_published,
          sort_order: existing.sort_order,
        }
      : undefined,
  });

  const { fields: dayFields, append: appendDay, remove: removeDay } =
    useFieldArray({ control: form.control, name: "days" });

  const title = form.watch("title");
  const published = form.watch("is_published");

  useEffect(() => {
    if (!slugTouched && title && isNew) {
      form.setValue("slug", generateSlug(title));
    }
  }, [title, slugTouched, isNew, form]);

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const values = form.getValues();
      const payload: ItineraryInput = { ...values, is_published: publish };
      if (isNew) return createItinerary({ data: payload });
      return updateItinerary({ data: { id, data: payload } });
    },
    onSuccess: (result, publish) => {
      toast.success(publish ? "Published" : "Draft saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "itineraries"] });
      if (isNew && result?.id) {
        navigate({
          to: "/admin/itineraries/$id",
          params: { id: result.id },
          search: { denied: false },
          replace: true,
        });
      }
    },
    onError: () => toast.error("Failed to save"),
  });

  if (!isNew && isLoading) {
    return (
      <AdminLayout title="Edit Itinerary" breadcrumb="Itineraries">
        <p className="text-sm text-ink-muted">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "New Itinerary" : "Edit Itinerary"}
      breadcrumb={`Itineraries › ${title || "New"}`}
      action={
        <Link
          to="/admin/itineraries"
          className="text-sm text-ink-muted inline-flex items-center gap-1 hover:text-brand"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <AdminCard className="p-6 space-y-5">
            <Field label="Title">
              <Input {...form.register("title")} placeholder="Weekend in Harar" />
            </Field>
            <Field label="Slug">
              <Input
                {...form.register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
                className="font-mono text-xs"
              />
            </Field>
            <Field label="Duration">
              <Input
                {...form.register("duration")}
                placeholder="2 Days / 1 Night"
              />
            </Field>
            <Field label="Summary">
              <Textarea rows={3} {...form.register("summary")} />
            </Field>
          </AdminCard>

          <AdminCard className="p-6 space-y-6">
            <SectionLabel>Day-by-day plan</SectionLabel>
            {dayFields.map((day, dayIndex) => (
              <div
                key={day.id}
                className="rounded border border-border p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    {...form.register(`days.${dayIndex}.label`)}
                    placeholder="Day 1"
                    className="flex-1"
                  />
                  {dayFields.length > 1 ? (
                    <button
                      type="button"
                      className="p-2 text-red-600"
                      onClick={() => removeDay(dayIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
                <DayItemsEditor form={form} dayIndex={dayIndex} />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendDay({
                  label: `Day ${dayFields.length + 1}`,
                  items: [{ title: "" }],
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" /> Add day
            </Button>
          </AdminCard>
        </div>

        <AdminCard className="p-5 h-fit">
          <SectionLabel>Visibility</SectionLabel>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm">Published</span>
            <Toggle
              checked={published}
              onChange={(v) =>
                form.setValue("is_published", v, { shouldDirty: true })
              }
            />
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 flex justify-end gap-2">
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
    </AdminLayout>
  );
}

function DayItemsEditor({
  form,
  dayIndex,
}: {
  form: ReturnType<typeof useForm<ItineraryInput>>;
  dayIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `days.${dayIndex}.items`,
  });

  return (
    <div className="space-y-2 pl-2 border-l-2 border-gold/40">
      {fields.map((item, itemIndex) => (
        <div key={item.id} className="space-y-1">
          <div className="flex gap-2">
            <Input
              {...form.register(
                `days.${dayIndex}.items.${itemIndex}.title`,
              )}
              placeholder="Activity title"
              className="flex-1"
            />
            {fields.length > 1 ? (
              <button
                type="button"
                className="p-2 text-ink-muted hover:text-red-600"
                onClick={() => remove(itemIndex)}
              >
                ×
              </button>
            ) : null}
          </div>
          <Input
            {...form.register(
              `days.${dayIndex}.items.${itemIndex}.description`,
            )}
            placeholder="Optional description"
            className="text-sm"
          />
          <Input
            {...form.register(
              `days.${dayIndex}.items.${itemIndex}.attraction_slug`,
            )}
            placeholder="Attraction slug (optional)"
            className="text-xs font-mono"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="text-xs"
        onClick={() => append({ title: "" })}
      >
        Add activity
      </Button>
    </div>
  );
}
