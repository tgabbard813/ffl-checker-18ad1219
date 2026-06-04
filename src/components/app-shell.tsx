import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

function NavItem({
  to,
  label,
  active,
}: {
  to: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className="flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors"
    >
      <div
        className={`size-1.5 rounded-full transition-colors ${
          active ? "bg-accent" : "bg-transparent"
        }`}
      />
      <span
        className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[440px] flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background px-5 pt-3 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
              ATF Public Directory
            </span>
            <h1 className="text-base font-semibold tracking-tight">
              FFL Registry
            </h1>
          </div>
          <div className="flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5">
            <div className="size-1.5 animate-pulse rounded-full bg-success" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[440px] border-t border-border bg-background px-2 pb-2">
        <div className="flex">
          <NavItem to="/" label="Search" active={path === "/"} />
          <NavItem
            to="/history"
            label="History"
            active={path.startsWith("/history")}
          />
          <NavItem
            to="/data"
            label="Data"
            active={path.startsWith("/data")}
          />
          <NavItem
            to="/about"
            label="About"
            active={path.startsWith("/about")}
          />
        </div>
      </nav>
    </div>
  );
}
