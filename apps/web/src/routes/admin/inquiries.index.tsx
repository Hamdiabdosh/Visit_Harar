import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminLayout, AdminCard } from "@/components/AdminLayout";
import { getInquiries, markInquiryRead } from "@/lib/inquiry-fns";
import { Mail, MailOpen } from "lucide-react";

export const Route = createFileRoute("/admin/inquiries/")({
  component: InquiriesAdmin,
});

function InquiriesAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"All" | "Unread">("All");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "inquiries", tab],
    queryFn: () =>
      getInquiries({
        data: {
          unreadOnly: tab === "Unread",
          page: 1,
          perPage: 50,
        },
      }),
    refetchInterval: 60_000,
  });

  const items = data?.items ?? [];

  const markRead = useMutation({
    mutationFn: (args: { id: string; is_read: boolean }) =>
      markInquiryRead({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "inquiries", "unread-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
    },
    onError: () => toast.error("Failed to update inquiry"),
  });

  return (
    <AdminLayout
      title="Inquiries"
      breadcrumb="Contact form messages from visitors"
    >
      <AdminCard className="p-3 mb-6 flex gap-1">
        {(["All", "Unread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              tab === t ? "bg-brand text-white" : "hover:bg-surface"
            }`}
          >
            {t}
          </button>
        ))}
      </AdminCard>

      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">Could not load inquiries.</p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !items.length ? (
        <AdminCard className="p-8 text-center text-sm text-ink-muted">
          {tab === "Unread"
            ? "No unread inquiries."
            : "No inquiries yet. Messages from the contact form will appear here."}
        </AdminCard>
      ) : (
        <AdminCard>
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
              <tr className="border-b border-border">
                <th className="p-3 w-10"></th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3">Received</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border last:border-0 hover:bg-surface ${
                    !item.is_read ? "bg-amber-50/50" : ""
                  }`}
                >
                  <td className="p-3 text-center">
                    {item.is_read ? (
                      <MailOpen className="w-4 h-4 text-ink-muted mx-auto" />
                    ) : (
                      <Mail className="w-4 h-4 text-amber-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-ink-muted">{item.email}</div>
                  </td>
                  <td className="p-3 font-medium">{item.subject}</td>
                  <td className="p-3 text-xs text-ink-muted text-center whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Link
                      to="/admin/inquiries/$id"
                      params={{ id: item.id }}
                      className="text-brand hover:underline text-xs font-semibold mr-3"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        markRead.mutate({
                          id: item.id,
                          is_read: !item.is_read,
                        })
                      }
                      className="text-xs text-ink-muted hover:text-brand"
                    >
                      {item.is_read ? "Mark unread" : "Mark read"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      )}
    </AdminLayout>
  );
}
