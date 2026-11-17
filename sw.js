/* MANIMINDSMONEY service worker: makes the site installable and usable offline.
 * Pages: network first (you always get the latest when online), cached copy when offline.
 * Static files (css/js/images/fonts/three.js): served from cache, refreshed in the background.
 * When you add a new page, add it to PAGES below and bump VERSION. Pages you visit are cached anyway. */
const VERSION = "mmm-v18";
const PAGES = ["", "tools/", "sectors/", "backup/", "levels/", "close/", "calendar/", "glossary/", "quiz/", "quiz-score/", "chart-game/",
  "message/", "ipo/", "trade-review/", "welcome/", "status/", "contest/", "journal/", "report-card/", "accounts-pnl/", "goals/", "money-ladder/", "fomo/", "myths/", "etf/", "concepts/", "results-guide/", "market-basics/", "candlesticks/", "indicators/", "chart-patterns/", "options-basics/", "special-situations/", "corporate-actions/", "legends/", "checklist/", "options/", "option-planner/", "average/", "tax/",
  "sl-calculator/", "day-review/", "bounce-back/", "comeback-stories/", "house/", "wish/", "trader-room/", "overtrading/", "tv-tip/", "game/", "ipo-game/", "scam-game/", "fno-game/", "mtf-game/", "fundamentals-game/"];
const ASSETS = ["assets/tool.css", "assets/tool.js", "assets/pwa.js", "assets/i18n.js", "assets/i18n/common.js", "assets/vendor/qrcode.js", "manifest.webmanifest",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/maskable-512.png", "assets/icons/apple-touch-icon.png", "assets/icons/favicon-32.png"];
const ROOT = new URL("./", self.location).href;
const CDN = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com\/three@)/;

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    // cache what we can; one missing file must not break the install
    await Promise.all([...PAGES, ...ASSETS].map(p => c.add(new Request(ROOT + p, { cache: "reload" })).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });

const isPage = req => req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
const skip = url => /\.(mp4|webm|ogv|pdf|docx?)$/i.test(url.pathname);   // big media: let the browser handle it

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  const same = url.origin === self.location.origin;
  if (!same && !CDN.test(req.url)) return;
  if (same && skip(url)) return;

  if (same && isPage(req)) {
    // network first, fall back to the cached page (ignoring ?source=pwa etc.), then to the tools hub
    e.respondWith((async () => {
      const c = await caches.open(VERSION);
      try {
        const res = await fetch(req);
        if (res.ok) c.put(url.origin + url.pathname, res.clone());
        return res;
      } catch {
        return (await c.match(url.origin + url.pathname)) || (await c.match(url.origin + url.pathname + "index.html")) ||
               (await c.match(ROOT + "tools/")) || new Response("<h1>Offline</h1><p>This page isn't saved for offline use yet.</p>", { headers: { "Content-Type": "text/html" } });
      }
    })());
    return;
  }
  // static files and CDN: cache first, refresh in the background
  e.respondWith((async () => {
    const c = await caches.open(VERSION), hit = await c.match(req, { ignoreSearch: same });
    const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || new Response("", { status: 504 });
  })());
});
