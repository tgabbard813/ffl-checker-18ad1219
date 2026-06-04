import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { FflResultCard } from "@/components/ffl-result-card";
import { searchFfls, type SearchMode } from "@/lib/ffl-data";
import { addHistory } from "@/lib/ffl-history";

const searchSchema = z.object({
  q: z.string().catch(""),
  mode: z.enum(["name", "license", "nearby"]).catch("name"),
});

export const Route = createFileRoute("/results")({
  validateSearch: searchSchema,
  head: ({ match }) => ({
    meta: [
      {
        title: `"${(match.search as { q: string }).q}" — FFL Registry`,
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { q, mode } = Route.useSearch();

  const results = useMemo(
    () => searchFfls(q, mode as SearchMode),
    [q, mode],
  );

  // Record this search in local history.
  useEffect(() => {
    if (!q) return;
    addHistory({ query: q, mode: mode as SearchMode, resultCount: results.length });
    // Only on q/mode change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, mode]);

  const modeLabel =
    mode === "license" ? "License #" : mode === "nearby" ? "Nearby" : "Name";

  return (
    <AppShell>
      <section className="px-5 pt-5 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <svg
            className="size-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          New search
        </Link>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {modeLabel} · Query
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight">
              {q || "—"}
            </h2>
          </div>
          <span className="shrink-0 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[11px] text-muted-foreground">
            {results.length} {results.length === 1 ? "match" : "matches"}
          </span>
        </div>
      </section>

      <section className="px-5 pb-8">
        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 px-5 py-10 text-center">
            <p className="text-sm font-medium">No licenses found.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Double-check spelling, try fewer characters, or switch search
              modes. This dataset is a public sample — see About for details.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              New search
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {results.map((f) => (
              <li key={f.id}>
                <FflResultCard ffl={f} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
