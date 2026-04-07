import type { NoteColor } from "@/types";

export const NOTE_COLORS: { value: NoteColor; label: string; bg: string; border: string; darkBg: string }[] = [
  { value: "yellow", label: "Yellow", bg: "bg-yellow-100", border: "border-yellow-300", darkBg: "dark:bg-yellow-900/40" },
  { value: "pink", label: "Pink", bg: "bg-pink-100", border: "border-pink-300", darkBg: "dark:bg-pink-900/40" },
  { value: "blue", label: "Blue", bg: "bg-blue-100", border: "border-blue-300", darkBg: "dark:bg-blue-900/40" },
  { value: "green", label: "Green", bg: "bg-green-100", border: "border-green-300", darkBg: "dark:bg-green-900/40" },
  { value: "purple", label: "Purple", bg: "bg-purple-100", border: "border-purple-300", darkBg: "dark:bg-purple-900/40" },
  { value: "orange", label: "Orange", bg: "bg-orange-100", border: "border-orange-300", darkBg: "dark:bg-orange-900/40" },
];

export function getColorClasses(color: NoteColor): string {
  const c = NOTE_COLORS.find((x) => x.value === color) ?? NOTE_COLORS[0];
  return `${c.bg} ${c.border} ${c.darkBg}`;
}

export const COLOR_SWATCHES: Record<NoteColor, string> = {
  yellow: "bg-yellow-300",
  pink: "bg-pink-300",
  blue: "bg-blue-300",
  green: "bg-green-300",
  purple: "bg-purple-300",
  orange: "bg-orange-300",
};
