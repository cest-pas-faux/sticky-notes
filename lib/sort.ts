import type { Note, SortOrder } from "@/types";

export function sortNotes(notes: Note[], order: SortOrder): Note[] {
  const copy = [...notes];
  switch (order) {
    case "created-desc":
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case "created-asc":
      return copy.sort((a, b) => a.createdAt - b.createdAt);
    case "modified-desc":
      return copy.sort((a, b) => b.updatedAt - a.updatedAt);
    case "modified-asc":
      return copy.sort((a, b) => a.updatedAt - b.updatedAt);
    case "manual":
    default:
      return copy.sort((a, b) => a.order - b.order);
  }
}

export function filterNotes(notes: Note[], query: string): Note[] {
  if (!query.trim()) return notes;
  const q = query.toLowerCase();
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      n.tags.some((t) => t.label.toLowerCase().includes(q))
  );
}
