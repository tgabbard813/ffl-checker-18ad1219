import type { SearchMode } from "./ffl-data";

const KEY = "ffl_search_history_v1";
const MAX = 25;

export type HistoryEntry = {
  id: string; // stable id
  query: string;
  mode: SearchMode;
  resultCount: number;
  ts: number;
};

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
  window.dispatchEvent(new Event("ffl-history-change"));
}

export function getHistory(): HistoryEntry[] {
  return read();
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "ts">) {
  const list = read();
  // De-dupe: same query+mode → bump to top
  const filtered = list.filter(
    (e) => !(e.query === entry.query && e.mode === entry.mode),
  );
  const next: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
  };
  write([next, ...filtered]);
}

export function clearHistory() {
  write([]);
}

export function removeHistory(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
