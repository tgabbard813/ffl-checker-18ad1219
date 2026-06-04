// Loads the FFL dataset bundled in the repo at public/ffl-data.csv.
// Fetched once per session, parsed, cached in-memory.

import { parseFflCsv } from "./ffl-import";
import {
  statusFor,
  type FflLicense,
  type SearchMode,
} from "./ffl-data";

const MAX_RESULTS = 200;
const CSV_URL = `${import.meta.env.BASE_URL}ffl-data.csv`;

let cache: FflLicense[] | null = null;
let loadPromise: Promise<FflLicense[] | null> | null = null;

async function loadAll(): Promise<FflLicense[] | null> {
  if (cache) return cache;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const res = await fetch(CSV_URL, { cache: "force-cache" });
      if (!res.ok) return null;
      const text = await res.text();
      if (!text || text.length < 100) return null;
      const { rows } = await parseFflCsv(text);
      if (rows.length === 0) return null;
      const today = new Date().toISOString().slice(0, 10);
      for (const r of rows) {
        r.status =
          r.expirationDate && r.expirationDate < today ? "expired" : "active";
      }
      cache = rows;
      return rows;
    } catch {
      return null;
    }
  })();
  return loadPromise;
}

export async function hasBundledData(): Promise<boolean> {
  const all = await loadAll();
  return !!all && all.length > 0;
}

export async function getBundledById(
  id: string,
): Promise<FflLicense | undefined> {
  const all = await loadAll();
  if (!all) return undefined;
  const norm = id.toUpperCase();
  const r = all.find((f) => f.id.toUpperCase() === norm);
  if (!r) return undefined;
  r.status = statusFor(r.expirationDate);
  return r;
}

export async function searchBundled(
  query: string,
  mode: SearchMode,
): Promise<FflLicense[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await loadAll();
  if (!all) return [];
  const out: FflLicense[] = [];

  if (mode === "license") {
    const norm = q.replace(/[\s-]/g, "");
    for (const f of all) {
      if (f.id.toLowerCase().replace(/[\s-]/g, "").includes(norm)) {
        out.push(f);
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }

  if (mode === "nearby") {
    const isState = q.length === 2;
    for (const f of all) {
      const hit =
        f.premiseZip.toLowerCase().startsWith(q) ||
        f.premiseCity.toLowerCase().includes(q) ||
        (isState && f.premiseState.toLowerCase() === q) ||
        f.county.toLowerCase().includes(q);
      if (hit) {
        out.push(f);
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }

  for (const f of all) {
    if (
      f.businessName.toLowerCase().includes(q) ||
      f.licenseName.toLowerCase().includes(q)
    ) {
      out.push(f);
      if (out.length >= MAX_RESULTS) break;
    }
  }
  return out;
}
