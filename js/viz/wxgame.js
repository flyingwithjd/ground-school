// Flight-category drill (AIM 7-1; AWH): made-up METARs and TAFs, never current weather. Name the category; the answer
// shows which group decided it. VFR: ceiling above 3,000 ft and visibility above 5 SM. MVFR: ceiling 1,000–3,000 ft
// and/or visibility 3–5 SM. IFR: ceiling 500 to below 1,000 ft and/or visibility 1 to below 3 SM. LIFR: ceiling below
// 500 ft and/or visibility below 1 SM. The worse of the two decides. Controls sit on top so nothing below moves them.
import { frame, chips, row } from "./base.js?v=4d40905da2";
import { h, esc } from "../core/util.js?v=4d40905da2";
const CATS = ["VFR", "MVFR", "IFR", "LIFR"];
const VIS = [["1/4SM", 0.25], ["1/2SM", 0.5], ["3/4SM", 0.75], ["1SM", 1], ["1 1/2SM", 1.5], ["2SM", 2], ["3SM", 3], ["4SM", 4], ["5SM", 5], ["6SM", 6], ["10SM", 10]];
const IDS = ["KXQA", "KXRB", "KXTC", "KXVD", "KXWE"];
const catOf = (ceil, vis) => { const c = ceil == null ? 1e9 : ceil; const cc = c < 500 ? 3 : c < 1000 ? 2 : c <= 3000 ? 1 : 0, vc = vis < 1 ? 3 : vis < 3 ? 2 : vis <= 5 ? 1 : 0; return { cat: Math.max(cc, vc), cc, vc }; };
let seed = (Date.now() % 100000) + 7; const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); const pick = (a) => a[Math.floor(R() * a.length)];
// one weather "state": wind, visibility (+weather), sky. Aims at a category but the truth is always computed from the groups.
function state(target) {
  const vi = { 0: [9, 10], 1: [6, 7, 8, 9, 10], 2: [3, 4, 5, 9, 10], 3: [0, 1, 2, 6, 7] }[target];
  const [vs, vis] = VIS[pick(vi)];
  const ceilBy = { 0: [40, 50, 70, 120, null], 1: [10, 15, 20, 25, 30, 45], 2: [5, 6, 8, 9, 30], 3: [1, 2, 3, 4, 20] }[target];
  let ceil = pick(ceilBy); const vc = catOf(null, vis).vc; if (vc < target && (ceil == null || catOf(ceil * 100, 10).cc < target)) ceil = { 1: 20, 2: 7, 3: 3 }[target];
  const sky = []; const low = ceil == null ? null : ceil;
  if (R() < 0.45 && (low == null || low > 2)) { const f = Math.max(1, (low ?? 60) - 1 - Math.floor(R() * 4)); sky.push((R() < 0.5 ? "FEW" : "SCT") + String(Math.min(f, 99)).padStart(3, "0")); }   // a trap: few/scattered isn't a ceiling
  if (low != null) sky.push((target === 3 && R() < 0.3 ? "VV" : R() < 0.5 ? "BKN" : "OVC") + String(low).padStart(3, "0"));
  if (!sky.length) sky.push(R() < 0.5 ? "SKC" : "CLR");
  const wx = vis < 1 ? pick(["FG", "BR", "-SN", "+RA"]) : vis < 3 ? pick(["BR", "-RA", "HZ"]) : vis <= 5 ? pick(["HZ", "BR", "-RA", ""]) : "";
  const wd = String(10 * Math.floor(R() * 36) + 10).padStart(3, "0"), ws = String(3 + Math.floor(R() * 15)).padStart(2, "0");
  const ceilFt = (() => { for (const s of sky) { const m = s.match(/^(BKN|OVC|VV)(\d{3})/); if (m) return +m[2] * 100; } return null; })();
  return { groups: [`${wd}${ws}KT`, vs, ...(wx ? [wx] : []), ...sky], vis, ceil: ceilFt };
}
function why(st) { const { cat, cc, vc } = catOf(st.ceil, st.vis);
  const cTxt = st.ceil == null ? "no ceiling (nothing broken, overcast or obscured)" : `ceiling ${st.ceil.toLocaleString()} ft → ${CATS[cc]}`;
  const vTxt = `visibility ${st.vis < 1 ? String(st.vis).replace("0.25", "1/4").replace("0.5", "1/2").replace("0.75", "3/4") : st.vis} SM → ${CATS[vc]}`;
  const trap = st.groups.some((g) => /^(FEW|SCT)/.test(g)) ? " FEW and SCT layers never count as a ceiling." : "";
  return { cat, txt: `${cTxt}; ${vTxt}. The worse one decides: ${CATS[cat]}.${trap}`, cc, vc }; }
