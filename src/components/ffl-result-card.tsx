import type { FflLicense } from "@/lib/ffl-data";
import { Link } from "@tanstack/react-router";

function formatExpiration(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function FflResultCard({ ffl }: { ffl: FflLicense }) {
  const isActive = ffl.status === "active";
  return (
    <Link
      to="/ffl/$licenseId"
      params={{ licenseId: ffl.id }}
      className="group block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/60 active:bg-surface-elevated"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Type {ffl.licenseType} · {ffl.licenseTypeName}
          </p>
          <h3 className="mt-0.5 truncate text-base font-semibold leading-tight">
            {ffl.businessName}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
            isActive
              ? "bg-success/10 text-success ring-success/30"
              : "bg-destructive/10 text-destructive ring-destructive/30"
          }`}
        >
          {ffl.status}
        </span>
      </div>

      <p className="text-pretty text-sm leading-snug text-muted-foreground">
        {ffl.premiseStreet}
        <br />
        {ffl.premiseCity}, {ffl.premiseState} {ffl.premiseZip}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="font-mono text-[11px] text-muted-foreground">
          {ffl.id}
        </span>
        <span className="text-[11px] font-medium">
          {isActive ? "Expires" : "Expired"} {formatExpiration(ffl.expirationDate)}
        </span>
      </div>
    </Link>
  );
}
