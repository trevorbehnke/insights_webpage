import { HistoryEntry } from "./types";

const STORAGE_KEY = "address-insights-history";
const MAX_ENTRIES = 10;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.slug !== entry.slug);
    filtered.unshift({ ...entry, timestamp: Date.now() });
    const trimmed = filtered.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable
  }
}
