import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useHistory } from "@/hooks/use-history";
import { timeAgo } from "@/lib/ffl-history";
import type { SearchMode } from "@/lib/ffl-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FFL Registry — Search Federal Firearms Licenses" },
      {
        name: "description",
        content:
          "Search the ATF FFL directory by business name, license number, or location.",
      },
    ],
  }),
  component: HomePage,
});

const MODES: { key: SearchMode; label: string; placeholder: string }[] = [
  { key: "name", label: "Name", placeholder: "Search by business or legal name…" },
  { key: "license", label: "License #", placeholder: "1-54-059-01-4K-07721" },
  { key: "nearby", label: "Nearby", placeholder: "ZIP code, city, or state" },
];

function HomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SearchMode>("name");
  const [query, setQuery] = useState("");
  const history = useHistory();
  const recent = history.slice(0, 4);

  const current = MODES.find((m) => m.key === mode)!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate({
      to: "/results",
      search: { q, mode },
    });
  }

  return (
    <AppShell>
      <section className="px-5 pt-6 pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Lookup
        </p>
        <h2 className="mt-1 text-balance text-2xl font-semibold tracking-tight">
          Verify a Federal Firearms License.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Search the public ATF directory by name, license number, or location.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          {/* Mode toggle */}
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface p-1">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                  mode === m.key
                    ? "bg-surface-elevated text-foreground ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="relative">
            <input
              autoFocus
              type="text"
              inputMode={mode === "nearby" ? "search" : "text"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={current.placeholder}
              className="h-12 w-full rounded-lg border border-border bg-surface px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded-md bg-accent text-accent-foreground transition-opacity hover:opacity-90 active:opacity-80"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.25}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            {mode === "license" &&
              "Hyphens optional. Partial license numbers match too."}
            {mode === "name" && "Tip: try a partial business name."}
            {mode === "nearby" && "Search by ZIP, city, county, or 2-letter state code."}
          </p>
        </form>
      </section>

      {/* Recent history */}
      <section className="border-t border-border px-5 py-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Recent Inquiries
          </h3>
          {history.length > 0 && (
            <Link
              to="/history"
              className="text-[11px] font-semibold text-accent hover:opacity-80"
            >
              View all
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface/50 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No searches yet. Your history stays on this device.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {recent.map((h) => (
              <li key={h.id}>
                <Link
                  to="/results"
                  search={{ q: h.query, mode: h.mode }}
                  className="flex items-center justify-between gap-3 px-4 py-3 active:bg-surface-elevated"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.query}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <span className="uppercase tracking-wider">{h.mode}</span>{" "}
                      · {h.resultCount}{" "}
                      {h.resultCount === 1 ? "result" : "results"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {timeAgo(h.ts)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
