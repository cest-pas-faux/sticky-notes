"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Note, NoteColor, Tag } from "@/types";
import { getColorClasses, NOTE_COLORS, COLOR_SWATCHES } from "@/lib/colors";

interface Props {
  note: Note;
  onUpdate: (id: string, changes: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSetColor: (id: string, color: NoteColor) => void;
  onAddTag: (id: string, label: string) => void;
  onRemoveTag: (noteId: string, tagId: string) => void;
}

export function NoteCard({ note, onUpdate, onDelete, onTogglePin, onSetColor, onAddTag, onRemoveTag }: Props) {
  const [editingBody, setEditingBody] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });

  const colorClasses = getColorClasses(note.color);

  useEffect(() => {
    if (editingBody && bodyRef.current) {
      bodyRef.current.focus();
      bodyRef.current.selectionStart = bodyRef.current.value.length;
    }
  }, [editingBody]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/,$/, "");
      if (val) { onAddTag(note.id, val); setTagInput(""); }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
      }}
      className={[
        "relative flex flex-col rounded-xl border-2 p-3 gap-2 group transition-shadow",
        isDragging
          ? "shadow-2xl scale-105 opacity-90 cursor-grabbing"
          : `shadow-sm hover:shadow-md ${colorClasses}`,
      ].join(" ")}
    >
      {isDragging && (
        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20 pointer-events-none" />
      )}

      {/* Header: drag handle, title, pin, delete */}
      <div className="flex items-center gap-1">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-none select-none shrink-0"
          title="Drag to reorder"
        >⠿</span>

        <input
          className="flex-1 font-semibold bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 text-sm min-w-0"
          placeholder="Title…"
          value={note.title}
          onChange={(e) => onUpdate(note.id, { title: e.target.value })}
        />

        <button
          onClick={() => onTogglePin(note.id)}
          title={note.pinned ? "Unpin" : "Pin"}
          className={`text-base shrink-0 transition-opacity ${note.pinned ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
        >📌</button>

        <button
          onClick={() => onDelete(note.id)}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-red-500 transition-opacity text-sm font-bold shrink-0"
          title="Move to trash"
        >✕</button>
      </div>

      {/* Body: markdown view / edit toggle */}
      {editingBody ? (
        <textarea
          ref={bodyRef}
          className="w-full bg-transparent outline-none resize-none text-gray-700 dark:text-gray-200 text-sm min-h-[80px]"
          placeholder="Write your note… (Markdown supported)"
          value={note.body}
          onChange={(e) => onUpdate(note.id, { body: e.target.value })}
          onBlur={() => setEditingBody(false)}
        />
      ) : (
        <div
          onClick={() => setEditingBody(true)}
          className="cursor-text min-h-[40px] text-sm text-gray-700 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none break-words"
        >
          {note.body
            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.body}</ReactMarkdown>
            : <span className="text-gray-400 dark:text-gray-500">Write your note… (click to edit)</span>
          }
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 items-center">
        {note.tags.map((tag: Tag) => (
          <span key={tag.id} className="flex items-center gap-0.5 text-xs bg-black/10 dark:bg-white/10 rounded-full px-2 py-0.5">
            #{tag.label}
            <button onClick={() => onRemoveTag(note.id, tag.id)} className="ml-0.5 text-gray-400 hover:text-red-500">×</button>
          </span>
        ))}
        <input
          className="text-xs bg-transparent outline-none placeholder:text-gray-400 w-20"
          placeholder="+ tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
        />
      </div>

      {/* Footer: color picker + date */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowColorPicker((s) => !s)}
            className="w-4 h-4 rounded-full border border-gray-400/50 opacity-60 hover:opacity-100 transition-opacity"
            title="Change color"
          >
            <span className={`block w-full h-full rounded-full ${COLOR_SWATCHES[note.color]}`} />
          </button>
          {showColorPicker && (
            <div className="absolute bottom-6 left-0 z-30 flex gap-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 border dark:border-gray-700">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { onSetColor(note.id, c.value); setShowColorPicker(false); }}
                  title={c.label}
                  className={`w-5 h-5 rounded-full ${COLOR_SWATCHES[c.value]} border-2 ${note.color === c.value ? "border-gray-600" : "border-transparent"} hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          )}
        </div>

        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
