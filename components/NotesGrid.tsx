"use client";

import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
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
}

const GRID = "grid grid-cols-2 lg:grid-cols-4 gap-3 items-start";

export function NotesGrid({ notes, onUpdate, onDelete, onTogglePin, onSetColor, onAddTag, onRemoveTag }: Props) {
  const cardProps = { onUpdate, onDelete, onTogglePin, onSetColor, onAddTag, onRemoveTag };
  const pinned = notes.filter((n) => n.pinned);
  const unpinned = notes.filter((n) => !n.pinned);

  return (
    <SortableContext items={notes.map((n) => n.id)} strategy={rectSortingStrategy}>
      <div className="flex flex-col gap-6">
        {pinned.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
              📌 Pinned
            </h2>
            <div className={GRID}>
              {pinned.map((note) => <NoteCard key={note.id} note={note} {...cardProps} />)}
            </div>
          </section>
        )}
        {unpinned.length > 0 && (
          <div className={GRID}>
            {unpinned.map((note) => <NoteCard key={note.id} note={note} {...cardProps} />)}
          </div>
        )}
      </div>
    </SortableContext>
  );
}
