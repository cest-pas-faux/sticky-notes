"use client";

import type { Note } from "@/types";
import { getColorClasses } from "@/lib/colors";

interface Props {
  note: Note;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
}

export function TrashCard({ note, onRestore, onHardDelete }: Props) {
  const colorClasses = getColorClasses(note.color);
  return (
    <div className={`rounded-xl border-2 p-3 flex flex-col gap-2 opacity-80 break-inside-avoid ${colorClasses}`}>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">
          {note.title || <em className="text-gray-400">Untitled</em>}
        </span>
        {note.expiresAt && note.expiresAt < Date.now() && (
          <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-1.5 py-0.5 rounded">Expired</span>
        )}
      </div>
      {note.body && (
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{note.body}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Deleted {note.trashedAt ? new Date(note.trashedAt).toLocaleDateString() : "—"}</span>
        <span className="ml-auto flex gap-2">
          <button
            onClick={() => onRestore(note.id)}
            className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            Restore
          </button>
          <button
            onClick={() => onHardDelete(note.id)}
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Delete forever
          </button>
        </span>
      </div>
    </div>
  );
}
