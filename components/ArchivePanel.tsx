"use client";

import { useDroppable, useDraggable } from "@dnd-kit/core";
import type { Note } from "@/types";

function ArchiveItem({ note }: { note: Note }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: note.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={[
        "flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing",
        "text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none",
        isDragging ? "opacity-30" : "",
      ].join(" ")}
      title="Drag to grid to unarchive"
    >
      <span className="text-gray-300 dark:text-gray-600 text-xs shrink-0">⠿</span>
      <span className="truncate">{note.title || <em className="text-gray-400">Untitled</em>}</span>
    </div>
  );
}

interface Props {
  notes: Note[];
  draggingFromGrid: boolean;
}

export function ArchivePanel({ notes, draggingFromGrid }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: "archive-zone" });

  const highlight = isOver && draggingFromGrid;

  return (
    <aside
      ref={setNodeRef}
      className={[
        "w-48 shrink-0 flex flex-col border-r transition-colors duration-150",
        "border-gray-200 dark:border-gray-700",
        highlight
          ? "bg-indigo-50 dark:bg-indigo-950/40"
          : "bg-white dark:bg-gray-900",
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-3 pt-4 pb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-gray-400 shrink-0">
          <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v.042a1.5 1.5 0 0 1-.44 1.065L13 5.172V12.5A1.5 1.5 0 0 1 11.5 14h-7A1.5 1.5 0 0 1 3 12.5V5.172l-.56-.565A1.5 1.5 0 0 1 2 3.542V3.5ZM3.5 3a.5.5 0 0 0-.5.5v.042a.5.5 0 0 0 .147.354L4 4.757V12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V4.757l.853-.861A.5.5 0 0 0 13 3.542V3.5a.5.5 0 0 0-.5-.5h-9Z" />
        </svg>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Archive
        </h2>
        {notes.length > 0 && (
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 tabular-nums">{notes.length}</span>
        )}
      </div>

      {/* Drop hint */}
      <div
        className={[
          "mx-2 mb-2 rounded-lg border-2 border-dashed px-2 py-1.5 text-center text-xs transition-all duration-150",
          highlight
            ? "border-indigo-400 dark:border-indigo-500 text-indigo-500 dark:text-indigo-400 opacity-100"
            : draggingFromGrid
            ? "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-100"
            : "border-transparent opacity-0 pointer-events-none",
        ].join(" ")}
      >
        Drop to archive
      </div>

      {/* Archived note list */}
      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {notes.length === 0 && !draggingFromGrid ? (
          <p className="text-xs text-center text-gray-300 dark:text-gray-600 mt-6 px-2">
            Drag notes here to archive them
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {notes.map((note) => (
              <ArchiveItem key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
