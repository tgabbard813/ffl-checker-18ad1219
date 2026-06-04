## Goal

Deploy FFL Registry at `https://tgabbard813.github.io/ffl-checker/` as a pure static site, with a scheduled GitHub Action that downloads the latest ATF CSV and commits it to the repo so the app can fetch it directly.

## Heads-up: this is an invasive change

The current app uses TanStack Start (SSR + server functions). GitHub Pages only serves static files, so I have to remove TanStack Start and rebuild on a plain Vite + React + TanStack Router (SPA) stack. The UI, routes, IndexedDB code, and styles stay the same — only the framework shell and the ATF proxy change.

If you'd rather keep TanStack Start untouched, **Cloudflare Pages** would deploy the current app as-is with zero refactor and a free tier. Let me know if you want to switch to that instead before I proceed.

## What changes

### 1. Strip TanStack Start, keep TanStack Router as SPA
- Remove `@tanstack/react-start`, `nitro`, `src/server.ts`, `src/routes/api/` directory, `src/routes/__root.tsx` shell helpers tied to Start.
- Add `index.html` at repo root and `src/main.tsx` as the client entry that mounts the router.
- Convert `__root.tsx` to a normal `createRootRoute` with a regular React layout (no `<html>`/`<head>` shell — head tags move to `index.html` and a small `useEffect` for per-route titles).
- Keep file-based routing via `@tanstack/router-plugin/vite`.
- Replace `vite.config.ts` with a plain Vite + React + Tailwind + router-plugin config. Set `base: "/ffl-checker/"`.

### 2. Replace ATF proxy with a static CSV file
- Delete `src/routes/api/public/atf-list.ts`.
- App fetches `${import.meta.env.BASE_URL}ffl-list.csv` instead of the proxy.
- A committed `public/ffl-list.csv` (kept fresh by the workflow below) becomes the source.
- The "Download from ATF" button now imports from the bundled static file, with a small banner showing when it was last updated (from a sibling `public/ffl-list.json` manifest with `{ month, year, fetchedAt }`).

### 3. GitHub Actions

**`.github/workflows/deploy.yml`** — on push to `main`:
- `bun install`, `bun run build`, upload `dist/` to GitHub Pages.
- Copy `dist/index.html` → `dist/404.html` so client-side routes work on hard refresh.

**`.github/workflows/update-atf.yml`** — scheduled (1st of each month at 12:00 UTC) + manual `workflow_dispatch`:
- Computes prior-month slug (`MMYY`), curls `https://www.atf.gov/sites/default/files2/ffl/<slug>-ffl-list.csv`.
- If 200, writes `public/ffl-list.csv` + `public/ffl-list.json` manifest and commits with `[skip ci]` bypass, then triggers `deploy.yml`.
- If 404 (ATF hasn't posted yet), retries the month before, then exits cleanly.

### 4. SPA routing fallback
- `404.html` = copy of `index.html` so deep links like `/ffl/12345` resolve client-side.

### 5. Repo setup steps you'll do once
- In GitHub repo **Settings → Pages**, set **Source = GitHub Actions**.
- In **Settings → Actions → General**, allow workflows to **Read and write** so the ATF updater can commit.

## Technical notes

```text
repo/
├── index.html                    # NEW — Vite SPA entry
├── public/
│   ├── ffl-list.csv              # NEW — committed by workflow
│   ├── ffl-list.json             # NEW — { month, year, fetchedAt }
│   ├── manifest.webmanifest      # existing, base path updated
│   └── icon-*.png                # existing
├── src/
│   ├── main.tsx                  # NEW — client entry
│   ├── router.tsx                # KEEP, simplify (no Start)
│   ├── routes/__root.tsx         # SIMPLIFY — no <html>, no Start
│   ├── routes/index.tsx          # unchanged
│   ├── routes/data.tsx           # MODIFY — fetch /ffl-list.csv
│   ├── routes/ffl.$licenseId.tsx # unchanged
│   ├── routes/results.tsx        # unchanged
│   ├── routes/api/               # DELETE
│   ├── server.ts                 # DELETE
│   └── lib/error-*.ts            # DELETE if Start-specific
├── .github/workflows/
│   ├── deploy.yml                # NEW
│   └── update-atf.yml            # NEW
└── vite.config.ts                # REPLACE — plain Vite config
```

Packages removed: `@tanstack/react-start`, `@lovable.dev/vite-tanstack-config`, `nitro`.
Packages added: `@tanstack/router-plugin`, `@vitejs/plugin-react` (already present).

## Trade-offs

- **Lovable preview will still work** — the new Vite SPA config runs fine in the Lovable sandbox; you just lose SSR (which this app doesn't really need).
- **First-load size** is slightly larger (no SSR streaming), but the app already does all heavy work client-side (IndexedDB).
- **ATF freshness** depends on the scheduled workflow running monthly. You can also trigger it manually from the Actions tab any time.

## Confirm before I start

Reply **"go"** to proceed, or tell me if you want Cloudflare Pages instead (zero refactor).