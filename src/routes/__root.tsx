import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function MobileErrorOverlay() {
  const [errors, setErrors] = useState<string[]>([]);
  useEffect(() => {
    const push = (msg: string) =>
      setErrors((prev) => (prev.length > 8 ? prev : [...prev, msg]));
    const onError = (e: ErrorEvent) => {
      push(
        `Error: ${e.message}\n  at ${e.filename ?? "?"}:${e.lineno ?? "?"}:${e.colno ?? "?"}`,
      );
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      const msg =
        r instanceof Error
          ? `${r.name}: ${r.message}\n${r.stack ?? ""}`
          : typeof r === "string"
            ? r
            : JSON.stringify(r);
      push(`Unhandled rejection: ${msg}`);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  if (errors.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: "rgba(180,0,0,0.95)",
        color: "white",
        font: "12px/1.4 ui-monospace, monospace",
        padding: "8px 10px",
        maxHeight: "50vh",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <strong>JS errors ({errors.length})</strong>
        <button
          onClick={() => setErrors([])}
          style={{ background: "transparent", color: "white", border: "1px solid white", padding: "2px 6px", borderRadius: 4 }}
        >
          clear
        </button>
      </div>
      {errors.map((e, i) => (
        <div key={i} style={{ borderTop: i ? "1px solid rgba(255,255,255,0.3)" : "none", paddingTop: i ? 4 : 0, marginTop: i ? 4 : 0 }}>
          {e}
        </div>
      ))}
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { title: "FFL Registry — Verify Federal Firearms Licenses" },
      {
        name: "description",
        content:
          "Search the ATF Federal Firearms License directory by business name, license number, or location.",
      },
      { property: "og:title", content: "FFL Registry" },
      {
        property: "og:description",
        content:
          "Verify FFL status and look up public license info by name, license number, or location.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <MobileErrorOverlay />
    </>
  );
}
