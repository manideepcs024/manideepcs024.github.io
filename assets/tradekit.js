/* Shared tradebook / P&L reader and trade analysis for Trade Reports and Wrapped.
 * Reads Zerodha Console .xlsx (built-in zip + XML reader) or .csv entirely in the browser.
 * Exposes window.TK. */
(function () {
/* ---------- file reading (zip + xlsx + csv, no libraries) ---------- */
async function unzip(buf) { const dv = new DataView(buf), u8 = new Uint8Array(buf); let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("Not a valid .xlsx file"); const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const files = {}, td = new TextDecoder();
  for (let k = 0; k < n; k++) { if (dv.getUint32(p, true) !== 0x02014b50) break; const m = dv.getUint16(p + 10, true), cs = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = td.decode(u8.subarray(p + 46, p + 46 + nl)), lnl = dv.getUint16(lo + 26, true), lel = dv.getUint16(lo + 28, true), ds = lo + 30 + lnl + lel; files[name] = { m, data: u8.subarray(ds, ds + cs) }; p += 46 + nl + el + cl; }
  return files; }
async function inflate(f) { if (!f) return ""; if (f.m === 0) return new TextDecoder().decode(f.data); if (!("DecompressionStream" in window)) throw new Error("Please update your browser to read .xlsx (or upload CSV)"); return new Response(new Blob([f.data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text(); }
const xml = s => new DOMParser().parseFromString(s, "application/xml");
const colIdx = r => { const m = /^([A-Z]+)/.exec(r || ""); if (!m) return -1; let n = 0; for (const ch of m[1]) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
async function readXlsx(buf) { const z = await unzip(buf), wb = xml(await inflate(z["xl/workbook.xml"])), rels = xml(await inflate(z["xl/_rels/workbook.xml.rels"]));
  const rmap = {}; [...rels.getElementsByTagName("Relationship")].forEach(r => rmap[r.getAttribute("Id")] = r.getAttribute("Target"));
  const ss = z["xl/sharedStrings.xml"] ? [...xml(await inflate(z["xl/sharedStrings.xml"])).getElementsByTagName("si")].map(si => [...si.getElementsByTagName("t")].map(t => t.textContent).join("")) : [];
  const out = [];
  for (const sh of wb.getElementsByTagName("sheet")) { const rid = sh.getAttribute("r:id") || sh.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id"); let tg = rmap[rid] || ""; tg = tg.replace(/^\//, ""); if (!tg.startsWith("xl/")) tg = "xl/" + tg;
    const doc = xml(await inflate(z[tg])), rows = [];
    for (const row of doc.getElementsByTagName("row")) { const arr = []; let ci = 0;
      for (const c of row.getElementsByTagName("c")) { const i = colIdx(c.getAttribute("r")); if (i >= 0) ci = i; const t = c.getAttribute("t"), v = c.getElementsByTagName("v")[0]?.textContent;
        let val = ""; if (t === "s") val = ss[+v] ?? ""; else if (t === "inlineStr") val = [...c.getElementsByTagName("t")].map(x => x.textContent).join(""); else if (t === "b") val = v === "1"; else if (t === "str" || t === "e") val = v ?? ""; else if (v != null && v !== "") val = +v;
        arr[ci] = val; ci++; }
      rows.push([...arr].map(x => x === undefined ? "" : x)); }
    out.push({ name: sh.getAttribute("name"), rows }); }
  return out; }
function readCsv(text) { const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) { const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ",") { row.push(cur); cur = ""; } else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; } else cur += ch; }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return [{ name: "CSV", rows: rows.map(r => r.map(v => { const s = v.trim(); return s !== "" && !isNaN(+s) && !/^0\d/.test(s) && !/^\d{4}-\d\d-\d\d/.test(s) ? +s : s; })) }]; }
const xlDate = v => typeof v === "number" && v > 20000 && v < 80000 ? new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 19) : String(v || "");
/* ---------- recognise Console formats ---------- */
function findHeader(rows, need) { for (let i = 0; i < Math.min(rows.length, 40); i++) { const r = rows[i].map(x => String(x).trim().toLowerCase()); if (need.every(n => r.includes(n.toLowerCase()))) return i; } return -1; }
function parseSheets(sheets, fname) { const found = [];
  for (const sh of sheets) { const R = sh.rows;
    let h = findHeader(R, ["Symbol", "Trade Type", "Quantity", "Price"]);
    if (h >= 0) { const H = R[h].map(x => String(x).trim().toLowerCase()), c = n => H.indexOf(n.toLowerCase()), ex = [];
      for (const r of R.slice(h + 1)) { const sym = String(r[c("Symbol")] || "").trim(); if (!sym) continue; const side = /^b/i.test(r[c("Trade Type")]) ? 1 : /^s/i.test(r[c("Trade Type")]) ? -1 : 0, qty = +r[c("Quantity")], px = +r[c("Price")]; if (!side || !(qty > 0) || !(px >= 0)) continue;
        const date = xlDate(r[c("Trade Date")]).slice(0, 10), t0 = c("Order Execution Time") >= 0 ? xlDate(r[c("Order Execution Time")]) : "", time = (t0 && t0.length >= 16 ? t0.replace(" ", "T") : date + "T00:00:00").slice(0, 19);
        ex.push([sym, String(r[c("Segment")] || "EQ").toUpperCase(), date, time, side, qty, px, String(r[c("Trade ID")] ?? ""), String(r[c("Order ID")] ?? ""), String(r[c("Exchange")] || "")]); }
      found.push({ type: "tradebook", ex, label: `Tradebook · ${ex.length} fills` }); continue; }
    h = findHeader(R, ["Symbol", "Realized P&L"]);
    if (h >= 0 || R.some(r => r.some(x => String(x).trim() === "Realized P&L"))) { const P = { summary: {}, heads: [], syms: [], period: "", seg: sh.name };
      const cr = r => r.filter(x => x !== "" && x != null);
      R.forEach(r0 => { const r = cr(r0), a = String(r[0] ?? "").trim(); const m = /from (\d{4}-\d\d-\d\d) to (\d{4}-\d\d-\d\d)/.exec(r.join(" ")); if (m) P.period = m[1] + " to " + m[2]; if (["Charges", "Other Credit & Debit", "Realized P&L", "Unrealized P&L"].includes(a) && typeof r[1] === "number" && P.summary[a] == null) P.summary[a] = r[1]; });
      const ah = R.findIndex(r => String(cr(r)[0] ?? "").trim() === "Account Head"); if (ah >= 0) for (const r0 of R.slice(ah + 1)) { const r = cr(r0), a = String(r[0] ?? "").trim(); if (!a || a === "Symbol") break; if (typeof r[1] === "number") P.heads.push([a.replace(/ - Z$/, ""), r[1]]); }
      if (h >= 0) { const H = R[h].map(x => String(x).trim()), c = n => H.indexOf(n); for (const r of R.slice(h + 1)) { const s = String(r[c("Symbol")] || "").trim(); if (!s) continue; P.syms.push({ s, rp: +r[c("Realized P&L")] || 0, bv: +r[c("Buy Value")] || 0, sv: +r[c("Sell Value")] || 0, oq: +r[c("Open Quantity")] || 0, ov: +r[c("Open Value")] || 0, up: +r[c("Unrealized P&L")] || 0, pc: +r[c("Previous Closing Price")] || 0 }); } }
      found.push({ type: "pnl", pnl: P, label: `P&L ${P.period ? "(" + P.period + ")" : ""}` }); continue; }
    h = findHeader(R, ["Particulars", "Debit", "Credit"]);
    if (h >= 0) { const H = R[h].map(x => String(x).trim()), c = n => H.indexOf(n), od = []; for (const r of R.slice(h + 1)) { const p = String(r[c("Particulars")] || "").trim(); if (!p) continue; od.push([p, xlDate(r[c("Posting Date")]).slice(0, 10), +r[c("Debit")] || 0, +r[c("Credit")] || 0]); }
      found.push({ type: "other", od, label: `Other debits & credits · ${od.length}` }); continue; } }
  return found; }
/* ---------- analysis ---------- */
function analyze(ex) {
  const om = new Map(); for (const e of ex) { const [sym, seg, date, time, side, qty, px, tid, oid] = e, k = (oid || tid || time) + "|" + side + "|" + sym; let o = om.get(k); if (!o) { o = { sym, seg, date, time, side, qty: 0, val: 0 }; om.set(k, o); } o.qty += qty; o.val += qty * px; if (time < o.time) o.time = time; }
  const orders = [...om.values()].map(o => ({ ...o, px: o.val / o.qty })).sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : b.side - a.side);
  const by = new Map(); orders.forEach(o => { const k = o.sym + "|" + o.seg; if (!by.has(k)) by.set(k, []); by.get(k).push(o); });
  const cyc = [], open = [], unm = [];
  for (const [, L] of by) { let c = null, lots = [], pos = 0;
    L.forEach((o, i) => { let q = o.qty;
      while (q > 1e-9 && pos !== 0 && Math.sign(pos) !== o.side) { const lot = lots[0], m = Math.min(lot.q, q); c.pnl += (o.px - lot.px) * m * c.side; c.ev += lot.px * m; c.xv += o.px * m; c.qm += m; lot.q -= m; q -= m; pos += o.side * m; if (lot.q <= 1e-9) lots.shift(); c.c = o.time; c.n++;
        if (Math.abs(pos) < 1e-9) { pos = 0; lots = []; cyc.push(fin(c)); c = null; } }
      if (q > 1e-9) { if (pos === 0) { if (o.side === -1 && o.seg === "EQ" && !L.slice(i + 1).some(x => x.date === o.date && x.side === 1)) { unm.push({ sym: o.sym, date: o.date, qty: q, px: o.px }); return; }
          c = { sym: o.sym, seg: o.seg, side: o.side, o: o.time, c: o.time, pnl: 0, ev: 0, xv: 0, mq: 0, qm: 0, n: 0 }; }
        lots.push({ q, px: o.px }); pos += o.side * q; c.mq = Math.max(c.mq, Math.abs(pos)); c.n++; } });
    if (c && pos !== 0) { const tq = lots.reduce((a, l) => a + l.q, 0); open.push({ sym: c.sym, seg: c.seg, side: c.side, qty: tq, avg: lots.reduce((a, l) => a + l.q * l.px, 0) / tq, since: c.o.slice(0, 10), part: c.pnl }); } }
  return { orders, cyc: cyc.sort((a, b) => a.c < b.c ? -1 : 1), open, unm };
  function fin(c) { const od = c.o.slice(0, 10), cd = c.c.slice(0, 10); return { ...c, od, cd, intra: od === cd, days: Math.round((Date.parse(cd) - Date.parse(od)) / 864e5), ret: c.ev ? c.pnl / c.ev * 100 : 0 }; } }
function stats(cyc, orders) {
  const n = cyc.length, W = cyc.filter(t => t.pnl > 0), L = cyc.filter(t => t.pnl <= 0), gp = W.reduce((a, t) => a + t.pnl, 0), gl = -L.reduce((a, t) => a + t.pnl, 0), net = gp - gl;
  let cum = 0, peak = 0, dd = 0, ddAt = "", streak = 0, maxStreak = 0; const curve = cyc.map(t => { cum += t.pnl; peak = Math.max(peak, cum); if (peak - cum > dd) { dd = peak - cum; ddAt = t.cd; } streak = t.pnl <= 0 ? streak + 1 : 0; maxStreak = Math.max(maxStreak, streak); return [t.cd, cum, peak]; });
  const avgW = W.length ? gp / W.length : 0, avgL = L.length ? gl / L.length : 0, hw = W.length ? W.reduce((a, t) => a + t.days, 0) / W.length : 0, hl = L.length ? L.reduce((a, t) => a + t.days, 0) / L.length : 0;
  const grp = (f) => { const m = new Map(); cyc.forEach(t => { const k = f(t); const g = m.get(k) || { k, n: 0, w: 0, p: 0 }; g.n++; if (t.pnl > 0) g.w++; g.p += t.pnl; m.set(k, g); }); return [...m.values()]; };
  const turnover = orders.reduce((a, o) => a + o.val, 0), days = new Set(orders.map(o => o.date)).size;
  const after = cyc.filter(t => cyc.some(x => x.cd === t.od && x.c < t.o && x.pnl < 0)), afterP = after.reduce((a, t) => a + t.pnl, 0);
  const perDay = grp(t => t.od).sort((a, b) => b.n - a.n);
  return { n, W: W.length, L: L.length, wr: n ? W.length / n * 100 : 0, gp, gl, net, pf: gl ? gp / gl : gp ? Infinity : 0, avgW, avgL, pay: avgL ? avgW / avgL : 0, exp: n ? net / n : 0, best: cyc.reduce((a, t) => !a || t.pnl > a.pnl ? t : a, null), worst: cyc.reduce((a, t) => !a || t.pnl < a.pnl ? t : a, null), dd, ddAt, maxStreak, curve, hw, hl, turnover, days, after, afterP,
    month: grp(t => t.cd.slice(0, 7)).sort((a, b) => a.k < b.k ? -1 : 1), sym: grp(t => t.sym), kind: grp(t => t.side === -1 ? "short" : t.intra ? "intra" : "deliv"), wd: grp(t => new Date(t.od + "T12:00:00").getDay()), hr: grp(t => +t.o.slice(11, 13)), perDay }; }
/* ---------- demo data ---------- */
function demoData() { const syms = ["TATAMOTORS", "INFY", "HDFCBANK", "RELIANCE", "BEL", "HAL", "TITAN", "DIXON", "IRFC", "ZOMATO", "SBIN", "LT", "TRENT", "POLYCAB", "BSE", "CDSL"], ex = []; let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647, pad = n => String(n).padStart(2, "0"); let d = new Date("2026-04-02T12:00:00"), id = 1;
  while (d < new Date("2026-11-15")) { if (d.getDay() > 0 && d.getDay() < 6 && r() < .55) { const k = 1 + Math.floor(r() * 3);
      for (let j = 0; j < k; j++) { const sym = syms[Math.floor(r() * syms.length)], px = 100 + Math.floor(r() * 3000), q = Math.max(1, Math.round(60000 / px)), intra = r() < .55, edge = (r() - .44) * (intra ? .03 : .12), h = 9 + Math.floor(r() * 5), mi = pad(15 + Math.floor(r() * 40)), date = d.toISOString().slice(0, 10);
        ex.push([sym, "EQ", date, `${date}T${pad(h)}:${mi}:00`, 1, q, px, String(id++), "o" + id, "NSE"]);
        let ed = new Date(d); if (!intra) { ed.setDate(ed.getDate() + 1 + Math.floor(r() * (edge < 0 ? 14 : 8))); while (ed.getDay() === 0 || ed.getDay() === 6) ed.setDate(ed.getDate() + 1); }
        const edate = ed.toISOString().slice(0, 10); ex.push([sym, "EQ", edate, `${edate}T${pad(intra ? Math.min(15, h + 1 + Math.floor(r() * 2)) : 10 + Math.floor(r() * 5))}:${pad(Math.floor(r() * 59))}:00`, -1, q, +(px * (1 + edge)).toFixed(2), String(id++), "o" + id, "NSE"]); } }
    d.setDate(d.getDate() + 1); }
  const pnl = { summary: { Charges: 9840, "Other Credit & Debit": -2310, "Realized P&L": 0, "Unrealized P&L": -6200 }, heads: [["Securities Transaction Tax", 6120], ["Brokerage", 1450], ["Exchange Transaction Charges", 690], ["Stamp Duty", 820], ["Integrated GST", 380], ["SEBI Turnover Fees", 25]], syms: [], period: "2026-04-01 to 2026-11-15", od: [["DP Charges for Sale of TITAN", "2026-06-02", 15.34, 0], ["Interest for MTF funded value", "2026-07-01", 210, 0], ["AMC for Demat Account", "2026-08-14", 88.5, 0]] };
  const A = analyze(ex); pnl.summary["Realized P&L"] = Math.round(A.cyc.reduce((a, t) => a + t.pnl, 0)); return { ex, pnl }; }
async function readFile(f) { const buf = await f.arrayBuffer(); return parseSheets(/\.csv$/i.test(f.name) ? readCsv(new TextDecoder().decode(buf)) : await readXlsx(buf), f.name); }
window.TK = { readXlsx, readCsv, parseSheets, readFile, analyze, stats, demoData };
})();
