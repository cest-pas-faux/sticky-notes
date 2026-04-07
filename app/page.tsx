"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useDarkMode } from "@/hooks/useDarkMode";
import { sortNotes, filterNotes } from "@/lib/sort";
import { Toolbar } from "@/components/Toolbar";
import { NotesGrid } from "@/components/NotesGrid";
import { TrashCard } from "@/components/TrashCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import type { View } from "@/types";

export default function Home() {
  const {
    notes,
    settings,
    sortOrder,
    hydrated,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    hardDeleteNote,
    emptyTrash,
    setNoteColor,
    togglePin,
    addTag,
    removeTag,
    reorderNotes,
    setSortOrder,
    updateSettings,
    exportData,
    importData,
  } = useNotes();

  const { dark, toggle: toggleDark } = useDarkMode();
  const [view, setView] = useState<View>("notes");
  const [search, setSearch] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  const activeNotes = notes.filter((n) => !n.trashedAt);
  const trashNotes = notes.filter((n) => !!n.trashedAt);

  const displayNotes = filterNotes(sortNotes(activeNotes, sortOrder), search);

  const handleNewNote = useCallback(() => {
    setView("notes");
    createNote();
  }, [createNote]);

  // Keyboard shortcut Ctrl+N / Cmd+N
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleNewNote();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNewNote]);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const ok = importData(text);
      if (!ok) alert("Failed to import: invalid JSON format.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <span className="text-gray-400 dark:text-gray-500 animate-pulse">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Toolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearch={setSearch}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        dark={dark}
        onToggleDark={toggleDark}
        onNewNote={handleNewNote}
        onExport={exportData}
        onImportClick={() => importRef.current?.click()}
        trashCount={trashNotes.length}
      />

      <input
        ref={importRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />

      {view === "trash" && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          trashCount={trashNotes.length}
          onEmptyTrash={emptyTrash}
        />
      )}

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {view === "notes" ? (
          displayNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500 gap-3">
              <span className="text-5xl">📝</span>
              {search ? (
                <p>No notes match &ldquo;{search}&rdquo;</p>
              ) : (
                <>
                  <p className="text-lg">No notes yet</p>
                  <button
                    onClick={handleNewNote}
                    className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Create your first note
                  </button>
                </>
              )}
            </div>
          ) : (
            <NotesGrid
              notes={displayNotes}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onTogglePin={togglePin}
              onSetColor={setNoteColor}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onReorder={reorderNotes}
              isDndDisabled={sortOrder !== "manual" || !!search}
            />
          )
        ) : (
          trashNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500 gap-3">
              <span className="text-5xl">🗑️</span>
              <p>Trash is empty</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 [column-fill:_balance]">
              {trashNotes
                .sort((a, b) => (b.trashedAt ?? 0) - (a.trashedAt ?? 0))
                .map((note) => (
                  <div key={note.id} className="mb-3">
                    <TrashCard
                      note={note}
                      onRestore={restoreNote}
                      onHardDelete={hardDeleteNote}
                    />
                  </div>
                ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
