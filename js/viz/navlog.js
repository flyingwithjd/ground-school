// A one-page navigation log for a fictional three-leg trip (PHAK 16): pick a leg and a wind; the heading chain
// (TC ± WCA = TH, ± variation = MH, ± deviation = CH) and the leg's groundspeed, time and fuel update, with trip totals.
// Static scene: redraws only on input or resize.
import { slider, chips, row } from "./base.js?v=27c70f9d2b";
import { pxScene, T, L, C, P, R, ACC, INK, GRAY, DIM, ACCF, BODY } from "./kit.js?v=27c70f9d2b";
const TAS = 110, GPH = 8.5, VAR = 6;                     // variation 6°E: subtract
const LEGS = [["Riverton", "Bridge", 62, 18], ["Bridge", "Lake", 95, 26], ["Lake", "Cedar Flat", 40, 21]];
const DEV = (mh) => (mh < 90 ? 2 : mh < 180 ? 0 : mh < 270 ? -2 : 1);   // the airplane's compass card (made up)
const n360 = (a) => ((Math.round(a) % 360) + 360) % 360 || 360, d3 = (a) => String(n360(a)).padStart(3, "0") + "°", D = Math.PI / 180;
const sgn = (v) => (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(Math.round(v)) + "°";
function solve(tc, wd, ws) { const a = (wd - tc) * D, wca = Math.asin(Math.max(-1, Math.min(1, (ws * Math.sin(a)) / TAS))) / D; const gs = TAS * Math.cos(wca * D) - ws * Math.cos(a);
  const th = tc + wca, mh = th - VAR, dev = DEV(n360(mh) % 360), ch = mh + dev; return { wca, gs, th, mh, dev, ch }; }
export function mount(host) {
  let leg = 0, wd = 300, ws = 20;
  const S = pxScene(host, { cls: "nlog", corners: { tl: "Navigation log · fictional trip", tr: "PHAK 16" } }, draw);
  chips(row(S.F.ctrl), [["0", "Leg 1"], ["1", "Leg 2"], ["2", "Leg 3"]], "0", (v) => { leg = +v; S.redraw(); }, { label: "Leg" });
  slider(row(S.F.ctrl), { label: "Wind from", min: 0, max: 350, step: 10, value: wd, fmt: (v) => d3(v || 360), oninput: (v) => { wd = v; S.redraw(); } });
  slider(row(S.F.ctrl), { label: "Wind speed", min: 0, max: 40, step: 5, value: ws, fmt: (v) => `${v} kt`, oninput: (v) => { ws = v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = ph ? 10 : 18, x1 = W - (ph ? 10 : 18);
    const res = LEGS.map(([, , tc, dist]) => { const r = solve(tc, wd, ws); return { ...r, tc, dist, ete: (dist / r.gs) * 60, fuel: (dist / r.gs) * GPH }; });
    const cur = res[leg];
    // the route: three legs from left to right, scaled into a strip
    const mh = ph ? 74 : 96; let px = 0, py = 0; const pts = [[0, 0]];
    LEGS.forEach(([, , tc, dist]) => { px += Math.sin(tc * D) * dist; py -= Math.cos(tc * D) * dist; pts.push([px, py]); });
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), mw = x1 - x0 - (ph ? 100 : 220), sc = Math.min(mw / (Math.max(...xs) - Math.min(...xs)), (mh - 16) / (Math.max(...ys) - Math.min(...ys)));
    const mx = (p) => [x0 + (ph ? 36 : 84) + (p[0] - Math.min(...xs)) * sc, top + 8 + (p[1] - Math.min(...ys)) * sc];
    for (let i = 0; i < 3; i++) { const [a, b] = [mx(pts[i]), mx(pts[i + 1])], on = i === leg; L(g, a[0], a[1], b[0], b[1], { stroke: on ? ACC : DIM, w: on ? 3 : 1.5 }); }
    pts.forEach((p, i) => { const [a, b] = mx(p); C(g, a, b, i === 0 || i === 3 ? 5 : 3.5, { stroke: INK, sw: 1.5, fill: "#000" }); });
    { const [a, b] = mx(pts[0]), [c, d] = mx(pts[3]); T(g, a - 9, b + 4, ph ? "RVT" : "RIVERTON", { size: 11, fill: GRAY, anchor: "end" }); T(g, c, d - 10, ph ? "CDF" : "CEDAR FLAT", { size: 11, fill: GRAY, anchor: "middle" }); }
    // wind arrow (blowing toward the route) at the right of the strip
    { const cx = x1 - (ph ? 26 : 40), cy = top + mh / 2, len = ws ? 12 + ws * (ph ? 0.5 : 0.7) : 0, a = (wd + 180) * D;
      C(g, cx, cy, ph ? 22 : 30, { stroke: "rgba(242,241,236,.14)", sw: 1 });
      if (ws) L(g, cx - (Math.sin(a) * len) / 2, cy + (Math.cos(a) * len) / 2, cx + (Math.sin(a) * len) / 2, cy - (Math.cos(a) * len) / 2, { stroke: INK, w: 2, arrow: "kahw" });
      T(g, cx, cy + (ph ? 36 : 46), ws ? `${d3(wd || 360)} @ ${ws}` : "CALM", { size: 11, fill: GRAY, anchor: "middle" }); T(g, cx, cy - (ph ? 26 : 34), "N", { size: 11, fill: DIM, anchor: "middle" }); }
    // the heading chain for this leg
    const boxes = [["TC", d3(cur.tc), "chart"], ["WCA", sgn(cur.wca), cur.wca >= 0 ? "wind right: add" : "wind left: subtract"], ["TH", d3(cur.th), ""], ["VAR", "−" + VAR + "°", "6°E: subtract"], ["MH", d3(cur.mh), ""], ["DEV", sgn(cur.dev), "compass card"], ["CH", d3(cur.ch), "fly this"]];
    const perRow = ph ? 4 : 7, bw = (x1 - x0 - (perRow - 1) * 6) / perRow, bh = ph ? 44 : 58; let y = top + mh + (ph ? 26 : 34);
    T(g, x0, y - 10, `LEG ${leg + 1}: ${LEGS[leg][0].toUpperCase()} → ${LEGS[leg][1].toUpperCase()}`, { size: 11, fill: GRAY });
    boxes.forEach(([k, v, note], i) => { const r = Math.floor(i / perRow), c = i % perRow, bx = x0 + c * (bw + 6), by = y + r * (bh + 8), hi = k === "CH" || k === "WCA";
      R(g, bx, by, bw, bh, { stroke: hi ? ACC : "rgba(242,241,236,.35)", sw: 1.4, fill: hi ? ACCF : BODY, rx: 5 });
      T(g, bx + 8, by + 15, k, { size: 11, fill: GRAY }); T(g, bx + 8, by + (ph ? 34 : 35), v, { size: ph ? 14 : 16, fill: hi ? ACC : INK, weight: 700 });
      if (!ph && note && bw > note.length * 6.9 + 14) T(g, bx + 8, by + bh - 6, note, { size: 11, fill: DIM }); });
    y += (ph ? 2 : 1) * (bh + 8) + (ph ? 8 : 12);
    if (!ph && bw < 140) { T(g, x0, y + 2, `WCA: wind from the ${cur.wca >= 0 ? "right, add" : "left, subtract"} · VAR 6°E: subtract · DEV: from the compass card`, { size: 11, fill: DIM }); y += 22; }
    // numbers for this leg and the trip
    const tot = res.reduce((s, r) => ({ d: s.d + r.dist, t: s.t + r.ete, f: s.f + r.fuel }), { d: 0, t: 0, f: 0 }), resv = GPH / 2;
    if (ph) { const [, , , dist] = LEGS[leg];
      T(g, x0, y + 8, `${dist} NM · GS ${Math.round(cur.gs)} kt · ${Math.round(cur.ete)} min · ${cur.fuel.toFixed(1)} gal`, { size: 12, fill: INK, weight: 600 });
      T(g, x0, y + 28, `TRIP ${tot.d} NM · ${Math.round(tot.t)} min · ${(Math.round(tot.f * 10) / 10 + resv).toFixed(1)} gal with reserve`, { size: 11, fill: GRAY }); }
    else { const cols = [["DIST", `${LEGS[leg][3]} NM`], ["GS", `${Math.round(cur.gs)} kt`], ["ETE", `${Math.round(cur.ete)} min`], ["FUEL", `${cur.fuel.toFixed(1)} gal`]];
      cols.forEach(([k, v], i) => { const cx = x0 + i * 110; T(g, cx, y + 6, k, { size: 11, fill: GRAY }); T(g, cx, y + 26, v, { size: 16, fill: INK, weight: 700 }); });
      T(g, x0, y + 52, `TRIP ${tot.d} NM · ${Math.round(tot.t)} min · ${(Math.round(tot.f * 10) / 10).toFixed(1)} gal + ${resv.toFixed(1)} gal day reserve = ${(Math.round(tot.f * 10) / 10 + resv).toFixed(1)} gal`, { size: 12, fill: GRAY, weight: 600 }); }
    S.F.caption(`Leg ${leg + 1} · wind ${ws ? d3(wd || 360) + " at " + ws + " kt" : "calm"}`, `Fly ${d3(cur.ch)} · ${Math.round(cur.ete)} min`);
    S.F.explain(`True airspeed ${TAS} kt, fuel burn ${GPH} gal/h, variation ${VAR}°E. Each row of a nav log runs the same chain: true course from the chart, wind correction to true heading, variation to magnetic heading, the compass card's deviation to compass heading. Then distance ÷ groundspeed gives the time, and time × fuel burn the fuel. The trip total adds the 30-minute day reserve. <span class="src">PHAK 16 · 14 CFR 91.151</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
