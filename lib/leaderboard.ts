export type AlchemistEntry = {
  id: string;
  initials: string;
  trackTitle: string;
  shareId: string;
  score: number;
  accuracy: number;
  combo: number;
  shattered: boolean;
  date: string;
};

const STORAGE_KEY = "emerald-tabs-alchemists";
const MAX_ENTRIES = 12;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadAlchemists(): AlchemistEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AlchemistEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && typeof entry.score === "number")
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveAlchemist(entry: Omit<AlchemistEntry, "id">) {
  const next: AlchemistEntry = {
    ...entry,
    id: `${entry.date}-${entry.shareId}-${entry.score}-${Math.random().toString(36).slice(2, 7)}`,
  };
  const list = [next, ...loadAlchemists()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  return list;
}

export function normalizeInitials(value: string) {
  const cleaned = value.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  return cleaned || "ET";
}
