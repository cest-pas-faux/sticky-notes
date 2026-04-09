"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Note, NoteColor, SortOrder, Tag, TrashSettings } from "@/types";

const STORAGE_KEY = "sticky-notes-data";
const SETTINGS_KEY = "sticky-notes-settings";
const SORT_KEY = "sticky-notes-sort";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadSettings(): TrashSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { autoCleanupDays: 30 };
  } catch {
    return { autoCleanupDays: 30 };
  }
}

function saveSettings(settings: TrashSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSort(): SortOrder {
  try {
    const raw = localStorage.getItem(SORT_KEY);
    return (raw as SortOrder) || "manual";
  } catch {
    return "manual";
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<TrashSettings>({ autoCleanupDays: 30 });
  const [sortOrder, setSortOrderState] = useState<SortOrder>("manual");
  const [hydrated, setHydrated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    setNotes(loadNotes());
    setSettings(loadSettings());
    setSortOrderState(loadSort());
    setHydrated(true);
  }, []);

  const runExpirationCheck = useCallback((currentNotes: Note[], trashSettings: TrashSettings): Note[] => {
    const now = Date.now();
    const cleanupThreshold = trashSettings.autoCleanupDays * 24 * 60 * 60 * 1000;
    return currentNotes.filter((note) => {
      if (note.trashedAt && now - note.trashedAt > cleanupThreshold) return false;
      return true;
    });
  }, []);

  const applyExpirationCheck = useCallback(() => {
    setNotes((prev) => {
      const updated = runExpirationCheck(prev, settings);
      if (updated.length !== prev.length || updated.some((n, i) => n.trashedAt !== prev[i]?.trashedAt)) {
        saveNotes(updated);
        return updated;
      }
      return prev;
    });
  }, [settings, runExpirationCheck]);

  // Run expiration check on load and every minute
  useEffect(() => {
    if (!hydrated) return;
    applyExpirationCheck();
    intervalRef.current = setInterval(applyExpirationCheck, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hydrated, applyExpirationCheck]);

  const updateNotes = useCallback((updater: (prev: Note[]) => Note[]) => {
    setNotes((prev) => {
      const next = updater(prev);
      saveNotes(next);
      return next;
    });
  }, []);

  const createNote = useCallback(() => {
    const now = Date.now();
    const maxOrder = notes.reduce((m, n) => Math.max(m, n.order), -1);
    const note: Note = {
      id: generateId(),
      title: "",
      body: "",
      color: "yellow",
      tags: [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
      order: maxOrder + 1,
      archived: false,
    };
    updateNotes((prev) => [note, ...prev]);
    return note.id;
  }, [notes, updateNotes]);

  const updateNote = useCallback(
    (id: string, changes: Partial<Omit<Note, "id" | "createdAt">>) => {
      updateNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, ...changes, updatedAt: Date.now() } : n
        )
      );
    },
    [updateNotes]
  );

  const deleteNote = useCallback(
    (id: string) => {
      // Move to trash
      updateNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, trashedAt: Date.now() } : n
        )
      );
    },
    [updateNotes]
  );

  const restoreNote = useCallback(
    (id: string) => {
      updateNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, trashedAt: undefined } : n
        )
      );
    },
    [updateNotes]
  );

  const hardDeleteNote = useCallback(
    (id: string) => {
      updateNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [updateNotes]
  );

  const emptyTrash = useCallback(() => {
    updateNotes((prev) => prev.filter((n) => !n.trashedAt));
  }, [updateNotes]);

  const archiveNote = useCallback(
    (id: string) => updateNotes((prev) => prev.map((n) => n.id === id ? { ...n, archived: true } : n)),
    [updateNotes]
  );

  const unarchiveNote = useCallback(
    (id: string) => updateNotes((prev) => prev.map((n) => n.id === id ? { ...n, archived: false } : n)),
    [updateNotes]
  );

  const setNoteColor = useCallback(
    (id: string, color: NoteColor) => updateNote(id, { color }),
    [updateNote]
  );

  const togglePin = useCallback(
    (id: string) => {
      updateNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n
        )
      );
    },
    [updateNotes]
  );

  const addTag = useCallback(
    (id: string, label: string) => {
      const tag: Tag = { id: generateId(), label: label.trim() };
      updateNotes((prev) =>
        prev.map((n) =>
          n.id === id && !n.tags.some((t) => t.label === label.trim())
            ? { ...n, tags: [...n.tags, tag], updatedAt: Date.now() }
            : n
        )
      );
    },
    [updateNotes]
  );

  const removeTag = useCallback(
    (noteId: string, tagId: string) => {
      updateNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, tags: n.tags.filter((t) => t.id !== tagId), updatedAt: Date.now() }
            : n
        )
      );
    },
    [updateNotes]
  );

  const reorderNotes = useCallback(
    (orderedIds: string[]) => {
      updateNotes((prev) => {
        const idToOrder = new Map(orderedIds.map((id, i) => [id, i]));
        return prev.map((n) => ({
          ...n,
          order: idToOrder.has(n.id) ? idToOrder.get(n.id)! : n.order,
        }));
      });
    },
    [updateNotes]
  );

  const setSortOrder = useCallback((order: SortOrder) => {
    setSortOrderState(order);
    localStorage.setItem(SORT_KEY, order);
  }, []);

  const updateSettings = useCallback((changes: Partial<TrashSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...changes };
      saveSettings(next);
      return next;
    });
  }, []);

  const exportData = useCallback(() => {
    const data = { notes, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sticky-notes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const importData = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      const imported: Note[] = Array.isArray(data) ? data : data.notes ?? [];
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      updateNotes(() => imported);
      return true;
    } catch {
      return false;
    }
  }, [updateNotes]);

  return {
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
    archiveNote,
    unarchiveNote,
    setNoteColor,
    togglePin,
    addTag,
    removeTag,
    reorderNotes,
    setSortOrder,
    updateSettings,
    exportData,
    importData,
  };
}
