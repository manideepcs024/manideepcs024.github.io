/* Registers the service worker and exposes install helpers as window.MMM.
 * Included on every page. Pages can listen for the "mmm:installable" event. */
(function () {
  const me = document.currentScript;
  const ROOT = new URL("../", me ? me.src : location.href).href;            // site root (assets/ is one level down)
  const MMM = window.MMM = window.MMM || {};
  MMM.root = ROOT;
  if (!window.MMMi18n && !document.querySelector('script[src$="assets/i18n.js"]')) { const s = document.createElement("script"); s.src = ROOT + "assets/i18n.js"; document.head.appendChild(s); }
  // Remember which pages were opened (used by the course page to show "visited").
  try { const m = location.pathname.match(/\/([a-z0-9-]+)\/(?:index\.html)?$/); if (m) { const v = JSON.parse(localStorage.getItem("mmm_visits") || "{}"); v[m[1]] = Date.now(); localStorage.setItem("mmm_visits", JSON.stringify(v)); } } catch (e) {}
  MMM.standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  MMM.ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  MMM.canInstall = false;

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    addEventListener("load", () => {
      navigator.serviceWorker.register(ROOT + "sw.js", { scope: ROOT }).then(reg => { MMM.reg = reg; document.dispatchEvent(new Event("mmm:sw")); }).catch(() => {});
    });
  }
  addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); MMM.prompt = e; MMM.canInstall = true;
    document.dispatchEvent(new Event("mmm:installable"));
  });
  addEventListener("appinstalled", () => { MMM.canInstall = false; MMM.prompt = null; MMM.standalone = true; document.dispatchEvent(new Event("mmm:installed")); });
  MMM.install = async () => {
    if (!MMM.prompt) return false;
    MMM.prompt.prompt(); const r = await MMM.prompt.userChoice; MMM.prompt = null; MMM.canInstall = false;
    return r && r.outcome === "accepted";
  };
})();
