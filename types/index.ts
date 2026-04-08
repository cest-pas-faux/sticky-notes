export type NoteColor =
  | "yellow"
  | "pink"
  | "blue"
  | "green"
  | "purple"
  | "orange";

export type SortOrder =
  | "created-desc"
  | "created-asc"
  | "modified-desc"
  | "modified-asc"
  | "manual";

export interface Tag {
  id: string;
  label: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  color: NoteColor;
  tags: Tag[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  trashedAt?: number;
  order: number;
}

export interface TrashSettings {
  autoCleanupDays: number;
}

export type View = "notes" | "trash";
