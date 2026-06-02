import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout, AdminCard, Button } from "@/components/AdminLayout";
import { mediaAssets } from "@/lib/harar-data";
import { Search, Upload, Copy, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/media")({
  component: MediaAdmin,
});

function MediaAdmin() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <AdminLayout title="Media Library" breadcrumb="Media · Assets" action={<Button><Upload className="w-4 h-4" /> Upload Media</Button>}>
      <AdminCard className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input placeholder="Search files…" className="w-full pl-9 pr-3 py-2 rounded border border-border text-sm" />
        </div>
        <select className="rounded border border-border px-3 py-2 text-sm"><option>All types</option><option>Images</option><option>Videos</option></select>
        <select className="rounded border border-border px-3 py-2 text-sm"><option>Recently uploaded</option><option>Oldest</option><option>Largest</option></select>
      </AdminCard>

      {selected.length > 0 && (
        <div className="bg-ink text-white rounded-lg p-3 flex items-center justify-between mb-4">
          <span className="text-sm font-medium">{selected.length} items selected</span>
          <Button className="bg-red-600 hover:bg-red-700"><Trash2 className="w-4 h-4" /> Delete Selected</Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mediaAssets.map((m) => (
          <div key={m.id} className="bg-white rounded-lg border border-border overflow-hidden group">
            <div className={`relative aspect-square bg-gradient-to-br ${m.gradient}`}>
              <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggle(m.id)} className="absolute top-2 left-2 w-4 h-4" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 grid place-items-center gap-1">
                <button className="px-2 py-1 rounded bg-white text-ink text-xs font-semibold inline-flex items-center gap-1"><Copy className="w-3 h-3" /> Copy URL</button>
                <button className="px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
            <div className="p-2">
              <div className="text-xs font-medium truncate">{m.name}</div>
              <div className="flex gap-1 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface text-ink-muted">{m.size}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">{m.used}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-8 text-sm">
        <button className="px-3 py-1 rounded hover:bg-surface">←</button>
        {[1,2,3,4,5].map((p) => <button key={p} className={`w-8 h-8 rounded ${p === 1 ? "bg-brand text-white" : "hover:bg-surface"}`}>{p}</button>)}
        <button className="px-3 py-1 rounded hover:bg-surface">→</button>
      </div>
    </AdminLayout>
  );
}