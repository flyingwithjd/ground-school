// Graphical Forecasts for Aviation, the idea (AWH 27, 28; aviationweather.gov GFA help): a made-up region where a low moves
// east over 18 hours. Pick a layer (flight category, clouds, surface) and slide the forecast hour; your route is checked
// against the worst conditions along it. Category colors follow the GFA: VFR green, MVFR blue, IFR red, LIFR magenta.
// Static scene: draws only on change.
import { slider, chips, row } from "./base.js?v=fa1f959704";
import { pxScene, T, L, C, P, R, ACC, INK, GRAY } from "./kit.js?v=fa1f959704";
const CAT = [["VFR", "#4ADE80"], ["MVFR", "#60A5FA"], ["IFR", "#F87171"], ["LIFR", "#E879F9"]];
function wx(x, y, t) {   // made-up field: a low centered at (cx, 30) drifting east
  const cx = 22 + 3.4 * t, d = Math.hypot((x - cx) / 1.7, y - 30);
  const ceil = d > 26 ? null : Math.round((300 + d * d * 14) / 100) * 100, vis = d < 5 ? 0.75 : d < 9 ? 2 : d < 14 ? 4 : 10;
  const cov = d < 11 ? "OVC" : d < 17 ? "BKN" : d < 23 ? "SCT" : d < 28 ? "FEW" : "CLR", top = Math.round((14000 - d * 380) / 1000) * 1000;
  const c = ceil == null ? 1e9 : ceil, cat = Math.max(c < 500 ? 3 : c < 1000 ? 2 : c <= 3000 ? 1 : 0, vis < 1 ? 3 : vis < 3 ? 2 : vis <= 5 ? 1 : 0);
  return { d, ceil, vis, cov, top, cat, rain: d < 10 ? (d < 5 ? "+RA" : "-RA") : "", cx };
}
const mix = (hex, op) => { const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(10 + (v - 10) * op)); return `rgb(${c.join(",")})`; };   /* opaque blend over the dark stage, so overlapping runs leave no seams */
const halo = (t) => { t.setAttribute("stroke", "#0a0a0a"); t.setAttribute("stroke-width", 3); t.setAttribute("paint-order", "stroke"); return t; };
export function mount(host) {
  let layer = "cat", hr = 6;
  const S = pxScene(host, { cls: "gfa", corners: { tl: "GFA (made up)", tr: "AWH 27" } }, draw);
  chips(row(S.F.ctrl), [["cat", "Ceiling & visibility"], ["cld", "Clouds"], ["sfc", "Surface"]], layer, (v) => { layer = v || layer; S.redraw(); }, { label: "Layer" });
  slider(row(S.F.ctrl), { label: "Forecast", min: 0, max: 18, step: 3, value: hr, fmt: (x) => (x ? `+${x} h` : "now"), oninput: (x) => { hr = x; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, k = Math.min((W - 8) / 100, (H - top - 22) / 60), ox = W / 2 - 50 * k, oy = top + 2, m = (x, y) => [ox + x * k, oy + y * k];
    // fine grid, drawn as horizontal runs of equal value so edges look smooth without thousands of elements
    const nx = ph ? 60 : 100, ny = ph ? 36 : 60, cw = 100 / nx, chh = 60 / ny;
    if (layer !== "sfc") for (let j = 0; j < ny; j++) { let run = null;
      const val = (i) => { const w = wx((i + 0.5) * cw, (j + 0.5) * chh, hr); return layer === "cat" ? w.cat : { CLR: 0, FEW: 1, SCT: 2, BKN: 3, OVC: 4 }[w.cov]; };
      const flush = (i1) => { if (!run) return; const [a, b] = m(run.i * cw, j * chh), wpx = (i1 - run.i) * cw * k + 0.6, hpx = chh * k + 0.6, v = run.v;
        if (layer === "cat") R(g, a, b, wpx, hpx, { fill: mix(CAT[v][1], 0.28 + 0.1 * v) }); else if (v) R(g, a, b, wpx, hpx, { fill: mix("#F2F1EC", [0, 0.12, 0.25, 0.45, 0.65][v] * 0.6) }); };
      for (let i = 0; i <= nx; i++) { const v = i < nx ? val(i) : -1; if (!run || v !== run.v) { flush(i); run = { i, v }; } } }
    // route A → B and the worst condition along it
    const A = [8, 50], B = [92, 14]; let worst = 0, wpt = null; for (let s = 0; s <= 40; s++) { const x = A[0] + (B[0] - A[0]) * s / 40, y = A[1] + (B[1] - A[1]) * s / 40, w = wx(x, y, hr); if (w.cat > worst || !wpt) { if (w.cat >= worst) { worst = w.cat; wpt = [x, y, w]; } } }
    const [a1, b1] = m(...A), [a2, b2] = m(...B); L(g, a1, b1, a2, b2, { stroke: INK, w: 2.4, dash: "8 5" });
    for (const [p, lab] of [[[a1, b1], "A"], [[a2, b2], "B"]]) { C(g, p[0], p[1], 5, { fill: INK }); T(g, p[0] + (lab === "A" ? 8 : -8), p[1] + (lab === "A" ? 4 : -8), lab, { size: 12, weight: 700, fill: INK, anchor: lab === "A" ? "start" : "end" }); }
    if (worst > 0) { const [wa, wb] = m(wpt[0], wpt[1]); C(g, wa, wb, 8, { stroke: ACC, sw: 2.4 }); }
    if (layer === "sfc") { const [rax, ray] = m(wx(0, 30, hr).cx, 30); for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) { const x = 6 + i * 11, y = 7 + j * 11.5, w = wx(x, y, hr), dx = x - w.cx, dy = y - 30, an = Math.atan2(dy, dx) - Math.PI / 2 - 0.45, spd = Math.round(Math.max(5, 32 - w.d * 0.9) / 5) * 5, len = 6 + spd * 0.35; const [a, b] = m(x, y);
        // counterclockwise and in toward the low (screen y points down, so "counterclockwise" is a decreasing angle)
        const ux = Math.cos(an), uy = Math.sin(an); L(g, a - ux * len / 2, b - uy * len / 2, a + ux * len / 2, b + uy * len / 2, { stroke: INK, w: 1.6 });
        P(g, `M${a + ux * len / 2},${b + uy * len / 2} l${-ux * 5 + uy * 3},${-uy * 5 - ux * 3} M${a + ux * len / 2},${b + uy * len / 2} l${-ux * 5 - uy * 3},${-uy * 5 + ux * 3}`, { stroke: INK, w: 1.6 });
        if ((!ph || (i + j) % 2 === 0) && !(Math.abs(a + 14 - rax) < 30 && Math.abs(b + 8 - ray) < 16)) halo(T(g, a + 6, b + 12, String(spd), { size: 11, fill: GRAY })); }
      const c0 = wx(0, 30, hr).cx, [ra, rb] = m(c0, 30); C(g, ra, rb, 10 * k, { fill: "rgba(96,165,250,.18)", stroke: "rgba(96,165,250,.5)", sw: 1, dash: "4 3" }); halo(T(g, ra, rb + 4, "RA", { size: 12, weight: 700, fill: ACC, anchor: "middle" })); }
    if (layer === "cld") { for (const [x, y] of [[20, 12], [36, 47], [70, 33]]) { const w = wx(x, y, hr), [a, b] = m(x, y); const s1 = w.cov === "CLR" ? "CLR" : `${w.cov} ${w.ceil != null && (w.cov === "BKN" || w.cov === "OVC") ? String(w.ceil / 100).padStart(3, "0") : ""}`.trim(), s2 = w.cov === "BKN" || w.cov === "OVC" ? `TOP ${String(w.top / 100).padStart(3, "0")}` : "";
      C(g, a, b, 3, { fill: INK }); halo(T(g, a + 6, b - 2, s1, { size: 11, fill: INK, weight: 600 })); if (s2) halo(T(g, a + 6, b + 11, s2, { size: 11, fill: GRAY })); } }
    // legend
    if (layer === "cat") CAT.forEach(([n, col], i) => { const x = ox + 4 + i * (ph ? 56 : 66), y = oy + 60 * k + 15; R(g, x, y - 9, 10, 10, { fill: col, op: 0.7 }); T(g, x + 14, y, n, { size: 11, fill: GRAY }); });
    else T(g, ox + 4, oy + 60 * k + 15, layer === "cld" ? "bases and tops in hundreds of ft MSL" : "wind kt · RA rain area", { size: 11, fill: GRAY });
    const ww = wpt[2], why = worst === 0 ? "VFR all the way" : `${CAT[worst][0]} · ${[ww.ceil != null && ww.ceil <= 3000 ? ww.ceil.toLocaleString() + " ft" : "", ww.vis <= 5 ? ww.vis + " SM" : ""].filter(Boolean).join(", ")}`;
    S.F.caption(`A to B · ${hr ? "+" + hr + " h" : "now"} · worst on the route`, why);
    S.F.explain(`The GFA puts observations and forecasts for the next 18 hours on one zoomable map: ceiling and visibility (flight category), clouds (coverage, bases and tops in feet MSL), precipitation, thunderstorms, winds, icing and turbulence, with AIRMETs and SIGMETs overlaid. Slide the time and watch the low cross your route. The grids are computer-model output, so check the TAFs and METARs for the airports you'll use. This forecast is made up, never current weather. <span class="src">AWH 27, 28 · aviationweather.gov GFA</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
