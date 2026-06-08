"use client";

import { Link } from "@tanstack/react-router";
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
import {
  categoryColor,
  categoryGradient,
  isAttractionCategory,
} from "@/lib/attraction-styles";
import type { AttractionDto } from "@/lib/attraction-map";
import { Star, Pencil, Trash2, GripVertical } from "lucide-react";

export type AttractionsTableActions = {
  onToggleFeatured: (id: string) => void;
  onTogglePublished: (id: string) => void;
  onDelete: (id: string, title: string) => void;
};

const thead = (
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
);

export function AttractionsTableStatic({
  items,
  actions,
}: {
  items: AttractionDto[];
  actions: AttractionsTableActions;
}) {
  return (
    <table className="w-full text-sm">
      {thead}
      <tbody>
        {items.map((a) => (
          <AttractionRow
            key={a.id}
            item={a}
            actions={actions}
            sortable={false}
          />
        ))}
      </tbody>
    </table>
  );
}

export function AttractionsSortableTable({
  items,
  orderedIds,
  onDragEnd,
  actions,
}: {
  items: AttractionDto[];
  orderedIds: string[];
  onDragEnd: (event: DragEndEvent) => void;
  actions: AttractionsTableActions;
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
            {items.map((a) => (
              <SortableAttractionRow key={a.id} item={a} actions={actions} />
            ))}
          </tbody>
        </SortableContext>
      </table>
    </DndContext>
  );
}

function SortableAttractionRow({
  item,
  actions,
}: {
  item: AttractionDto;
  actions: AttractionsTableActions;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <AttractionRow
      item={item}
      actions={actions}
      sortable
      rowRef={setNodeRef}
      rowStyle={style}
      isDragging={isDragging}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}

function AttractionRow({
  item,
  actions,
  sortable,
  rowRef,
  rowStyle,
  isDragging,
  dragAttributes,
  dragListeners,
}: {
  item: AttractionDto;
  actions: AttractionsTableActions;
  sortable: boolean;
  rowRef?: (node: HTMLTableRowElement | null) => void;
  rowStyle?: React.CSSProperties;
  isDragging?: boolean;
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const cat = isAttractionCategory(item.category) ? item.category : "Heritage";

  return (
    <tr
      ref={rowRef}
      style={rowStyle}
      className={`border-b border-border last:border-0 hover:bg-surface ${isDragging ? "bg-surface" : ""}`}
    >
      <td className="p-4">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded bg-gradient-to-br ${categoryGradient[cat]}`}
          />
        )}
      </td>
      <td className="p-4 font-medium">{item.title}</td>
      <td className="p-4">
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-medium ${categoryColor[cat]}`}
        >
          {cat}
        </span>
      </td>
      <td className="p-4 text-center">
        <button
          type="button"
          onClick={() => actions.onToggleFeatured(item.id)}
          className="inline-flex p-1 rounded hover:bg-surface"
          aria-label="Toggle featured"
        >
          <Star
            className={`w-4 h-4 ${item.is_featured ? "fill-gold text-gold" : "text-gray-300"}`}
          />
        </button>
      </td>
      <td className="p-4 text-center">
        <div className="inline-block">
          <Toggle
            checked={item.is_published}
            onChange={() => actions.onTogglePublished(item.id)}
          />
        </div>
      </td>
      <td className="p-4 text-center text-ink-muted">
        {sortable ? (
          <button
            type="button"
            className="inline-flex p-1 rounded hover:bg-surface cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
            title="Drag to reorder"
            {...dragAttributes}
            {...dragListeners}
          >
            <GripVertical className="w-4 h-4 opacity-60" />
          </button>
        ) : (
          <span className="inline-block w-6 h-6" aria-hidden />
        )}
        <span className="sr-only">{item.sort_order}</span>
      </td>
      <td className="p-4 text-right whitespace-nowrap">
        <Link
          to="/admin/attractions/$id"
          params={{ id: item.id }}
          search={{ denied: false }}
          className="inline-flex p-2 rounded hover:bg-surface text-ink-muted hover:text-brand"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => actions.onDelete(item.id, item.title)}
          className="inline-flex p-2 rounded hover:bg-red-50 text-ink-muted hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
