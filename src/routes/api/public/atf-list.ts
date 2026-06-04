// Server-side proxy to download the ATF monthly FFL list CSV.
// ATF's CDN (Akamai) often blocks plain bot fetches and never serves CORS
// headers — so the browser cannot fetch the CSV directly. This route fetches
// it from the server and streams it back to the client.

import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_SLUG = /^[0-1]\d\d\d$/; // MMYY

export const Route = createFileRoute("/api/public/atf-list")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug") ?? "";
        if (!ALLOWED_SLUG.test(slug)) {
          return new Response("Invalid slug", { status: 400 });
        }

        const upstream = `https://www.atf.gov/sites/default/files2/ffl/${slug}-ffl-list.csv`;

        const res = await fetch(upstream, {
          headers: {
            // Mimic a real browser — ATF's CDN blocks default fetch UAs.
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
            Accept:
              "text/csv,application/csv,text/plain;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            Referer:
              "https://www.atf.gov/firearms/listing-federal-firearms-licensees",
          },
        });

        if (!res.ok) {
          return new Response(
            `Upstream returned ${res.status}. The file for ${slug} may not be posted yet.`,
            { status: res.status === 404 ? 404 : 502 },
          );
        }

        return new Response(res.body, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
