/* Hindi / English toggle for every page.
 * English is the source text. When Hindi is on, text on the page is swapped using hand-written
 * dictionaries: assets/i18n/common.js (shared UI) + assets/i18n/<page>.js (page text).
 * Dictionary keys are the exact English text (whitespace collapsed). For text with inline tags
 * (<b>, <a>, <i>…) the key is the element's inner HTML, and the value keeps the same tags.
 * Content rendered later (results, panels, cards) is translated as it appears. */
(function () {
  if (window.MMMi18n) return;
  const me = document.currentScript, ROOT = new URL("../", me ? me.src : location.href).href;
  const KEY = "mmm_lang";
  let lang = "en"; try { lang = localStorage.getItem(KEY) || "en"; } catch {}
  const page = (() => { const p = location.pathname.replace(/index\.html$/, ""), rel = decodeURIComponent(new URL(p, location.href).href.slice(ROOT.length)).replace(/\/$/, ""); return rel.split("/")[0] || "home"; })();
  const DICT = new Map(), PATTERNS = [], HPATTERNS = [], missing = new Set();
  const norm = s => String(s).replace(/\s+/g, " ").trim();
  const I18N = window.MMMi18n = { lang, page, root: ROOT, missing,
    add(obj, pats, hpats) { for (const k in obj) DICT.set(norm(k), obj[k]); (pats || []).forEach(p => PATTERNS.push(p)); (hpats || []).forEach(p => HPATTERNS.push(p)); },
    t(s) { const k = norm(s); if (lang !== "hi" || !k) return s; if (DICT.has(k)) return DICT.get(k); for (const [re, rep] of PATTERNS) { if (re.test(k)) return k.replace(re, rep); } return s; },
    set(l) { try { localStorage.setItem(KEY, l); } catch {} location.reload(); },
  };

  /* ---------- toggle button (every page) ---------- */
  const css = `.mmm-lang{position:fixed;left:max(12px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:60;display:flex;border-radius:999px;overflow:hidden;border:1px solid rgba(255,255,255,.18);background:rgba(12,14,24,.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 10px 30px -12px rgba(0,0,0,.6);font:700 13px Inter,system-ui,sans-serif}
.mmm-lang button{border:0;background:none;color:#9aa0b2;padding:9px 13px;cursor:pointer;font:inherit;line-height:1}
.mmm-lang button.on{background:#eef0f6;color:#000}
html[lang=hi] body{font-family:Inter,"Mukta","Noto Sans Devanagari",system-ui,sans-serif}
html[lang=hi] body *:not(.mmm-lang){letter-spacing:0!important}
html[lang=hi] h1,html[lang=hi] h2,html[lang=hi] h3{font-family:"Space Grotesk","Mukta","Noto Sans Devanagari",sans-serif;letter-spacing:0}
@media print{.mmm-lang{display:none}}`;
  function mountToggle() {
    if (document.querySelector(".mmm-lang")) return;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const box = document.createElement("div"); box.className = "mmm-lang"; box.setAttribute("data-noi18n", "");
    box.innerHTML = `<button data-l="en" class="${lang === "en" ? "on" : ""}" title="English" aria-label="English">EN</button><button data-l="hi" class="${lang === "hi" ? "on" : ""}" title="हिंदी" aria-label="हिंदी">हिं</button>`;
    box.addEventListener("click", e => { const b = e.target.closest("[data-l]"); if (b && b.dataset.l !== lang) I18N.set(b.dataset.l); });
    document.body.appendChild(box);
    // lift the switch above any bar fixed to the bottom of the screen (story controls, game bars)
    const place = () => { box.style.visibility = "hidden"; let lift = 0; for (const x of [24, 60]) { const el = document.elementFromPoint(x, innerHeight - 22); let n = el; while (n && n !== document.body) { const cs = getComputedStyle(n); if (cs.position === "fixed" || cs.position === "sticky") { lift = Math.max(lift, innerHeight - n.getBoundingClientRect().top + 8); break; } n = n.parentElement; } } box.style.bottom = lift ? lift + "px" : ""; box.style.visibility = ""; };
    setTimeout(place, 600); addEventListener("resize", place);
  }

  if (lang !== "hi") { if (document.body) mountToggle(); else addEventListener("DOMContentLoaded", mountToggle); return; }

  /* ---------- Hindi mode ---------- */
  document.documentElement.lang = "hi";
  const font = document.createElement("link"); font.rel = "stylesheet"; font.href = "https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&display=swap"; document.head.appendChild(font);
  const load = src => new Promise(res => { const s = document.createElement("script"); s.src = src; s.onload = s.onerror = res; document.head.appendChild(s); });

  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "CANVAS", "SVG", "CODE", "PRE", "NOSCRIPT", "IFRAME"]);
  const INLINE = new Set(["B", "STRONG", "I", "EM", "A", "SMALL", "MARK", "SPAN", "BR", "SUP", "SUB", "U", "S"]);
  const ATTRS = ["placeholder", "title", "aria-label"];
  const skipEl = el => SKIP.has(el.tagName) || el.closest("[data-noi18n],.noi18n,[contenteditable=true]");
  function lookup(k, rec = true) { if (!k || !/[A-Za-z]/.test(k)) return null; if (DICT.has(k)) return DICT.get(k); for (const [re, rep] of PATTERNS) if (re.test(k)) return k.replace(re, rep); if (rec) missing.add(k); return null; }
  function inlineOnly(el) { // element whose content is text + simple inline tags (no ids, no controls)
    let hasEl = false;
    for (const n of el.childNodes) {
      if (n.nodeType === 3) continue; if (n.nodeType !== 1) continue;
      if (!INLINE.has(n.tagName) || n.id) return false;
      hasEl = true; if (n.tagName !== "BR" && !inlineOnly(n) && n.children.length) return false;
    }
    return hasEl;
  }
  // returns false when the text has English words that stayed untranslated
  function doText(n, rec = true) {
    const raw = n.data, k = norm(raw); if (!k || !/[A-Za-z]{2}/.test(k)) return true; const v = lookup(k, rec && /[a-z]{2}/.test(k)); if (v == null) return !/[a-z]{2}/.test(k);
    const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0]; n.data = lead + v + trail; return true;
  }
  function doAttrs(el) { for (const a of ATTRS) { const v = el.getAttribute && el.getAttribute(a); if (v) { const t = lookup(norm(v)); if (t != null) el.setAttribute(a, t); } } }
  function walk(el, rec = true) {
    if (el.nodeType === 3) return doText(el, rec);
    if (el.nodeType !== 1 || skipEl(el)) { if (el.nodeType === 1 && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) doAttrs(el); return true; }
    doAttrs(el);
    if (inlineOnly(el)) {
      const k = norm(el.innerHTML); let v = DICT.get(k); // exact matches (or html patterns) for marked-up text
      if (v == null) for (const [re, rep] of HPATTERNS) if (re.test(k)) { v = k.replace(re, rep); break; }
      if (v != null) { el.innerHTML = v; return true; }
      const plain = norm(el.textContent), pv = DICT.get(plain);
      if (pv != null) { el.textContent = pv; return true; }
      let all = true; for (const c of Array.from(el.childNodes)) if (walk(c, false) === false) all = false; // translate pieces that match on their own
      if (!all && rec) missing.add(k);
      return all;
    }
    let all = true; for (const c of Array.from(el.childNodes)) if (walk(c, rec) === false) all = false;
    return all;
  }
  function run() {
    document.title = I18N.t(document.title);
    walk(document.body);
    let q = new Set(), sched = false;
    const flush = () => { sched = false; const items = Array.from(q); q = new Set(); obs.disconnect(); items.forEach(n => { if (n.isConnected) walk(n); }); obs.observe(document.body, OPT); };
    const OPT = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS };
    const obs = new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === "childList") m.addedNodes.forEach(n => { const p = n.parentElement; q.add(p && p !== document.body && inlineOnly(p) ? p : n); });
        else if (m.type === "characterData") q.add(m.target.parentElement && inlineOnly(m.target.parentElement) ? m.target.parentElement : m.target);
        else if (m.type === "attributes") doAttrsSafe(m.target);
      }
      if (!sched && q.size) { sched = true; queueMicrotask(flush); }
    });
    const doAttrsSafe = el => { obs.disconnect(); doAttrs(el); obs.observe(document.body, OPT); };
    obs.observe(document.body, OPT);
    mountToggle();
    document.dispatchEvent(new Event("mmm:i18n"));
  }
  Promise.all([load(ROOT + "assets/i18n/common.js"), load(ROOT + `assets/i18n/${page}.js`)]).then(() => {
    if (document.readyState === "loading") addEventListener("DOMContentLoaded", run); else run();
  });
})();
