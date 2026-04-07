"use client";

import type { SortOrder, View } from "@/types";

interface Props {
  view: View;
  onViewChange: (v: View) => void;
  search: string;
  onSearch: (q: string) => void;
  sortOrder: SortOrder;
  onSortChange: (s: SortOrder) => void;
  dark: boolean;
  onToggleDark: () => void;
  onNewNote: () => void;
  onExport: () => void;
  onImportClick: () => void;
  trashCount: number;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc", label: "Oldest first" },
  { value: "modified-desc", label: "Recently edited" },
  { value: "modified-asc", label: "Least recently edited" },
];

export function Toolbar({
  view,
  onViewChange,
  search,
  onSearch,
  sortOrder,
  onSortChange,
  dark,
  onToggleDark,
  onNewNote,
  onExport,
  onImportClick,
  trashCount,
}: Props) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-wrap items-center gap-2">
      {/* Logo */}
      <span className="font-bold text-lg text-gray-800 dark:text-gray-100 mr-2 shrink-0">
        📝 Sticky Notes
      </span>

      {/* View tabs */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
        <button
          onClick={() => onViewChange("notes")}
          className={`px-3 py-1 text-sm transition-colors ${
            view === "notes"
              ? "bg-indigo-500 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          Notes
        </button>
        <button
          onClick={() => onViewChange("trash")}
          className={`px-3 py-1 text-sm transition-colors flex items-center gap-1 ${
            view === "trash"
              ? "bg-indigo-500 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          Trash{trashCount > 0 && <span className="bg-red-400 text-white text-xs rounded-full px-1.5 py-0 leading-tight">{trashCount}</span>}
        </button>
      </div>

      {/* Search */}
      {view === "notes" && (
        <input
          type="search"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 min-w-[140px] max-w-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm px-3 py-1 outline-none focus:ring-2 focus:ring-indigo-400 dark:text-gray-100"
        />
      )}

      {/* Sort */}
      {view === "notes" && (
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {view === "notes" && (
          <button
            onClick={onNewNote}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-1 rounded-lg transition-colors"
            title="New note (Ctrl+N)"
          >
            + New
          </button>
        )}
        <button onClick={onExport} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors" title="Export JSON">⬇ Export</button>
        <button onClick={onImportClick} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors" title="Import JSON">⬆ Import</button>
        <button onClick={onToggleDark} title="Toggle dark mode" className="text-lg">
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
