import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { findFflById } from "@/lib/ffl-data";

export const Route = createFileRoute("/ffl/$licenseId")({
  loader: ({ params }) => {
    const ffl = findFflById(params.licenseId);
    if (!ffl) throw notFound();
    return { ffl };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.ffl.businessName} — FFL ${loaderData.ffl.id}`
          : "License — FFL Registry",
      },
    ],
  }),
  notFoundComponent: NotFoundLicense,
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-destructive">{error.message}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-semibold text-accent"
        >
          Back to search
        </Link>
      </div>
    </AppShell>
  ),
  component: LicenseDetailPage,
});

function NotFoundLicense() {
  const { licenseId } = Route.useParams();
  return (
    <AppShell>
      <div className="px-5 py-10 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Not on file
        </p>
        <h2 className="mt-2 text-lg font-semibold">License not found</h2>
        <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
          {licenseId}
        </p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          New search
        </Link>
      </div>
    </AppShell>
  );
}

function formatLong(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium leading-snug">{value}</span>
    </div>
  );
}

function LicenseDetailPage() {
  const { ffl } = Route.useLoaderData();
  const isActive = ffl.status === "active";

  async function copyAll() {
    const text =
      `${ffl.businessName}\n${ffl.licenseName}\nLicense: ${ffl.id}\nType ${ffl.licenseType} — ${ffl.licenseTypeName}\nStatus: ${ffl.status.toUpperCase()}\nExpires: ${ffl.expirationDate}\n${ffl.premiseStreet}\n${ffl.premiseCity}, ${ffl.premiseState} ${ffl.premiseZip}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* no-op */
    }
  }

  return (
    <AppShell>
      <div className="px-5 pt-5">
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
          Back
        </Link>
      </div>

      {/* Status banner */}
      <section className="px-5 pt-4">
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            isActive
              ? "border-success/30 bg-success/10"
              : "border-destructive/30 bg-destructive/10"
          }`}
        >
          <div
            className={`size-2.5 rounded-full ${
              isActive ? "bg-success" : "bg-destructive"
            } ${isActive ? "animate-pulse" : ""}`}
          />
          <div className="flex-1">
            <p
              className={`text-xs font-bold uppercase tracking-widest ${
                isActive ? "text-success" : "text-destructive"
              }`}
            >
              {isActive ? "Active license" : "Expired license"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isActive ? "Valid through" : "Lapsed on"}{" "}
              {formatLong(ffl.expirationDate)}
            </p>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="px-5 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          License Type {ffl.licenseType} · {ffl.licenseTypeName}
        </p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight">
          {ffl.businessName}
        </h1>
        {ffl.licenseName !== ffl.businessName && (
          <p className="mt-1 text-sm text-muted-foreground">
            Licensee: {ffl.licenseName}
          </p>
        )}
      </section>

      {/* Detail card */}
      <section className="mx-5 mt-5 rounded-2xl border border-border bg-surface p-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <div className="col-span-2">
            <Field
              label="License Number"
              value={<span className="font-mono">{ffl.id}</span>}
            />
          </div>
          <div className="col-span-2">
            <Field
              label="Premise Address"
              value={
                <span>
                  {ffl.premiseStreet}
                  <br />
                  {ffl.premiseCity}, {ffl.premiseState} {ffl.premiseZip}
                </span>
              }
            />
          </div>
          <Field label="County" value={ffl.county} />
          <Field label="Expires" value={formatLong(ffl.expirationDate)} />
          {ffl.phone && (
            <div className="col-span-2">
              <Field
                label="Phone"
                value={
                  <a
                    href={`tel:${ffl.phone.replace(/[^0-9+]/g, "")}`}
                    className="text-accent"
                  >
                    {ffl.phone}
                  </a>
                }
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={copyAll}
            className="h-11 w-full rounded-lg bg-accent text-sm font-semibold text-accent-foreground transition-opacity active:opacity-80"
          >
            Copy license info
          </button>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              `${ffl.premiseStreet}, ${ffl.premiseCity}, ${ffl.premiseState} ${ffl.premiseZip}`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="h-11 w-full grid place-items-center rounded-lg border border-border bg-surface-elevated text-sm font-semibold text-foreground transition-colors active:bg-surface"
          >
            Open in Maps
          </a>
        </div>
      </section>

      <p className="px-5 pt-5 pb-2 text-[11px] leading-relaxed text-muted-foreground">
        Source: ATF FFL public listings (monthly). Status is derived from the
        listed expiration date and may lag a real-time eZ Check verification.
      </p>
    </AppShell>
  );
}
