import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
  Textarea,
  SectionLabel,
} from "@/components/AdminLayout";
import { HeroSection } from "@/components/public/HeroSection";
import { defaultHeroInput, type HeroDto } from "@/lib/hero-map";
import { getHero, publishHero, upsertHero } from "@/lib/hero-fns";
import { ImageMediaField } from "@/components/admin/ImageMediaField";
import { heroInputSchema, type HeroInput } from "@/lib/validators/hero";

export const Route = createFileRoute("/admin/hero")({
  component: HeroManager,
});

function heroDtoToForm(dto: HeroDto | null): HeroInput {
  if (!dto) return { ...defaultHeroInput };
  return {
    badge_text: dto.badge_text ?? "",
    headline: dto.headline ?? "",
    headline_italic: dto.headline_italic ?? "",
    subheading: dto.subheading ?? "",
    cta_primary_text: dto.cta_primary_text ?? "",
    cta_primary_url: dto.cta_primary_url ?? "",
    cta_ghost_text: dto.cta_ghost_text ?? "",
    cta_ghost_url: dto.cta_ghost_url ?? "",
    background_image: dto.background_image ?? undefined,
    stat_1_number: dto.stat_1_number ?? "",
    stat_1_label: dto.stat_1_label ?? "",
    stat_2_number: dto.stat_2_number ?? "",
    stat_2_label: dto.stat_2_label ?? "",
    stat_3_number: dto.stat_3_number ?? "",
    stat_3_label: dto.stat_3_label ?? "",
    is_published: dto.is_published,
  };
}

function HeroManager() {
  const queryClient = useQueryClient();
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);

  const {
    data: hero,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "hero"],
    queryFn: () => getHero(),
    retry: false,
  });

  const form = useForm<HeroInput>({
    resolver: zodResolver(heroInputSchema),
    defaultValues: defaultHeroInput,
    values: heroDtoToForm(hero ?? null),
  });

  const watchAll = form.watch();

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const values = form.getValues();
      const payload: HeroInput = {
        ...values,
        is_published: publish,
      };
      await upsertHero({ data: payload });
      if (publish) await publishHero();
    },
    onSuccess: (_, publish) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hero"] });
      queryClient.invalidateQueries({ queryKey: ["public", "hero"] });
      toast.success(publish ? "Hero published" : "Draft saved");
    },
    onError: () => {
      toast.error("Failed to save hero");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const values = form.getValues();
      await upsertHero({ data: { ...values, is_published: true } });
      await publishHero();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hero"] });
      queryClient.invalidateQueries({ queryKey: ["public", "hero"] });
      toast.success("Hero published");
    },
    onError: () => toast.error("Failed to publish"),
  });

  const updatedLabel = hero?.updated_at
    ? `Last updated${hero.updated_by_name ? ` by ${hero.updated_by_name}` : ""} · ${formatRelative(hero.updated_at)}`
    : "Not saved yet";

  return (
    <AdminLayout
      title="Hero Manager"
      breadcrumb="Content · Homepage Hero"
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={saveMutation.isPending || publishMutation.isPending}
            onClick={() => saveMutation.mutate(false)}
          >
            Save Draft
          </Button>
          <Button
            disabled={saveMutation.isPending || publishMutation.isPending}
            onClick={() => publishMutation.mutate()}
          >
            Publish
          </Button>
        </div>
      }
    >
      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <h2 className="font-semibold text-amber-900">
            Database not available
          </h2>
          <p className="text-sm text-amber-800 mt-2">
            {error instanceof Error
              ? error.message
              : "Could not load hero content."}
          </p>
          <p className="text-sm text-amber-800 mt-3 font-mono">
            docker compose -f docker-compose.dev.yml up -d && bun run db:push && bun run db:seed
          </p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading hero…</p>
      ) : (
        <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
          <AdminCard className="p-6 space-y-6">
            <div>
              <SectionLabel>Hero Content</SectionLabel>
              <div className="space-y-4">
                <Field label="Badge Text">
                  <Input {...form.register("badge_text")} />
                </Field>
                <Field label="Headline">
                  <Input {...form.register("headline")} />
                </Field>
                <Field label="Italic Accent (use line breaks)">
                  <Textarea rows={2} {...form.register("headline_italic")} />
                </Field>
                <Field label="Subheading">
                  <Textarea rows={3} {...form.register("subheading")} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Primary CTA Text">
                    <Input {...form.register("cta_primary_text")} />
                  </Field>
                  <Field label="Primary CTA URL">
                    <Input {...form.register("cta_primary_url")} />
                  </Field>
                  <Field label="Ghost CTA Text">
                    <Input {...form.register("cta_ghost_text")} />
                  </Field>
                  <Field label="Ghost CTA URL">
                    <Input {...form.register("cta_ghost_url")} />
                  </Field>
                </div>
                <Field label="Background Image">
                  <ImageMediaField
                    label="Background image"
                    module="hero"
                    value={watchAll.background_image}
                    onChange={(url) =>
                      form.setValue("background_image", url, {
                        shouldDirty: true,
                      })
                    }
                    mediaAssetId={mediaAssetId}
                    onMediaAssetIdChange={setMediaAssetId}
                  />
                </Field>
              </div>
            </div>

            <div>
              <SectionLabel>Stats</SectionLabel>
              {(
                [
                  ["stat_1_number", "stat_1_label"],
                  ["stat_2_number", "stat_2_label"],
                  ["stat_3_number", "stat_3_label"],
                ] as const
              ).map(([n, l]) => (
                <div key={n} className="grid grid-cols-2 gap-2 mb-2">
                  <Input {...form.register(n)} />
                  <Input {...form.register(l)} />
                </div>
              ))}
            </div>

            <div>
              <SectionLabel>Status</SectionLabel>
              <p className="text-sm">
                {hero?.is_published ? (
                  <span className="text-emerald-700 font-medium">
                    Published on live site
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    Draft — not visible publicly
                  </span>
                )}
              </p>
            </div>

            <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-white border-t border-border flex items-center justify-between rounded-b-lg">
              <span className="text-xs text-ink-muted">{updatedLabel}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate(false)}
                >
                  Save Draft
                </Button>
                <Button
                  disabled={publishMutation.isPending}
                  onClick={() => publishMutation.mutate()}
                >
                  Publish
                </Button>
              </div>
            </div>
          </AdminCard>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted mb-2 inline-flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-gold/20 text-amber-900">
                Live Preview
              </span>
            </div>
            <div className="border-2 border-dashed border-gold rounded-lg p-3 bg-white overflow-hidden">
              <HeroSection hero={watchAll} compact />
            </div>
            <p className="text-xs text-ink-muted mt-2 italic">
              Preview updates as you edit. Public site only shows published
              hero.
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function formatRelative(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return d.toLocaleDateString();
}
