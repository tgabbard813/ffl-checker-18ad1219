import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { parseFflCsv } from "@/lib/ffl-import";
import {
  bulkImport,
  clearAll,
  getImportMeta,
  type ImportMeta,
} from "@/lib/ffl-db";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [{ title: "FFL Data — FFL Registry" }],
  }),
  component: DataPage,
});

type Phase =
  | { kind: "idle" }
  | { kind: "parsing"; rows: number }
  | { kind: "importing"; inserted: number; total: number }
  | { kind: "done"; inserted: number; skipped: number; ms: number }
  | { kind: "error"; message: string };

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DataPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [meta, setMeta] = useState<ImportMeta | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  useEffect(() => {
    getImportMeta().then(setMeta);
  }, [phase]);

  async function importFromText(text: string, sourceName: string) {
    const started = performance.now();
    try {
      setPhase({ kind: "parsing", rows: 0 });
      const { rows, skipped } = await parseFflCsv(text, (rowsParsed) =>
        setPhase({ kind: "parsing", rows: rowsParsed }),
      );
      if (rows.length === 0) {
        setPhase({
          kind: "error",
          message:
            "No valid rows found. Make sure this is the ATF complete-list CSV.",
        });
        return;
      }
      setPhase({ kind: "importing", inserted: 0, total: rows.length });
      await bulkImport(rows, { sourceName }, (p) =>
        setPhase({
          kind: "importing",
          inserted: p.inserted,
          total: p.total ?? rows.length,
        }),
      );
      setPhase({
        kind: "done",
        inserted: rows.length,
        skipped,
        ms: Math.round(performance.now() - started),
      });
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "Import failed.",
      });
    }
  }

  async function handleFile(file: File) {
    const text = await file.text();
    await importFromText(text, file.name);
  }

  async function handleBundled() {
    try {
      setPhase({ kind: "parsing", rows: 0 });
      const [csvRes, metaRes] = await Promise.all([
        fetch("/ffl-list.csv", { cache: "no-store" }),
        fetch("/ffl-list.json", { cache: "no-store" }).catch(() => null),
      ]);
      if (!csvRes.ok) throw new Error(`Bundled CSV not found (${csvRes.status})`);
      const text = await csvRes.text();
      let name = "bundled ffl-list.csv";
      if (metaRes && metaRes.ok) {
        const m = await metaRes.json().catch(() => null);
        if (m?.slug) name = `bundled ${m.slug}-ffl-list.csv`;
      }
      await importFromText(text, name);
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not load bundled CSV.",
      });
    }
  }

  async function handleClear() {
    if (!confirm("Remove the imported FFL dataset?")) return;
    await clearAll();
    setPhase({ kind: "idle" });
    setMeta(null);
  }

  const busy = phase.kind === "parsing" || phase.kind === "importing";

  return (
    <AppShell>
      <section className="px-5 pt-6 pb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          FFL Dataset
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Update ATF data
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Import the latest monthly FFL listing from ATF.gov. The file stays on
          this device — nothing is uploaded to a server.
        </p>
      </section>

      {/* Current status */}
      <section className="mx-5 mt-2 rounded-2xl border border-border bg-surface p-4">
        {meta ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Currently loaded
              </span>
              <span className="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success ring-1 ring-success/30">
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Records
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {meta.count.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Imported
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {formatDate(meta.importedAt)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Source file
                </p>
                <p className="mt-0.5 break-all font-mono text-xs">
                  {meta.sourceName}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              No dataset loaded
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Using a small built-in sample. Import a CSV to search the full
              ATF directory.
            </p>
          </div>
        )}
      </section>

      {/* Action */}
      <section className="px-5 pt-5">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void handleFile(f);
          }}
        />
        <button
          disabled={busy}
          onClick={handleBundled}
          className="grid h-12 w-full place-items-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground transition-opacity active:opacity-80 disabled:opacity-50"
        >
          Load bundled ATF list (latest)
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          One-tap import of the CSV shipped with the app.
        </p>

        <a
          href="https://www.atf.gov/firearms/tools-and-services-firearms-industry/federal-firearms-listings"
          target="_blank"
          rel="noreferrer"
          className="mt-3 grid h-11 w-full place-items-center rounded-lg border border-border bg-surface text-sm font-medium text-foreground/90 transition-colors active:bg-surface-elevated"
        >
          Download latest from ATF
        </a>

        <button
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="mt-2 h-11 w-full rounded-lg border border-border bg-surface text-sm font-medium text-foreground/90 transition-colors active:bg-surface-elevated disabled:opacity-50"
        >
          Import a CSV from this device
        </button>

        {meta && !busy && (
          <button
            onClick={handleClear}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-surface text-sm font-medium text-muted-foreground transition-colors active:bg-surface-elevated"
          >
            Remove imported data
          </button>
        )}

        {/* Progress */}
        {phase.kind === "parsing" && (
          <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
            Parsing… {phase.rows.toLocaleString()} rows
          </p>
        )}
        {phase.kind === "importing" && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full bg-accent transition-all"
                style={{
                  width: `${Math.round((phase.inserted / Math.max(phase.total, 1)) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center font-mono text-xs text-muted-foreground tabular-nums">
              Saving {phase.inserted.toLocaleString()} / {phase.total.toLocaleString()}
            </p>
          </div>
        )}
        {phase.kind === "done" && (
          <div className="mt-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            Imported {phase.inserted.toLocaleString()} licenses
            {phase.skipped > 0 && ` (skipped ${phase.skipped})`} in{" "}
            {(phase.ms / 1000).toFixed(1)}s.
          </div>
        )}
        {phase.kind === "error" && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {phase.message}
          </div>
        )}
      </section>

      {/* How to */}
      <section className="border-t border-border px-5 py-6 mt-6">
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Where to get the file
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-relaxed text-foreground/90">
          <li>
            Open{" "}
            <a
              href="https://www.atf.gov/firearms/listing-federal-firearms-licensees"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              atf.gov FFL listings
            </a>
            .
          </li>
          <li>
            Under <em>Download a complete list of FFLs</em>, pick the latest
            month and download the file.
          </li>
          <li>Return here and tap <em>Import ATF CSV</em>.</li>
        </ol>
        <p className="mt-3 text-[11px] text-muted-foreground">
          The file is ~15–20 MB and contains ~75k licensees nationwide.
          Importing takes a few seconds on most phones.
        </p>
      </section>

      <div className="px-5 py-6">
        <Link
          to="/"
          className="grid h-11 w-full place-items-center rounded-lg border border-border bg-surface text-sm font-semibold"
        >
          Back to search
        </Link>
      </div>
    </AppShell>
  );
}
