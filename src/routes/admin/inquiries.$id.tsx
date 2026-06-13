import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import { getInquiryById, markInquiryRead } from "@/lib/inquiry-fns";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/inquiries/$id")({
  component: InquiryDetail,
});

function InquiryDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: inquiry, isLoading, isError } = useQuery({
    queryKey: ["admin", "inquiries", id],
    queryFn: () => getInquiryById({ data: id }),
  });

  const markRead = useMutation({
    mutationFn: (is_read: boolean) =>
      markInquiryRead({ data: { id, is_read } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "inquiries", "unread-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
    },
    onError: () => toast.error("Failed to update inquiry"),
  });

  useEffect(() => {
    if (inquiry && !inquiry.is_read) {
      markRead.mutate(true);
    }
    // Mark read once when opening unread inquiry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiry?.id, inquiry?.is_read]);

  if (isLoading) {
    return (
      <AdminLayout title="Inquiry" breadcrumb="Loading…">
        <p className="text-sm text-ink-muted">Loading…</p>
      </AdminLayout>
    );
  }

  if (isError || !inquiry) {
    return (
      <AdminLayout title="Inquiry" breadcrumb="Not found">
        <AdminCard className="p-6">
          <p className="text-sm text-ink-muted mb-4">Inquiry not found.</p>
          <Link
            to="/admin/inquiries"
            className="text-sm text-brand hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to inquiries
          </Link>
        </AdminCard>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Inquiry"
      breadcrumb={inquiry.subject}
      action={
        <button
          type="button"
          onClick={() => markRead.mutate(!inquiry.is_read)}
          className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-surface"
        >
          {inquiry.is_read ? "Mark as unread" : "Mark as read"}
        </button>
      }
    >
      <Link
        to="/admin/inquiries"
        className="inline-flex items-center gap-1 text-sm text-brand hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> All inquiries
      </Link>

      <AdminCard className="p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
              From
            </div>
            <div className="font-medium">{inquiry.name}</div>
            <a
              href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}`}
              className="text-brand hover:underline"
            >
              {inquiry.email}
            </a>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
              Received
            </div>
            <div>{new Date(inquiry.created_at).toLocaleString()}</div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">
            Subject
          </div>
          <div className="font-serif text-xl font-bold">{inquiry.subject}</div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">
            Message
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-sm whitespace-pre-wrap leading-relaxed">
            {inquiry.message}
          </div>
        </div>

        <div className="pt-2">
          <a
            href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}&body=${encodeURIComponent(`Hi ${inquiry.name},\n\n`)}`}
            className="inline-flex px-4 py-2 rounded-md bg-brand text-white text-sm font-semibold hover:bg-brand-dark"
          >
            Reply via email
          </a>
        </div>
      </AdminCard>
    </AdminLayout>
  );
}
