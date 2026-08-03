import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical } from 'react-icons/fa';

const DraggableItem = ({ id, label, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all select-none ${
        isDragging
          ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg z-10'
          : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-[var(--primary)]/50'
      }`}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-[var(--on-surface-variant)] hover:text-[var(--primary)]" aria-label="Arrastrar">
        <FaGripVertical />
      </span>
      <span className="font-bold text-[var(--primary)] mr-1">{index + 1}.</span>
      <span className="font-medium text-[var(--on-surface)]">{label}</span>
    </li>
  );
};

export const DragDropQuestion = ({ items, value, onChange }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const ordered = value && value.length === items.length ? value : items;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((i) => i.id === active.id);
    const newIndex = ordered.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(ordered, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {ordered.map((item, index) => (
            <DraggableItem key={item.id} id={item.id} label={item.label} index={index} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};
