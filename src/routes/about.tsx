import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: "About — FFL Registry" }],
  }),
  component: AboutPage,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border px-5 py-6">
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <AppShell>
      <section className="px-5 pt-6 pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          About
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          FFL Registry
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A public-records lookup tool for Federal Firearms Licenses. Search by
          business name, license number, or location.
        </p>
      </section>

      <Section title="Data source">
        <p>
          Records come from the ATF's monthly{" "}
          <a
            href="https://www.atf.gov/firearms/listing-federal-firearms-licensees-ffls"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-2 hover:underline"
          >
            FFL listings
          </a>
          . The ATF doesn't publish a real-time API; their official
          authoritative check is{" "}
          <a
            href="https://fflezcheck.atf.gov/fflezcheck/"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-2 hover:underline"
          >
            FFL eZ Check
          </a>
          , which requires a CAPTCHA.
        </p>
        <p className="text-muted-foreground">
          This app currently ships with a representative sample dataset. The
          ingestion can be wired up to refresh from the monthly state files.
        </p>
      </Section>

      <Section title="Search history">
        <p>
          Your search history is stored locally on this device using
          browser storage. Nothing is sent to a server, and clearing your
          browser data wipes it.
        </p>
      </Section>

      <Section title="Install on iPhone">
        <p>
          Tap Safari's Share button, then{" "}
          <span className="font-semibold">Add to Home Screen</span> to install
          this as a standalone app.
        </p>
      </Section>

      <Section title="Disclaimer">
        <p className="text-muted-foreground">
          This is an informational tool. License status here is derived from the
          listed expiration date and is not a substitute for the ATF's official
          FFL eZ Check verification.
        </p>
      </Section>

      <div className="px-5 py-8">
        <Link
          to="/"
          className="grid h-11 w-full place-items-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground"
        >
          Start a search
        </Link>
      </div>
    </AppShell>
  );
}
