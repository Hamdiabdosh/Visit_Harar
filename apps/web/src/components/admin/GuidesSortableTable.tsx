"use client";

import type React from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Toggle } from "@/components/AdminLayout";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { GuideDto } from "@/lib/guides-fns";
import { toMediaSrc } from "@/lib/media-url";

export type GuidesTableActions = {
  onToggleAvailable: (id: string) => void;
  onTogglePublished: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
};

const thead = (
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
);

export function GuidesTableStatic({
  items,
  actions,
}: {
  items: GuideDto[];
  actions: GuidesTableActions;
}) {
  return (
    <table className="w-full text-sm">
      {thead}
      <tbody>
        {items.map((g) => (
          <GuideRow key={g.id} guide={g} actions={actions} sortable={false} />
        ))}
      </tbody>
    </table>
  );
}

export function GuidesSortableTable({
  items,
  orderedIds,
  onDragEnd,
  actions,
}: {
  items: GuideDto[];
  orderedIds: string[];
  onDragEnd: (event: DragEndEvent) => void;
  actions: GuidesTableActions;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <table className="w-full text-sm">
        {thead}
        <SortableContext
          items={orderedIds}
          strategy={verticalListSortingStrategy}
        >
          <tbody>
            {items.map((g) => (
              <SortableGuideRow key={g.id} guide={g} actions={actions} />
            ))}
          </tbody>
        </SortableContext>
      </table>
    </DndContext>
  );
}

function SortableGuideRow({
  guide,
  actions,
}: {
  guide: GuideDto;
  actions: GuidesTableActions;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: guide.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <GuideRow
      guide={guide}
      actions={actions}
      sortable
      rowRef={setNodeRef}
      rowStyle={style}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}

function GuideRow({
  guide,
  actions,
  sortable,
  rowRef,
  rowStyle,
  dragAttributes,
  dragListeners,
}: {
  guide: GuideDto;
  actions: GuidesTableActions;
  sortable: boolean;
  rowRef?: (node: HTMLTableRowElement | null) => void;
  rowStyle?: React.CSSProperties;
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const g = guide;
  return (
    <tr
      ref={rowRef}
      style={rowStyle}
      className="border-b border-border last:border-0 hover:bg-surface"
    >
      <td className="p-3">
        {g.photo ? (
          <img
            src={toMediaSrc(g.photo) ?? g.photo}
            alt=""
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-surface border border-border grid place-items-center text-[10px] font-bold text-ink-muted">
            —
          </div>
        )}
      </td>
      <td className="p-3 font-medium">{g.name}</td>
      <td className="p-3 text-ink-muted">{g.languages.join(", ")}</td>
      <td className="p-3 text-ink-muted">{g.specialties.join(", ")}</td>
      <td className="p-3 text-center">
        <div className="inline-block">
          <Toggle
            checked={g.is_available}
            onChange={() => actions.onToggleAvailable(g.id)}
          />
        </div>
      </td>
      <td className="p-3 text-center">
        <div className="inline-block">
          <Toggle
            checked={g.is_published}
            onChange={() => actions.onTogglePublished(g.id)}
          />
        </div>
      </td>
      <td className="p-3 text-center">
        {sortable ? (
          <button
            type="button"
            className="inline-flex p-1 rounded hover:bg-white cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
            aria-label="Drag to reorder"
            {...dragAttributes}
            {...dragListeners}
          >
            <GripVertical className="w-4 h-4 opacity-60" />
          </button>
        ) : (
          <span className="inline-block w-6 h-6" aria-hidden />
        )}
      </td>
      <td className="p-3 text-right whitespace-nowrap">
        <button
          type="button"
          className="p-2 text-ink-muted hover:text-brand"
          onClick={() => actions.onEdit(g.id)}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-2 text-ink-muted hover:text-red-600"
          onClick={() => actions.onDelete(g.id, g.name)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
