// IndexedDB-backed storage for the imported ATF FFL dataset.
// Persisted across sessions, queried in-memory after first load for speed.

import { openDB, type IDBPDatabase } from "idb";
import type { FflLicense, SearchMode } from "./ffl-data";
import { statusFor } from "./ffl-data";

const DB_NAME = "ffl-registry";
const DB_VERSION = 1;
const STORE = "ffls";
const META = "meta";

type DBSchema = unknown; // loose; idb is fine without generics here

let dbPromise: Promise<IDBPDatabase<DBSchema>> | null = null;

function getDb() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  if (!dbPromise) {
    dbPromise = openDB<DBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("state", "premiseState");
        }
        if (!db.objectStoreNames.contains(META)) {
          db.createObjectStore(META);
        }
      },
    });
  }
  return dbPromise;
}

export type ImportMeta = {
  count: number;
  importedAt: number;
  sourceName: string;
};

export async function getImportMeta(): Promise<ImportMeta | null> {
  try {
    const db = await getDb();
    const m = (await db.get(META, "import")) as ImportMeta | undefined;
    return m ?? null;
  } catch {
    return null;
  }
}

export async function hasImportedData(): Promise<boolean> {
  const m = await getImportMeta();
  return !!m && m.count > 0;
}

// ---- Memory cache (loaded once per session) ----

let memCache: FflLicense[] | null = null;
let memCachePromise: Promise<FflLicense[]> | null = null;

async function loadAll(): Promise<FflLicense[]> {
  if (memCache) return memCache;
  if (memCachePromise) return memCachePromise;
  memCachePromise = (async () => {
    const db = await getDb();
    const all = (await db.getAll(STORE)) as FflLicense[];
    // Re-derive status against today (handles dates passing while data is stale).
    const today = new Date().toISOString().slice(0, 10);
    for (const r of all) {
      r.status = r.expirationDate && r.expirationDate < today ? "expired" : "active";
    }
    memCache = all;
    return all;
  })();
  return memCachePromise;
}

function invalidateCache() {
  memCache = null;
  memCachePromise = null;
}

// ---- Bulk import ----

export type ImportProgress = {
  inserted: number;
  total?: number;
};

export async function bulkImport(
  rows: FflLicense[],
  meta: { sourceName: string },
  onProgress?: (p: ImportProgress) => void,
): Promise<ImportMeta> {
  const db = await getDb();

  // Clear existing data first (full refresh semantics).
  {
    const tx = db.transaction(STORE, "readwrite");
    await tx.objectStore(STORE).clear();
    await tx.done;
  }

  const BATCH = 2000;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const slice = rows.slice(i, i + BATCH);
    for (const r of slice) store.put(r);
    await tx.done;
    inserted += slice.length;
    onProgress?.({ inserted, total: rows.length });
    // Yield to UI.
    await new Promise((r) => setTimeout(r, 0));
  }

  const importMeta: ImportMeta = {
    count: rows.length,
    importedAt: Date.now(),
    sourceName: meta.sourceName,
  };
  await db.put(META, importMeta, "import");
  invalidateCache();
  return importMeta;
}

export async function clearAll(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([STORE, META], "readwrite");
  await tx.objectStore(STORE).clear();
  await tx.objectStore(META).clear();
  await tx.done;
  invalidateCache();
}

// ---- Queries ----

const MAX_RESULTS = 200;

export async function getById(id: string): Promise<FflLicense | undefined> {
  const db = await getDb();
  const r = (await db.get(STORE, id)) as FflLicense | undefined;
  if (!r) return undefined;
  r.status = statusFor(r.expirationDate);
  return r;
}

export async function searchAll(
  query: string,
  mode: SearchMode,
): Promise<FflLicense[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await loadAll();
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

  // name
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
