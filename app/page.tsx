"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { useNotes } from "@/hooks/useNotes";
import { useDarkMode } from "@/hooks/useDarkMode";
import { sortNotes, filterNotes } from "@/lib/sort";
import { Toolbar } from "@/components/Toolbar";
import { NotesGrid } from "@/components/NotesGrid";
import { ArchivePanel } from "@/components/ArchivePanel";
import { TrashCard } from "@/components/TrashCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import type { View } from "@/types";


function NotesView() {
  const {
    notes,
    sortOrder,
    archiveNote,
    unarchiveNote,
    updateNote,
    deleteNote,
    togglePin,
    setNoteColor,
    addTag,
    removeTag,
    reorderNotes,
  } = useNotes();

  const [dragIds, setDragIds] = useState<string[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isDndDisabled = sortOrder !== "manual";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const { setNodeRef: setGridRef } = useDroppable({ id: "grid-zone" });

  const activeNotes = notes.filter((n) => !n.trashedAt && !n.archived);
  const archivedNotes = notes.filter((n) => !n.trashedAt && !!n.archived);

  const draggingNote = activeId ? notes.find((n) => n.id === activeId) : null;
  const draggingFromGrid = !!draggingNote && !draggingNote.archived;

  const sortedActive = sortNotes(activeNotes, sortOrder);
  const orderedNotes = dragIds
    ? (dragIds.map((id) => sortedActive.find((n) => n.id === id)).filter(Boolean) as typeof sortedActive)
    : sortedActive;

  const cardProps = { onUpdate: updateNote, onDelete: deleteNote, onTogglePin: togglePin, onSetColor: setNoteColor, onAddTag: addTag, onRemoveTag: removeTag };

  function handleDragStart({ active }: DragStartEvent) {
    const id = String(active.id);
    setActiveId(id);
    const note = notes.find((n) => n.id === id);
    if (note && !note.archived && !isDndDisabled) {
      setDragIds(sortedActive.map((n) => n.id));
    }
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || isDndDisabled || over.id === "archive-zone") return;
    const note = notes.find((n) => n.id === String(active.id));
    if (!note?.archived) {
      setDragIds((prev) => {
        if (!prev) return prev;
        const oldIdx = prev.indexOf(String(active.id));
        const newIdx = prev.indexOf(String(over.id));
        if (oldIdx === -1 || newIdx === -1) return prev;
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const id = String(active.id);
    const note = notes.find((n) => n.id === id);
    if (note && over) {
      const overId = String(over.id);
      if (overId === "archive-zone" && !note.archived) {
        archiveNote(id);
      } else if (note.archived && overId !== "archive-zone") {
        // dropped on grid-zone or any grid card → unarchive
        unarchiveNote(id);
      } else if (!note.archived && dragIds && !isDndDisabled) {
        reorderNotes(dragIds);
      }
    }
    setActiveId(null);
    setDragIds(null);
  }

  function handleDragCancel() {
    setActiveId(null);
    setDragIds(null);
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
      <div className="flex flex-1 min-h-0">
        {/* Main grid — also a drop target so archived items can be dropped anywhere here */}
        <main ref={setGridRef} className="flex-1 px-4 py-6 min-w-0">
          {orderedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500 gap-3">
              <span className="text-5xl">📝</span>
              <p className="text-lg">No notes yet</p>
            </div>
          ) : (
            <NotesGrid notes={orderedNotes} {...cardProps} />
          )}
        </main>

        {/* Archive panel — right side */}
        <ArchivePanel
          notes={archivedNotes}
          draggingFromGrid={draggingFromGrid}
        />
      </div>
    </DndContext>
  );
}

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

  const activeNotes = notes.filter((n) => !n.trashedAt && !n.archived);
  const trashNotes = notes.filter((n) => !!n.trashedAt);
  const displayNotes = filterNotes(sortNotes(activeNotes, sortOrder), search);

  const handleNewNote = useCallback(() => {
    setView("notes");
    createNote();
  }, [createNote]);

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
      const ok = importData(ev.target?.result as string);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
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

      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />

      {view === "trash" && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          trashCount={trashNotes.length}
          onEmptyTrash={emptyTrash}
        />
      )}

      {view === "notes" ? (
        <NotesView />
      ) : (
        <main className="max-w-screen-xl mx-auto px-4 py-6 w-full">
          {trashNotes.length === 0 ? (
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
                    <TrashCard note={note} onRestore={restoreNote} onHardDelete={hardDeleteNote} />
                  </div>
                ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
