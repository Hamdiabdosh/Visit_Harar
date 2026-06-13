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
import { ImageMediaField } from "@/components/admin/ImageMediaField";
import {
  createPartner,
  getPartnerById,
  updatePartner,
} from "@/lib/partners-fns";
import { generateSlug } from "@/lib/slug";
import {
  partnerInputSchema,
  PARTNER_CATEGORIES,
  type PartnerInput,
} from "@/lib/validators/partners";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/partners/$id")({
  component: PartnerEditor,
});

const defaultValues: PartnerInput = {
  name: "",
  slug: "",
  category: "Hotel",
  description: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  is_featured: false,
  is_published: false,
  sort_order: 0,
};

function PartnerEditor() {
  const { id } = useParams({ from: "/admin/partners/$id" });
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin", "partner", id],
    queryFn: () => getPartnerById({ data: id }),
    enabled: !isNew,
    retry: false,
  });

  const form = useForm<PartnerInput>({
    resolver: zodResolver(partnerInputSchema),
    defaultValues,
    values: existing
      ? {
          name: existing.name,
          slug: existing.slug,
          category: existing.category,
          description: existing.description ?? "",
          address: existing.address ?? "",
          phone: existing.phone ?? "",
          email: existing.email ?? "",
          website: existing.website ?? "",
          image: existing.image ?? undefined,
          is_featured: existing.is_featured,
          is_published: existing.is_published,
          sort_order: existing.sort_order,
        }
      : undefined,
  });

  const name = form.watch("name");
  const image = form.watch("image");
  const featured = form.watch("is_featured");
  const published = form.watch("is_published");

  useEffect(() => {
    if (!slugTouched && name && isNew) {
      form.setValue("slug", generateSlug(name));
    }
  }, [name, slugTouched, isNew, form]);

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const values = form.getValues();
      const payload: PartnerInput = { ...values, is_published: publish };
      if (isNew) return createPartner({ data: payload });
      return updatePartner({ data: { id, data: payload } });
    },
    onSuccess: (result, publish) => {
      toast.success(publish ? "Published" : "Draft saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "partners"] });
      if (isNew && result?.id) {
        navigate({
          to: "/admin/partners/$id",
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
      <AdminLayout title="Edit Partner" breadcrumb="Partners">
        <p className="text-sm text-ink-muted">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "New Partner" : "Edit Partner"}
      breadcrumb={`Partners › ${name || "New"}`}
      action={
        <Link
          to="/admin/partners"
          className="text-sm text-ink-muted inline-flex items-center gap-1 hover:text-brand"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <AdminCard className="p-6 space-y-5">
          <Field label="Name">
            <Input {...form.register("name")} placeholder="Ras Hotel" />
          </Field>
          <Field label="Slug">
            <Input
              {...form.register("slug", {
                onChange: () => setSlugTouched(true),
              })}
              className="font-mono text-xs"
            />
          </Field>
          <Field label="Description">
            <Textarea rows={4} {...form.register("description")} />
          </Field>
          <Field label="Address">
            <Input {...form.register("address")} />
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Phone">
              <Input {...form.register("phone")} />
            </Field>
            <Field label="Email">
              <Input type="email" {...form.register("email")} />
            </Field>
          </div>
          <Field label="Website">
            <Input {...form.register("website")} placeholder="https://…" />
          </Field>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard className="p-5">
            <SectionLabel>Category</SectionLabel>
            <Select {...form.register("category")}>
              {PARTNER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </AdminCard>

          <AdminCard className="p-5">
            <SectionLabel>Image</SectionLabel>
            <ImageMediaField
              label="Photo"
              module="partners"
              value={image}
              onChange={(url) =>
                form.setValue("image", url, { shouldDirty: true })
              }
              mediaAssetId={mediaAssetId}
              onMediaAssetIdChange={setMediaAssetId}
            />
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
        </div>
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
