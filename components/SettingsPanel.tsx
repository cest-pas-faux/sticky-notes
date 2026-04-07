"use client";

import type { TrashSettings } from "@/types";

interface Props {
  settings: TrashSettings;
  onUpdate: (changes: Partial<TrashSettings>) => void;
  trashCount: number;
  onEmptyTrash: () => void;
}

export function SettingsPanel({ settings, onUpdate, trashCount, onEmptyTrash }: Props) {
  return (
    <div className="flex items-center gap-4 flex-wrap px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
      <span className="font-medium">Trash settings:</span>
      <label className="flex items-center gap-1">
        Auto-purge after
        <input
          type="number"
          min={1}
          max={365}
          value={settings.autoCleanupDays}
          onChange={(e) => onUpdate({ autoCleanupDays: Number(e.target.value) })}
          className="w-16 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-center"
        />
        days
      </label>
      {trashCount > 0 && (
        <button
          onClick={onEmptyTrash}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          Empty trash ({trashCount})
        </button>
      )}
    </div>
  );
}