export function mount(host) {
  const F = frame(host, { cls: "metar wxg capin ctrl-top" }); F.root.insertBefore(F.ctrl, F.stage);
  const wrap = h("div", { class: "mt-wrap" }); F.stage.prepend(wrap);
  const tag = h("div", { class: "mt-tag" }, "Made-up report · not current weather · do not use for flight");
  const rep = h("div", { class: "wg-rep", "aria-live": "polite" }), q = h("div", { class: "wg-q" }), out = h("div", { class: "mt-det", "aria-live": "polite" });
  wrap.append(tag, rep, q, out);
  let mode = "metar", cur = null, right = 0, n = 0, answered = false;
  chips(row(F.ctrl), [["metar", "METAR"], ["taf", "TAF"]], mode, (v) => { mode = v || mode; next(); }, { label: "Report" });
  const arow = row(F.ctrl, "Your call"); const ab = h("div", { class: "chips", role: "group", "aria-label": "flight category" }); arow.append(ab);
  const btns = CATS.map((c) => { const b = h("button", { class: "chip", type: "button" }, c); b.addEventListener("click", () => answer(c)); ab.append(b); return b; });
  const nx = h("button", { class: "chip", type: "button" }, "Next report →"); nx.addEventListener("click", next); ab.append(nx);
  function next() { answered = false; btns.forEach((b) => { b.classList.remove("on", "wrong"); b.disabled = false; });
    const id = pick(IDS), day = 10 + Math.floor(R() * 18), hr = 6 + Math.floor(R() * 12);
    if (mode === "metar") { const st = state(Math.floor(R() * 4)); const t = `METAR ${id} ${day}${String(hr).padStart(2, "0")}53Z ${st.groups.join(" ")} ${pick(["18/12", "22/19", "08/07", "M02/M04", "15/14"])} A${pick(["2992", "3001", "2978", "2965"])}`;
      cur = { st, text: t }; rep.textContent = t; q.textContent = "What is the flight category right now?"; }
    else { const a = state(Math.floor(R() * 2)), b = state(1 + Math.floor(R() * 3)), c = state(Math.floor(R() * 3));
      const h0 = 12, h1 = 15 + Math.floor(R() * 4), h2 = h1 + 4 + Math.floor(R() * 4), when = pick([[h0 + 1, a], [h1 + 1, b], [h1 + 2, b], [h2 % 24 + 1, c]]);
      const fm = (hh) => `FM${day + (hh >= 24 ? 1 : 0)}${String(hh % 24).padStart(2, "0")}00`;
      const tg = (x) => x.groups.map((gg) => (gg === "10SM" ? "P6SM" : gg)).join(" ");   // TAFs say P6SM for more than 6 SM
      const t = `TAF ${id} ${day}1130Z ${day}12/${day + 1}12 ${tg(a)} ${fm(h1)} ${tg(b)} ${fm(h2)} ${tg(c)}`;
      cur = { st: when[1], text: t, at: when[0] % 24 }; rep.textContent = t; q.textContent = `What category is forecast at ${String(when[0] % 24).padStart(2, "0")}00Z?`; }
    out.innerHTML = `<p class="dim">Find the lowest broken, overcast or obscured layer, then the visibility. Pick a category above.</p>`;
    F.caption(n ? `${right} of ${n} right` : "New drill", mode === "metar" ? "Name the category" : "Read the forecast"); }
  function answer(c) { if (answered) return; answered = true; n++; const w = why(cur.st), good = CATS[w.cat] === c; if (good) right++;
    btns.forEach((b) => { b.disabled = true; if (b.textContent === CATS[w.cat]) b.classList.add("on"); else if (b.textContent === c) b.classList.add("wrong"); });
    const rx = new RegExp(`\\b(${cur.st.groups.map((g) => g.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|")})\\b`, "g");
    if (mode === "metar") rep.innerHTML = esc(cur.text).replace(rx, (m) => (/^(BKN|OVC|VV)|SM$/.test(m) ? `<b class="acc">${m}</b>` : m));
    out.innerHTML = `<span class="label">${good ? "Right" : "Not quite"}</span><h4>${CATS[w.cat]}</h4><p>${esc(mode === "taf" ? `At ${String(cur.at).padStart(2, "0")}00Z the group in effect is the one that started most recently. ` : "")}${esc(w.txt.charAt(0).toUpperCase() + w.txt.slice(1))}</p>`;
    F.caption(`${right} of ${n} right`, good ? "Right" : `It's ${CATS[w.cat]}`); }
  F.explain(`VFR: ceiling above 3,000 ft and visibility above 5 SM. MVFR: ceiling 1,000 to 3,000 ft and/or visibility 3 to 5 SM. IFR: ceiling 500 to below 1,000 ft and/or visibility 1 to below 3 SM. LIFR: ceiling below 500 ft and/or visibility below 1 SM. A ceiling is the lowest broken or overcast layer, or the vertical visibility into an obscuration. Categories are a quick picture, not the legal minimums for your airspace. <span class="src">AIM 7-1 · AWH · 14 CFR 1.1</span>`);
  next();
  return { destroy: () => F.destroy() };
}
