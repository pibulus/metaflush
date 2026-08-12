import adapterNode from "@sveltejs/adapter-node";
import adapterNetlify from "@sveltejs/adapter-netlify";

// Same switch as the rest of the fleet: the Pi/EliteDesk deploy stays on
// adapter-node, a Netlify build sets DEPLOY_TARGET=netlify. Added 2026-07-31
// so this app could come back online while the EliteDesk migration is pending.
// It had been returning Cloudflare 530s (origin unreachable) — which is also
// why its share card looked broken: the OG tags and og-image.png were correct
// the whole time, there was just nothing running to serve them.
//
// Nothing here needs a server: zero +server routes, zero secrets. It runs
// entirely in the browser, so either host only ever ships static files.
const adapter =
  process.env.DEPLOY_TARGET === "netlify"
    ? adapterNetlify()
    : adapterNode({ out: "build" });

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter,

    // CSP declared through SvelteKit rather than hand-rolled in a hook, which
    // is what lets script-src omit 'unsafe-inline'. SvelteKit hashes its own
    // inline hydration bootstrap in "hash" mode, so the exemption isn't
    // needed — and 'unsafe-inline' is the single thing that most weakens a
    // CSP, because it lets ANY injected script run. Six sibling apps still
    // carry it; drshrink proved this approach hydrates fine in production
    // (verified in-browser 2026-07-31), and this app starts out right.
    //
    // Do NOT also add a hand-rolled <meta> or hook CSP. Two sources conflict,
    // and a hand-rolled one lacks the bootstrap hash, which blocks hydration
    // and leaves a dead static page.
    //
    // blob: on img-src/connect-src covers the object URLs used for local file
    // previews. github.com / ko-fi.com appear only as outbound links, which
    // are navigations and need no CSP entry.
    csp: {
      mode: "hash",
      directives: {
        "default-src": ["self"],
        // fleetcount is the visitor beacon in app.html; cloudflareinsights is
        // auto-injected by Cloudflare. Both were being REFUSED — this app
        // shipped a counter that counted nobody. Found by loading the live
        // page and reading the console, which no file-level check can do.
        "script-src": [
          "self",
          "https://fleetcount.pibulus.deno.net",
          "https://static.cloudflareinsights.com",
        ],
        "style-src": ["self", "unsafe-inline"],
        "img-src": ["self", "data:", "blob:"],
        "font-src": ["self", "data:"],
        "connect-src": [
          "self",
          "blob:",
          "https://fleetcount.pibulus.deno.net",
          "https://static.cloudflareinsights.com",
        ],
        "media-src": ["self", "blob:"],
        "worker-src": ["self", "blob:"],
        "manifest-src": ["self"],
        "base-uri": ["self"],
        "form-action": ["self"],
        "frame-ancestors": ["none"],
        "object-src": ["none"],
      },
    },
  },
};

export default config;
