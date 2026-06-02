import { createFileRoute, Link, useNavigate, useParams } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  AdminLayout,
  AdminCard,
  Button,
  Field,
  Input,
  Select,
  Toggle,
  SectionLabel,
} from '@/components/AdminLayout'
import { TagInput } from '@/components/admin/TagInput'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import {
  createGuide,
  deleteGuide,
  getGuideById,
  getGuides,
  reorderGuides,
  toggleGuideAvailable,
  toggleGuidePublished,
  updateGuide,
  uploadGuidePhoto,
} from '@/lib/guides-fns'
import { generateSlug } from '@/lib/slug'
import { guideInputSchema, type GuideInput } from '@/lib/validators/guides'
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
import { ArrowLeft, Camera, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/admin/guides')({
  component: GuidesAdmin,
})

function GuidesAdmin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'guides'],
    queryFn: () => getGuides(),
    retry: false,
  })

  const [orderedIds, setOrderedIds] = useState<string[]>([])
  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const orderedItems = useMemo(() => {
    const list = orderedIds
      .map((id) => itemsById.get(id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
    if (list.length === items.length) return list
    return items
  }, [orderedIds, itemsById, items])

  useEffect(() => {
    setOrderedIds(items.map((i) => i.id))
  }, [items])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'guides'] })

  const remove = useMutation({
    mutationFn: (id: string) => deleteGuide({ data: id }),
    onSuccess: () => {
      invalidate()
      toast.success('Guide deleted')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to delete'),
  })

  const togglePub = useMutation({
    mutationFn: (id: string) => toggleGuidePublished({ data: id }),
    onSuccess: invalidate,
    onError: () => toast.error('Failed to toggle'),
  })

  const toggleAvail = useMutation({
    mutationFn: (id: string) => toggleGuideAvailable({ data: id }),
    onSuccess: invalidate,
    onError: () => toast.error('Failed to toggle'),
  })

  const reorder = useMutation({
    mutationFn: (ids: string[]) => reorderGuides({ data: ids }),
    onSuccess: () => toast.success('Order updated'),
    onError: () => toast.error('Failed to reorder'),
  })

  function onDelete(id: string, name: string) {
    if (window.confirm(`Delete \"${name}\"? This cannot be undone.`)) {
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
      title="Guides"
      breadcrumb="Content · Licensed Guides"
      action={
        <Button
          onClick={() =>
            navigate({
              to: '/admin/guides/$id' as never,
              params: { id: 'new' } as never,
            })
          }
        >
          <Plus className="w-4 h-4" /> New Guide
        </Button>
      }
    >
      {isError ? (
        <AdminCard className="p-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">Could not load guides.</p>
        </AdminCard>
      ) : isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <AdminCard>
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-ink-muted">
              <tr className="border-b border-border">
                <th className="p-3 w-14">Photo</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Languages</th>
                <th className="p-3 text-left">Specialties</th>
                <th className="p-3">Available</th>
                <th className="p-3">Published</th>
                <th className="p-3">Sort</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
                <tbody>
                  {orderedItems.map((g) => (
                    <SortableGuideRow
                      key={g.id}
                      id={g.id}
                      photo={g.photo}
                      name={g.name}
                      languages={g.languages}
                      specialties={g.specialties}
                      is_available={g.is_available}
                      is_published={g.is_published}
                      onToggleAvailable={() => toggleAvail.mutate(g.id)}
                      onTogglePublished={() => togglePub.mutate(g.id)}
                      onEdit={() =>
                        navigate({
                          to: '/admin/guides/$id' as never,
                          params: { id: g.id } as never,
                        })
                      }
                      onDelete={() => onDelete(g.id, g.name)}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </AdminCard>
      )}
    </AdminLayout>
  )
}

function SortableGuideRow({
  id,
  photo,
  name,
  languages,
  specialties,
  is_available,
  is_published,
  onToggleAvailable,
  onTogglePublished,
  onEdit,
  onDelete,
}: {
  id: string
  photo: string | null
  name: string
  languages: string[]
  specialties: string[]
  is_available: boolean
  is_published: boolean
  onToggleAvailable: () => void
  onTogglePublished: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border last:border-0 hover:bg-surface">
      <td className="p-3">
        {photo ? (
          <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-surface border border-border grid place-items-center text-[10px] font-bold text-ink-muted">
            —
          </div>
        )}
      </td>
      <td className="p-3 font-medium">{name}</td>
      <td className="p-3 text-ink-muted">{languages.join(', ')}</td>
      <td className="p-3 text-ink-muted">{specialties.join(', ')}</td>
      <td className="p-3 text-center">
        <div className="inline-block">
          <Toggle checked={is_available} onChange={onToggleAvailable} />
        </div>
      </td>
      <td className="p-3 text-center">
        <div className="inline-block">
          <Toggle checked={is_published} onChange={onTogglePublished} />
        </div>
      </td>
      <td className="p-3 text-center">
        <button
          type="button"
          className="inline-flex p-1 rounded hover:bg-white cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 opacity-60" />
        </button>
      </td>
      <td className="p-3 text-right whitespace-nowrap">
        <button className="p-2 text-ink-muted hover:text-brand" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </button>
        <button className="p-2 text-ink-muted hover:text-red-600" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

// Note: guide editor lives in /admin/guides/$id (separate route file)