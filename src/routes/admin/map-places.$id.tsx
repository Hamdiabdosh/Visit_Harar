import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
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
import { ClientOnly } from "@/components/admin/ClientOnly";
import { HararMap } from "@/components/map/HararMap";
import { ImageMediaField } from "@/components/admin/ImageMediaField";
import { getAttractions } from "@/lib/attractions-fns";
import {
  createMapPlace,
  getMapPlaceById,
  updateMapPlace,
} from "@/lib/map-places-fns";
import {
  HARAR_MAP_CENTER,
  MAP_PLACE_TYPES,
  mapPlaceTypeLabel,
} from "@/lib/map-place-styles";
import {
  mapPlaceInputSchema,
  type MapPlaceInput,
} from "@/lib/validators/map-places";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/map-places/$id")({
  component: MapPlaceEditor,
});

const defaultValues: MapPlaceInput = {
  title: "",
  place_type: "attraction",
  lat: HARAR_MAP_CENTER.lat,
  lng: HARAR_MAP_CENTER.lng,
  address: "",
  phone: "",
  website: "",
  short_desc: "",
  image: "",
  linked_attraction_id: null,
  is_featured: false,
  is_published: false,
  sort_order: 0,
};

function MapPlaceEditor() {
  const { id } = useParams({ from: "/admin/map-places/$id" });
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin", "map-place", id],
    queryFn: () => getMapPlaceById({ data: id }),
    enabled: !isNew,
    retry: false,
  });

  const { data: attractions = [] } = useQuery({
    queryKey: ["admin", "attractions"],
    queryFn: () => getAttractions(),
  });

  const form = useForm<MapPlaceInput>({
    resolver: zodResolver(mapPlaceInputSchema),
    defaultValues,
    values: existing
      ? {
          title: existing.title,
          place_type: existing.place_type,
          lat: existing.lat,
          lng: existing.lng,
          address: existing.address ?? "",
          phone: existing.phone ?? "",
          website: existing.website ?? "",
          short_desc: existing.short_desc ?? "",
          image: existing.image ?? "",
          linked_attraction_id: existing.linked_attraction_id,
          is_featured: existing.is_featured,
          is_published: existing.is_published,
          sort_order: existing.sort_order,
        }
      : undefined,
  });

  const lat = form.watch("lat");
  const lng = form.watch("lng");
  const image = form.watch("image");
  const featured = form.watch("is_featured");
  const published = form.watch("is_published");

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const values = form.getValues();
      const payload: MapPlaceInput = { ...values, is_published: publish };
      if (isNew) {
        return createMapPlace({ data: payload });
      }
      return updateMapPlace({ data: { id, data: payload } });
    },
    onSuccess: (result, publish) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "map-places"] });
      queryClient.invalidateQueries({ queryKey: ["public", "map-places"] });
      toast.success(publish ? "Published" : "Draft saved");
      if (isNew && result?.id) {
        navigate({
          to: "/admin/map-places/$id",
          params: { id: result.id },
          replace: true,
        });
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  if (!isNew && isLoading) {
    return (
      <AdminLayout title="Map Place" breadcrumb="Map">
        <Skeleton className="h-96 w-full rounded-lg" />
      </AdminLayout>
    );
  }

  const previewPlace = {
    id: "preview",
    title: form.watch("title") || "New place",
    place_type: form.watch("place_type"),
    lat,
    lng,
    address: form.watch("address") || null,
    phone: null,
    website: null,
    short_desc: null,
    image: null,
    linked_attraction_id: null,
    linked_attraction_slug: null,
    is_featured: featured,
    is_published: published,
    sort_order: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  return (
    <AdminLayout
      title={isNew ? "New Map Place" : form.watch("title") || "Edit Place"}
      breadcrumb="Map Places"
      action={
        <Link
          to="/admin/map-places"
          className="text-sm text-ink-muted inline-flex items-center gap-1 hover:text-brand"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <AdminCard className="p-6 space-y-4">
          <SectionLabel>Details</SectionLabel>
          <Field label="Title">
            <Input {...form.register("title")} placeholder="Harar Museum" />
          </Field>
          <Field label="Type">
            <Select {...form.register("place_type")}>
              {MAP_PLACE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {mapPlaceTypeLabel(t)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Short description">
            <Textarea
              rows={3}
              {...form.register("short_desc")}
              placeholder="Brief note for tourists…"
            />
          </Field>
          <Field label="Address">
            <Input {...form.register("address")} placeholder="Inside Jugol…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <Input {...form.register("phone")} />
            </Field>
            <Field label="Website">
              <Input {...form.register("website")} placeholder="https://…" />
            </Field>
          </div>
          <Field label="Link to attraction (optional)">
            <Select
              value={form.watch("linked_attraction_id") ?? ""}
              onChange={(e) =>
                form.setValue(
                  "linked_attraction_id",
                  e.target.value ? e.target.value : null,
                )
              }
            >
              <option value="">None</option>
              {attractions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </Select>
          </Field>
          <ImageMediaField
            label="Photo"
            module="map_places"
            value={image ?? undefined}
            onChange={(url) => form.setValue("image", url ?? "")}
            mediaAssetId={mediaAssetId}
            onMediaAssetIdChange={setMediaAssetId}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm">Featured on map</span>
            <Toggle
              checked={featured}
              onChange={(v) => form.setValue("is_featured", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <Input
                type="number"
                step="any"
                {...form.register("lat", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Longitude">
              <Input
                type="number"
                step="any"
                {...form.register("lng", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => void saveMutation.mutate(false)}
              disabled={saveMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => void saveMutation.mutate(true)}
              disabled={saveMutation.isPending}
            >
              Publish
            </Button>
          </div>
        </AdminCard>

        <AdminCard className="p-4">
          <SectionLabel>Pin location</SectionLabel>
          <p className="text-xs text-ink-muted mb-3">
            Click the map to set coordinates. Drag is disabled in pick mode.
          </p>
          <ClientOnly
            fallback={<Skeleton className="h-[420px] w-full rounded-lg" />}
          >
            <HararMap
              places={[previewPlace]}
              selectedId="preview"
              interactive
              pickMode
              pickedLocation={{ lat, lng }}
              onPick={(pickLat, pickLng) => {
                form.setValue("lat", Number(pickLat.toFixed(6)));
                form.setValue("lng", Number(pickLng.toFixed(6)));
              }}
              className="h-[420px] w-full rounded-lg overflow-hidden border border-border"
              initialZoom={16}
            />
          </ClientOnly>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
