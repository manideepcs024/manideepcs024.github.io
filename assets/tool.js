/* Shared helpers for MANIMINDSMONEY tool pages. Exposes window.Kit. */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* ---------- numbers & text ---------- */
  const num = s => parseFloat(String(s ?? "").replace(/[,₹\s%]/g, ""));
  // Formats an <input> as an Indian-grouped number while typing. dec = max decimals.
  function fmtNum(el, dec = 2, allowNeg = false) {
    let raw = el.value.replace(allowNeg ? /[^\d.-]/g : /[^\d.]/g, "").replace(/(?!^)-/g, "").replace(/(\..*)\./g, "$1");
    if (raw === "" || raw === "-") { el.value = raw; return; }
    const neg = raw.startsWith("-"); if (neg) raw = raw.slice(1);
    const [i, d] = raw.split(".");
    el.value = (neg ? "-" : "") + (i ? Number(i).toLocaleString("en-IN") : "0") + (dec && d !== undefined ? "." + d.slice(0, dec) : "");
  }
  const money = (n, dp = 2) => "₹" + Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const rs = n => money(n, Math.abs(n) >= 1e5 ? 0 : 2);
  const sgn = n => (n > 0 ? "+" : n < 0 ? "−" : "");
  const srs = n => sgn(n) + rs(n);                       // signed rupees
  const qty = n => Number(n).toLocaleString("en-IN");
  const pct = (p, dp = 2) => sgn(p) + Math.abs(p).toFixed(dp) + "%";
  const nf = (n, dp = 2) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const clean = s => String(s ?? "").trim().replace(/\s*\n\s*/g, " ");
  // WhatsApp-style formatting for the chat-bubble preview
  const waHtml = s => esc(s).replace(/\*([^*\n]+)\*/g, "<b>$1</b>").replace(/(^|[\s(])_([^_\n]+)_/g, "$1<i>$2</i>").replace(/~([^~\n]+)~/g, "<s>$1</s>");

  /* ---------- dates (IST) ---------- */
  const istNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseISO = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const niceDate = (s, o = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) => s ? parseISO(s).toLocaleDateString("en-IN", o) : "";

  /* ---------- state ---------- */
  function store(key, defaults) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
    const S = Object.assign(structuredClone(defaults), saved);
    S.save = () => { const o = { ...S }; delete o.save; try { localStorage.setItem(key, JSON.stringify(o)); } catch {} };
    return S;
  }
  // One community invite link shared by every tool (set it once on any page).
  const INVITE_KEY = "mmm_invite";
  const invite = () => { try { return (localStorage.getItem(INVITE_KEY) || "").trim(); } catch { return ""; } };
  const setInvite = v => { try { localStorage.setItem(INVITE_KEY, String(v || "").trim()); } catch {} };
  const shortLink = u => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

  /* ---------- UI ---------- */
  function toast(t, ms = 1900) { const el = $("#toast"); if (!el) return; el.textContent = t; el.classList.add("show"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), ms); }
  function shake(el) { if (!el) return; el.classList.remove("err"); void el.offsetWidth; el.classList.add("err"); }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;opacity:0;top:0";
      document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} t.remove(); return ok;
    }
  }
  // Segmented control. getV() returns the current value; onPick(v) is called on tap.
  function seg(sel, getV, onPick) {
    const el = $(sel), pill = el.querySelector(".pill"), btns = [...el.querySelectorAll("button")];
    const place = () => {
      const on = btns.find(b => b.dataset.v === String(getV())) || btns[0];
      btns.forEach(b => b.classList.toggle("on", b === on));
      if (pill && on.offsetWidth) { pill.style.width = on.offsetWidth + "px"; pill.style.transform = `translateX(${on.offsetLeft - 4}px)`; }
    };
    btns.forEach(b => b.addEventListener("click", () => { onPick(b.dataset.v); place(); }));
    addEventListener("resize", place);
    if (document.fonts) document.fonts.ready.then(place);
    place(); return place;
  }

  const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';

  // Adds background, toast and image modal to the page.
  function chrome() {
    document.body.insertAdjacentHTML("afterbegin", '<div class="bg"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div><div class="grid-bg"></div>');
    document.body.insertAdjacentHTML("beforeend", `<div class="toast" id="toast"></div>
      <div class="modal" id="imgModal" hidden><div class="modal-card"><img id="imgPrev" alt="Card preview" /><p id="imgMsg"></p>
      <div class="row"><a class="btn" id="imgDl" download="card.png">⬇ Download</a><button class="btn primary" id="imgClose">Done</button></div></div></div>`);
    $("#imgClose").addEventListener("click", () => $("#imgModal").hidden = true);
    $("#imgModal").addEventListener("click", e => { if (e.target.id === "imgModal") $("#imgModal").hidden = true; });
  }

  // Fills #shareRow with image / copy / WhatsApp buttons and wires them up.
  // opts: { text(), valid(), draw() -> canvas, file() -> name, imgLabel, noText }
  function share(opts) {
    const row = $("#shareRow");
    row.insertAdjacentHTML("afterbegin", `<button class="btn img" id="imgBtn">📸 ${opts.imgLabel || "Share as image"}</button>` +
      (opts.noText ? "" : `<button class="btn" id="copyBtn">📋 Copy text</button><button class="btn wa" id="waBtn">${WA_SVG} WhatsApp</button>`));
    const ok = () => !opts.valid || opts.valid();
    if (!opts.noText) {
      $("#copyBtn").addEventListener("click", async () => { if (!ok()) return; toast(await copyText(opts.text()) ? "Copied ✓ Paste it in WhatsApp" : "Couldn't copy"); });
      $("#waBtn").addEventListener("click", () => { if (!ok()) return; window.open("https://wa.me/?text=" + encodeURIComponent(opts.text()), "_blank", "noopener"); });
    }
    $("#imgBtn").addEventListener("click", async e => {
      if (!ok()) return;
      const btn = e.currentTarget, label = btn.textContent; btn.disabled = true; btn.textContent = "Creating image…";
      try { await shareCanvas(await opts.draw(), (opts.file ? opts.file() : "card") + ".png", opts.text ? opts.text() : ""); }
      finally { btn.disabled = false; btn.textContent = label; }
    });
  }
  async function shareCanvas(canvas, name, caption) {
    const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
    const file = new File([blob], name, { type: "image/png" });
    if (matchMedia("(hover: none)").matches && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch (err) { if (err.name === "AbortError") return; }
    }
    let copied = false;
    try { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); copied = true; } catch {}
    const url = URL.createObjectURL(blob);
    $("#imgPrev").src = url; $("#imgDl").href = url; $("#imgDl").download = name;
    $("#imgMsg").innerHTML = copied
      ? "✅ <b>Image copied.</b> Open WhatsApp, pick your chat and press <b>Ctrl+V</b> to paste it. Or download it below."
      : "Tap <b>Download</b>, or long-press the image to save or share it on WhatsApp.";
    $("#imgModal").hidden = false;
  }

  /* ---------- canvas ---------- */
  const GROT = '"Space Grotesk", sans-serif', MONO = '"JetBrains Mono", monospace', INTER = 'Inter, sans-serif';
  const F = { GROT, MONO, INTER };
  const loadFonts = () => Promise.all([`700 80px ${GROT}`, `500 30px ${GROT}`, `600 26px ${MONO}`, `700 26px ${MONO}`, `500 26px ${MONO}`, `400 28px ${INTER}`, `500 28px ${INTER}`, `600 28px ${INTER}`, `700 28px ${INTER}`].map(f => document.fonts.load(f).catch(() => {})));
  function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function panel(ctx, x, y, w, h, r = 28, fill = "rgba(255,255,255,0.045)", stroke = "rgba(255,255,255,0.10)") { rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke(); } }
  function txt(ctx, s, x, y, font, color, align = "left") { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(s, x, y); }
  function fit(ctx, s, weight, fam, size, maxW, min = 14) { do { ctx.font = `${weight} ${size}px ${fam}`; if (ctx.measureText(s).width <= maxW) break; size -= 2; } while (size > min); return ctx.font; }
  function clip(ctx, s, maxW) { s = String(s); if (ctx.measureText(s).width <= maxW) return s; while (s.length > 1 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1); return s + "…"; }
  function wrap(ctx, text, maxW) { const out = []; String(text).split("\n").forEach(par => { let line = ""; par.split(/\s+/).filter(Boolean).forEach(w => { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); out.push(line); }); return out.filter((l, i, a) => l || (i && i < a.length - 1)); }
  const cap = (lines, n) => { if (lines.length <= n) return lines; lines = lines.slice(0, n); lines[n - 1] = lines[n - 1].replace(/\s*\S*$/, "") + "…"; return lines; };
  const measure = () => document.createElement("canvas").getContext("2d");

  // Creates a branded canvas: gradient, glows, grid and the MANIMINDSMONEY logo at the top.
  function canvas(W, H, glows = [["rgba(124,92,255,0.34)", .08, .03, .6], ["rgba(0,224,184,0.12)", .97, .95, .58]]) {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0e1020"); g.addColorStop(1, "#05060a"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    glows.forEach(([col, fx, fy, fr]) => { const x = W * fx, y = H * fy, r = W * fr; const rg = ctx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); });
    ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    return { c, ctx };
  }
  function brand(ctx, x = 70, y = 52, s = 1) {
    const sz = 62 * s, lg = ctx.createLinearGradient(x, y, x + sz, y + sz); lg.addColorStop(0, "#7c5cff"); lg.addColorStop(1, "#00e0b8");
    rr(ctx, x, y, sz, sz, 18 * s); ctx.fillStyle = lg; ctx.fill();
    txt(ctx, "₹", x + sz / 2, y + 45 * s, `700 ${36 * s}px ${GROT}`, "#05060a", "center");
    ctx.font = `700 ${36 * s}px ${GROT}`; if ("letterSpacing" in ctx) ctx.letterSpacing = 2 * s + "px";
    const bx = x + sz + 20 * s, bw = ctx.measureText("MANIMINDSMONEY").width;
    const g2 = ctx.createLinearGradient(bx, 0, bx + bw, 0); g2.addColorStop(0, "#ffffff"); g2.addColorStop(.55, "#c9bcff"); g2.addColorStop(1, "#00e0b8");
    ctx.fillStyle = g2; ctx.textAlign = "left"; ctx.fillText("MANIMINDSMONEY", bx, y + 45 * s);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  }
  // Space needed by footer(): 190px, or 250px with an invite line.
  const footerH = withInvite => (withInvite && invite() ? 250 : 190);
  function footer(ctx, W, H, url, disc, withInvite) {
    const inv = withInvite && invite();
    txt(ctx, "— MANIMINDSMONEY Community", 70, H - (inv ? 178 : 118), `600 28px ${INTER}`, "#b6a6ff");
    if (inv) { ctx.font = `600 26px ${INTER}`; txt(ctx, clip(ctx, "👉 Join free: " + shortLink(inv), W - 140), 70, H - 128, `600 26px ${INTER}`, "#25d366"); }
    txt(ctx, url.replace(/\/$/, ""), W / 2, H - 64, `500 24px ${MONO}`, "#6c7285", "center");
    if (disc) txt(ctx, disc, W / 2, H - 30, `400 20px ${INTER}`, "#5a6072", "center");
  }
  function pill(ctx, label, x, y, color, size = 22, align = "left") {
    ctx.font = `700 ${size}px ${MONO}`; const w = ctx.measureText(label).width + size * 1.6, h = size * 1.9;
    const px = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
    rr(ctx, px, y, w, h, h / 2); ctx.fillStyle = color + "26"; ctx.fill(); ctx.strokeStyle = color + "99"; ctx.lineWidth = 2; ctx.stroke();
    txt(ctx, label, px + w / 2, y + h / 2 + size * .36, `700 ${size}px ${MONO}`, color, "center");
    return w;
  }

  const toolUrl = slug => (/^https?:/.test(location.protocol) && !/localhost|127\.0\.0\.1/.test(location.host)
    ? location.host + location.pathname.replace(/index\.html$/, "") : `manideepcs024.github.io/${slug}/`);
  // Lines appended to every shared text: community sign-off, invite (if saved), tool link, disclaimer.
  function signoff(slug, label, disc) {
    const out = ["", "— MANIMINDSMONEY Community"];
    const inv = invite(); if (inv) out.push(`👉 Join free: ${inv}`);
    out.push(`_${label}: ${toolUrl(slug)}_`);
    if (disc) out.push(disc);
    return out;
  }

  // Splits text copied from a WhatsApp chat into { name, msg, order } lines.
  // Handles "[18/11/26, 9:02 AM] Name: msg", "18/11/26, 9:02 am - Name: msg" and "Name - msg".
  function chatLines(text) {
    const out = [], skipped = [];
    String(text || "").split(/\r?\n/).forEach((raw, order) => {
      let line = raw.trim(); if (!line) return;
      line = line.replace(/^\[[^\]]*\]\s*/, "")
        .replace(/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?m\.?)?\s*-\s*/i, "");
      const m = line.match(/^([^:]{1,40}):\s*(.+)$/) || line.match(/^(.{1,40}?)\s+[-–—]\s+(.+)$/);
      if (!m) { skipped.push(raw); return; }
      out.push({ name: m[1].replace(/[~‎‏]/g, "").trim(), msg: m[2].trim(), order, raw });
    });
    return { lines: out, skipped };
  }
  // "Ravi Kumar" -> "Ravi K.", phone numbers -> "…3210"
  const shortName = n => { n = String(n || "").trim(); if (/^\+?\d[\d\s-]{6,}$/.test(n)) return "…" + n.replace(/\D/g, "").slice(-4); const p = n.split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : n; };

  // Renders the shared "community invite link" input into `sel`.
  function inviteField(sel, onChange) {
    const box = $(sel); if (!box) return;
    box.innerHTML = `<div class="q">Community invite link <span class="opt">optional · saved for all tools</span></div>
      <label class="field"><span class="unit">🔗</span><input class="txt" id="inviteIn" type="url" inputmode="url" placeholder="https://chat.whatsapp.com/…" autocomplete="off" /></label>
      <p class="hint">Add your WhatsApp community or channel link once. Every card you share from these tools then ends with “👉 Join free: link”, so forwards bring in new members.</p>`;
    const inp = $("#inviteIn"); inp.value = invite();
    inp.addEventListener("input", () => { setInvite(inp.value); onChange && onChange(); });
  }

  window.Kit = { chatLines, shortName, inviteField, $, $$, num, fmtNum, money, rs, sgn, srs, qty, pct, nf, esc, clean, waHtml, istNow, iso, parseISO, niceDate,
    store, invite, setInvite, shortLink, toast, shake, copyText, seg, WA_SVG, chrome, share, shareCanvas,
    F, loadFonts, rr, panel, txt, fit, clip, wrap, cap, measure, canvas, brand, footer, footerH, pill, toolUrl, signoff };
})();
