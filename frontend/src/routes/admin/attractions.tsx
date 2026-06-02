import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import { toast } from 'sonner'
import { AdminLayout, AdminCard, Toggle } from '@/components/AdminLayout'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  categoryColor,
  categoryGradient,
  isAttractionCategory,
} from '@/lib/attraction-styles'
import {
  deleteAttraction,
  getAttractions,
  updateSortOrder,
  toggleAttractionFeatured,
  toggleAttractionPublished,
} from '@/lib/attractions-fns'
import { Star, Pencil, Trash2, GripVertical, Plus } from 'lucide-react'

export const Route = createFileRoute('/admin/attractions')({
  component: AttractionsAdmin,
})

function AttractionsAdmin() {
  const queryClient = useQueryClient()

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'attractions'],
    queryFn: () => getAttractions(),
    retry: false,
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const [orderedIds, setOrderedIds] = useState<string[]>([])
  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const orderedItems = useMemo(() => {
    const list = orderedIds.map((id) => itemsById.get(id)).filter(Boolean)
    if (list.length === items.length) return list
    // fallback if ids drift (e.g. new item)
    return items
  }, [orderedIds, itemsById, items])

  useEffect(() => {
    setOrderedIds(items.map((i) => i.id))
  }, [items])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'attractions'] })

  const reorder = useMutation({
    mutationFn: (ids: string[]) => updateSortOrder({ data: ids }),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['public', 'attractions'] })
      toast.success('Order updated')
    },
    onError: () => toast.error('Failed to reorder'),
  })

  const togglePub = useMutation({
    mutationFn: (id: string) => toggleAttractionPublished({ data: id }),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['public', 'attractions'] })
    },
    onError: () => toast.error('Failed to update published status'),
  })

  const toggleFeat = useMutation({
    mutationFn: (id: string) => toggleAttractionFeatured({ data: id }),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['public', 'attractions'] })
    },
    onError: () => toast.error('Failed to update featured status'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteAttraction({ data: id }),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['public', 'attractions'] })
      toast.success('Attraction deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  function onDelete(id: string, title: string) {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      remove.mutate(id)
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id))
      const newIndex = prev.indexOf(String(over.id))
      const next = arrayMove(prev, oldIndex, newIndex)
      reorder.mutate(next)
      return next
    })
  }

  return (
    <AdminLayout
      title="Attractions"
      breadcrumb="Content · Attractions"
      action={
        <Link
          to="/admin/attractions/$id"
          params={{ id: 'new' }}
          className="px-4 py-2 rounded-md bg-brand text-white text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-brand-dark"
        >
          <Plus className="w-4 h-4" /> New Attraction
        </Link>
      }
    >
      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">
            Could not load attractions. Run{' '}
            <code className="font-mono">docker compose up -d && bun run db:push && bun run db:seed</code>
          </p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <AdminCard>
          {items.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-muted">
              No attractions yet.{' '}
              <Link to="/admin/attractions/$id" params={{ id: 'new' }} className="text-brand font-medium">
                Create one
              </Link>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
                <tr className="border-b border-border">
                  <th className="p-4 text-left">Image</th>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-center">Published</th>
                  <th className="p-4 text-center">Sort</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {orderedItems.map((a) => (
                      <SortableAttractionRow
                        key={a.id}
                        id={a.id}
                        title={a.title}
                        category={a.category}
                        image={a.image}
                        is_featured={a.is_featured}
                        is_published={a.is_published}
                        sort_order={a.sort_order}
                        onToggleFeatured={() => toggleFeat.mutate(a.id)}
                        onTogglePublished={() => togglePub.mutate(a.id)}
                        onDelete={() => onDelete(a.id, a.title)}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          )}
        </AdminCard>
      )}
    </AdminLayout>
  )
}

function SortableAttractionRow({
  id,
  title,
  category,
  image,
  is_featured,
  is_published,
  sort_order,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
}: {
  id: string
  title: string
  category: string
  image: string | null
  is_featured: boolean
  is_published: boolean
  sort_order: number
  onToggleFeatured: () => void
  onTogglePublished: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  }

  const cat = isAttractionCategory(category) ? category : 'Heritage'

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-border last:border-0 hover:bg-surface ${isDragging ? 'bg-surface' : ''}`}
    >
      <td className="p-4">
        {image ? (
          <img src={image} alt="" className="w-10 h-10 rounded object-cover" />
        ) : (
          <div className={`w-10 h-10 rounded bg-gradient-to-br ${categoryGradient[cat]}`} />
        )}
      </td>
      <td className="p-4 font-medium">{title}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${categoryColor[cat]}`}>
          {cat}
        </span>
      </td>
      <td className="p-4 text-center">
        <button
          type="button"
          onClick={onToggleFeatured}
          className="inline-flex p-1 rounded hover:bg-surface"
          aria-label="Toggle featured"
        >
          <Star className={`w-4 h-4 ${is_featured ? 'fill-gold text-gold' : 'text-gray-300'}`} />
        </button>
      </td>
      <td className="p-4 text-center">
        <div className="inline-block">
          <Toggle checked={is_published} onChange={onTogglePublished} />
        </div>
      </td>
      <td className="p-4 text-center text-ink-muted">
        <button
          type="button"
          className="inline-flex p-1 rounded hover:bg-surface cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 opacity-60" />
        </button>
        <span className="sr-only">{sort_order}</span>
      </td>
      <td className="p-4 text-right whitespace-nowrap">
        <Link
          to="/admin/attractions/$id"
          params={{ id }}
          className="inline-flex p-2 rounded hover:bg-surface text-ink-muted hover:text-brand"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex p-2 rounded hover:bg-red-50 text-ink-muted hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}
