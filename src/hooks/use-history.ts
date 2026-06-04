import { useEffect, useState } from "react";
import { getHistory, type HistoryEntry } from "@/lib/ffl-history";

export function useHistory(): HistoryEntry[] {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    const sync = () => setHistory(getHistory());
    sync();
    window.addEventListener("ffl-history-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ffl-history-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return history;
}
