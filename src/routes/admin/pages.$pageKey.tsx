import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout, AdminCard, Button } from "@/components/AdminLayout";
import {
  getPage,
  publishPage,
  unpublishPage,
  upsertPageContent,
  type PageKey,
} from "@/lib/pages-fns";
import { AboutEditor } from "@/components/admin/editors/AboutEditor";
import { CultureEditor } from "@/components/admin/editors/CultureEditor";
import { PlanEditor } from "@/components/admin/editors/PlanEditor";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/pages/$pageKey")({
  loader: async ({ params }) => {
    const key = params.pageKey as PageKey;
    const page = await getPage({ data: key });
    if (!page) throw notFound();
    return { key, page };
  },
  component: PageEditorShell,
});

function PageEditorShell() {
  const { key, page } = Route.useLoaderData();
  const queryClient = useQueryClient();

  const upsert = useMutation({
    mutationFn: (payload: {
      hero_image: string | null;
      content: unknown;
      publish?: boolean;
    }) =>
      upsertPageContent({
        data: {
          page_key: key,
          hero_image: payload.hero_image,
          content: payload.content,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "page", key] }),
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  const publish = useMutation({
    mutationFn: () => publishPage({ data: key }),
    onSuccess: () => {
      toast.success("Published");
      queryClient.invalidateQueries({ queryKey: ["admin", "page", key] });
    },
    onError: () => toast.error("Failed to publish"),
  });

  const unpublish = useMutation({
    mutationFn: () => unpublishPage({ data: key }),
    onSuccess: () => {
      toast.success("Unpublished");
      queryClient.invalidateQueries({ queryKey: ["admin", "page", key] });
    },
    onError: () => toast.error("Failed to unpublish"),
  });

  const { data: fresh } = useQuery({
    queryKey: ["admin", "page", key],
    queryFn: () => getPage({ data: key }),
    initialData: page,
  });

  if (!fresh) return null;

  const editorProps = {
    heroImage: fresh.hero_image,
    content: fresh.content,
    onChange: (next: { heroImage: string | null; content: unknown }) => {
      upsert.mutate({ hero_image: next.heroImage, content: next.content });
      toast.success("Draft saved");
    },
  };

  return (
    <AdminLayout
      title={fresh.title}
      breadcrumb={`Pages › ${fresh.title}`}
      action={
        <Link
          to="/admin/pages/"
          className="text-sm text-ink-muted inline-flex items-center gap-1 hover:text-brand"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      }
    >
      <AdminCard className="p-5 mb-6 flex items-center justify-between">
        <div className="text-sm text-ink-muted">
          Last updated{" "}
          <span className="text-ink font-medium">
            {new Date(fresh.updated_at).toLocaleString()}
          </span>
          {fresh.updated_by_name ? (
            <>
              {" "}
              by{" "}
              <span className="text-ink font-medium">
                {fresh.updated_by_name}
              </span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              void upsert.mutate({
                hero_image: fresh.hero_image,
                content: fresh.content,
              })
            }
            disabled={upsert.isPending}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => void publish.mutate()}
            disabled={publish.isPending}
          >
            Publish
          </Button>
          <Button
            variant="outline"
            onClick={() => void unpublish.mutate()}
            disabled={unpublish.isPending}
          >
            Unpublish
          </Button>
        </div>
      </AdminCard>

      {key === "about" ? (
        <AboutEditor {...editorProps} />
      ) : key === "culture" ? (
        <CultureEditor {...editorProps} />
      ) : key === "plan" ? (
        <PlanEditor {...editorProps} />
      ) : (
        <AdminCard className="p-6">
          <p className="text-sm text-ink-muted">Unknown page.</p>
        </AdminCard>
      )}
    </AdminLayout>
  );
}
