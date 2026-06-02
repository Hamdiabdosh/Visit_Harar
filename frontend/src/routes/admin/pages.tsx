import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AdminLayout, AdminCard } from '@/components/AdminLayout'
import { getPage } from '@/lib/pages-fns'
import { Pencil } from 'lucide-react'

export const Route = createFileRoute("/admin/pages")({
  component: PagesAdmin,
});

const PAGE_KEYS = ['about', 'culture', 'plan'] as const

function PagesAdmin() {
  const about = useQuery({ queryKey: ['admin', 'page', 'about'], queryFn: () => getPage({ data: 'about' }) })
  const culture = useQuery({ queryKey: ['admin', 'page', 'culture'], queryFn: () => getPage({ data: 'culture' }) })
  const plan = useQuery({ queryKey: ['admin', 'page', 'plan'], queryFn: () => getPage({ data: 'plan' }) })

  const rows = [
    about.data,
    culture.data,
    plan.data,
  ].filter(Boolean) as NonNullable<(typeof about.data)>[]

  return (
    <AdminLayout title="Pages" breadcrumb="Content · Pages">
      <AdminCard>
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
            <tr className="border-b border-border"><th className="p-4 text-left">Title</th><th className="p-4 text-left">Last Updated</th><th className="p-4">Status</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.page_key} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4 text-ink-muted">{new Date(p.updated_at).toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${p.is_published ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                    {p.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link
                    to="/admin/pages/$pageKey"
                    params={{ pageKey: p.page_key } as never}
                    className="text-brand text-sm font-semibold hover:text-gold inline-flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </AdminLayout>
  )
}