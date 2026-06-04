import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useHistory } from "@/hooks/use-history";
import { clearHistory, removeHistory, timeAgo } from "@/lib/ffl-history";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "Search History — FFL Registry" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const history = useHistory();

  return (
    <AppShell>
      <section className="px-5 pt-6 pb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          On-device log
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">History</h2>
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all search history?")) clearHistory();
              }}
              className="text-[11px] font-semibold uppercase tracking-widest text-destructive hover:opacity-80"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your recent searches are stored only on this device.
        </p>
      </section>

      <section className="px-5 pb-8">
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 px-5 py-12 text-center">
            <p className="text-sm font-medium">Nothing here yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a search and it'll show up here.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Search now
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex items-stretch active:bg-surface-elevated"
              >
                <Link
                  to="/results"
                  search={{ q: h.query, mode: h.mode }}
                  className="flex flex-1 items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.query}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <span className="uppercase tracking-wider">{h.mode}</span>{" "}
                      · {h.resultCount}{" "}
                      {h.resultCount === 1 ? "result" : "results"} ·{" "}
                      {timeAgo(h.ts)}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => removeHistory(h.id)}
                  aria-label="Remove"
                  className="grid w-12 place-items-center border-l border-border text-muted-foreground hover:text-destructive"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
