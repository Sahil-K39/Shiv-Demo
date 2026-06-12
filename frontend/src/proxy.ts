import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const maintenanceHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Site Temporarily Offline</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0d0d0d;
        color: #f6f1e7;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(circle at top left, rgba(181, 133, 60, 0.22), transparent 34rem),
          #0d0d0d;
      }

      main {
        width: min(100%, 560px);
        border: 1px solid rgba(246, 241, 231, 0.18);
        border-radius: 8px;
        padding: clamp(28px, 6vw, 52px);
        background: rgba(18, 18, 18, 0.86);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.36);
      }

      p {
        margin: 0;
        color: rgba(246, 241, 231, 0.72);
        font-size: 0.98rem;
        line-height: 1.7;
      }

      h1 {
        margin: 0 0 14px;
        font-size: clamp(2rem, 8vw, 4.5rem);
        font-weight: 500;
        line-height: 0.95;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Temporarily offline</h1>
      <p>Shiv Shakti is unavailable right now. Please check back later.</p>
    </main>
  </body>
</html>`;

export function proxy(_request: NextRequest) {
  return new NextResponse(maintenanceHtml, {
    status: 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
