"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useState, useCallback } from "react";
import type { Note, NoteColor } from "@/types";
import { NoteCard } from "./NoteCard";

interface Props {
  notes: Note[];
  onUpdate: (id: string, changes: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSetColor: (id: string, color: NoteColor) => void;
  onAddTag: (id: string, label: string) => void;
  onRemoveTag: (noteId: string, tagId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  isDndDisabled: boolean;
}

// Grid + subtle column-separator lines so the layout is always visible
const GRID_CLASS = "grid grid-cols-2 lg:grid-cols-4 gap-3 items-start";
const GRID_BG: React.CSSProperties = {
  backgroundImage: [
    "repeating-linear-gradient(90deg,",
    "  transparent,",
    "  transparent calc(25% - 1px),",
    "  rgba(156,163,175,0.2) calc(25% - 1px),",
    "  rgba(156,163,175,0.2) 25%",
    ")",
  ].join(""),
  backgroundSize: "100% 100%",
};

function NoteGrid({ notes, ...rest }: { notes: Note[] } & Omit<Props, "notes" | "onReorder" | "isDndDisabled">) {
  return (
    <div style={GRID_BG} className="rounded-xl">
      <div className={GRID_CLASS}>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} {...rest} />
        ))}
      </div>
    </div>
  );
}

export function NotesGrid({ notes, onUpdate, onDelete, onTogglePin, onSetColor, onAddTag, onRemoveTag, onReorder, isDndDisabled }: Props) {
  // Local order maintained during drag so cards physically reflow in real time
  const [dragIds, setDragIds] = useState<string[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Notes in their current visual order (local during drag, prop-driven otherwise)
  const orderedNotes: Note[] = dragIds
    ? (dragIds.map((id) => notes.find((n) => n.id === id)).filter(Boolean) as Note[])
    : notes;

  const pinnedNotes = orderedNotes.filter((n) => n.pinned);
  const unpinnedNotes = orderedNotes.filter((n) => !n.pinned);

  const cardProps = { onUpdate, onDelete, onTogglePin, onSetColor, onAddTag, onRemoveTag };

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      // Snapshot current order into local state
      setDragIds(notes.map((n) => n.id));
      void active;
    },
    [notes],
  );

  const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    setDragIds((prev) => {
      if (!prev) return prev;
      const oldIdx = prev.indexOf(String(active.id));
      const newIdx = prev.indexOf(String(over.id));
      if (oldIdx === -1 || newIdx === -1) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setDragIds((current) => {
        if (current && over && active.id !== over.id) {
          onReorder(current);
        }
        return null;
      });
    },
    [onReorder],
  );

  const handleDragCancel = useCallback(() => setDragIds(null), []);

  if (isDndDisabled) {
    return (
      <div className="flex flex-col gap-6">
        {pinnedNotes.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">📌 Pinned</h2>
            <NoteGrid notes={pinnedNotes} {...cardProps} />
          </section>
        )}
        {unpinnedNotes.length > 0 && <NoteGrid notes={unpinnedNotes} {...cardProps} />}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={orderedNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
        <div className="flex flex-col gap-6">
          {pinnedNotes.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">📌 Pinned</h2>
              <NoteGrid notes={pinnedNotes} {...cardProps} />
            </section>
          )}
          {unpinnedNotes.length > 0 && <NoteGrid notes={unpinnedNotes} {...cardProps} />}
        </div>
      </SortableContext>
    </DndContext>
  );
}
