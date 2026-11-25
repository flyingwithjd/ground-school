// FAA-style graphical takeoff chart, redrawn in ink with made-up numbers (PHAK 11 explains reading these charts):
// temperature and pressure altitude → reference line → weight guide lines → reference line → wind guide lines → distance.
// A sample chart for practice only; it isn't from any airplane's POH. Static scene: redraws only on input or resize.
import { slider, row } from "./base.js?v=d4d14c5a28";
import { pxScene, T, L, C, P, ACC, INK, GRAY, DIM } from "./kit.js?v=d4d14c5a28";
const REFW = 2550, D0 = 0, D1 = 5500;
const da = (pa, oat) => pa + 118.8 * (oat - (15 - (2 * pa) / 1000));
const fA = (pa, oat) => 1050 * Math.exp(da(pa, oat) / 9500);                 // over a 50 ft obstacle, at the reference weight, calm
const fW = (d, w) => d * Math.pow(w / REFW, 2.3);
const fV = (d, v) => (v >= 0 ? d * (1 - (0.1 * v) / 9) : d * (1 + (0.1 * -v) / 2));   // headwind −10% per 9 kt, tailwind +10% per 2 kt
const halo = (e) => { e.setAttribute("stroke", "#0a0a0a"); e.setAttribute("stroke-width", 4); e.setAttribute("paint-order", "stroke"); return e; };
export function mount(host) {
  let oat = 25, pa = 4000, w = 2400, v = 10;
  const S = pxScene(host, { cls: "toc", corners: { tl: "Takeoff distance · sample chart", tr: "PHAK 11" } }, draw);
  slider(row(S.F.ctrl), { label: "Temperature", min: -20, max: 40, step: 5, value: oat, fmt: (x) => `${x} °C`, oninput: (x) => { oat = x; S.redraw(); } });
  slider(row(S.F.ctrl), { label: "Pressure alt", min: 0, max: 8000, step: 1000, value: pa, fmt: (x) => `${x.toLocaleString()} ft`, oninput: (x) => { pa = x; S.redraw(); } });
  slider(row(S.F.ctrl), { label: "Weight", min: 1900, max: 2550, step: 50, value: w, fmt: (x) => `${x.toLocaleString()} lb`, oninput: (x) => { w = x; S.redraw(); } });
  slider(row(S.F.ctrl), { label: "Wind", min: -6, max: 20, step: 2, value: v, fmt: (x) => (x > 0 ? `${x} kt head` : x < 0 ? `${-x} kt tail` : "calm"), oninput: (x) => { v = x; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, xL = ph ? 34 : 54, xR = W - (ph ? 38 : 64), y0 = H - (ph ? 34 : 38), y1 = top + 16, gap = ph ? 6 : 14;
    const pw = (xR - xL - 2 * gap), wA = pw * 0.42, wB = pw * 0.3, wC = pw * 0.28;
    const aX0 = xL, aX1 = aX0 + wA, bX0 = aX1 + gap, bX1 = bX0 + wB, cX0 = bX1 + gap, cX1 = cX0 + wC;
    const Y = (d) => y0 - ((Math.min(D1, Math.max(D0, d)) - D0) / (D1 - D0)) * (y0 - y1);
    const XA = (t) => aX0 + ((t + 20) / 60) * wA, XB = (ww) => bX0 + ((REFW - ww) / 650) * wB, XC = (vv) => cX0 + ((vv + 6) / 26) * wC;
    const frame = (x0, x1) => P(g, `M${x0},${y1} V${y0} H${x1} V${y1}`, { stroke: "rgba(242,241,236,.35)", w: 1 });
    frame(aX0, aX1); frame(bX0, bX1); frame(cX0, cX1);
    for (let d = 1000; d <= D1; d += 1000) { L(g, aX0, Y(d), cX1, Y(d), { stroke: "rgba(242,241,236,.07)", w: 1 }); T(g, cX1 + 5, Y(d) + 4, ph ? String(d / 1000) + "k" : d.toLocaleString(), { size: 11, fill: GRAY }); }
    T(g, cX1 + 5, y1 - 4, ph ? "FT" : "FEET", { size: 11, fill: GRAY });
    // panel A: one curve per pressure altitude
    for (let p = 0; p <= 8000; p += 2000) { const pts = []; for (let t = -20; t <= 40; t += 2.5) pts.push([XA(t), Y(fA(p, t))]);
      P(g, "M" + pts.map((q) => q.join(",")).join(" L"), { stroke: p === pa ? ACC : "rgba(242,241,236,.55)", w: p === pa ? 2 : 1.2 });
      const end = pts[pts.length - 1]; if (!ph || p % 4000 === 0) halo(T(g, end[0] - 3, end[1] - 5, p === 0 ? "SL" : (ph ? p / 1000 + "k" : p.toLocaleString()), { size: 11, fill: p === pa ? ACC : GRAY, anchor: "end" })); }
    if (pa % 2000) { const pts = []; for (let t = -20; t <= 40; t += 2.5) pts.push([XA(t), Y(fA(pa, t))]); P(g, "M" + pts.map((q) => q.join(",")).join(" L"), { stroke: ACC, w: 2, dash: "5 4" }); }
    for (const t of ph ? [-20, 40] : [-20, 0, 20, 40]) T(g, XA(t), y0 + 14, String(t), { size: 11, fill: GRAY, anchor: t === -20 ? "start" : t === 40 ? "end" : "middle" });
    T(g, aX0, y0 + 28, "OAT °C", { size: 11, fill: GRAY });
    // panel B: weight guide lines from the reference line (max weight, left edge)
    for (let d = 1000; d <= 5000; d += 1000) { const pts = []; for (let ww = REFW; ww >= 1900; ww -= 50) pts.push([XB(ww), Y(fW(d, ww))]); P(g, "M" + pts.map((q) => q.join(",")).join(" L"), { stroke: "rgba(242,241,236,.3)", w: 1 }); }
    for (const ww of ph ? [2550, 1900] : [2550, 2200, 1900]) T(g, XB(ww), y0 + 14, ph ? (ww / 1000).toFixed(1) + "k" : ww.toLocaleString(), { size: 11, fill: GRAY, anchor: ww === 2550 ? "start" : ww === 1900 ? "end" : "middle" });
    T(g, bX0, y0 + 28, "WEIGHT lb", { size: 11, fill: GRAY });
    // panel C: wind guide lines from the reference line (calm)
    for (let d = 500; d <= 3500; d += 1000) { const pts = []; for (let vv = -6; vv <= 20; vv += 1) pts.push([XC(vv), Y(fV(d, vv))]); P(g, "M" + pts.map((q) => q.join(",")).join(" L"), { stroke: "rgba(242,241,236,.3)", w: 1 }); }
    L(g, XC(0), y1, XC(0), y0, { stroke: "rgba(242,241,236,.55)", w: 1.2, dash: "4 3" });
    for (const vv of [-6, 0, 20]) T(g, XC(vv), y0 + 14, String(Math.abs(vv)), { size: 11, fill: GRAY, anchor: vv < 0 ? "start" : vv > 0 ? "end" : "middle" });
    T(g, cX0, y0 + 28, ph ? "TAIL·HEAD" : "TAIL · HEAD kt", { size: 11, fill: GRAY });
    // the reading
    const d1 = fA(pa, oat), d2 = fW(d1, w), d3 = fV(d2, v), blue = { stroke: ACC, w: 2 };
    L(g, XA(oat), y0, XA(oat), Y(d1), { ...blue, w: 1.4, dash: "3 3" }); C(g, XA(oat), Y(d1), 4, { fill: ACC });
    L(g, XA(oat), Y(d1), bX0, Y(d1), blue);
    { const pts = []; for (let ww = REFW; ww >= w; ww -= 10) pts.push([XB(ww), Y(fW(d1, ww))]); pts.push([XB(w), Y(d2)]); P(g, "M" + pts.map((q) => q.join(",")).join(" L"), blue); }
    L(g, XB(w), Y(d2), XC(0), Y(d2), blue);
    { const pts = []; const st = v >= 0 ? 1 : -1; for (let vv = 0; st > 0 ? vv <= v : vv >= v; vv += st * 0.5) pts.push([XC(vv), Y(fV(d2, vv))]); P(g, "M" + pts.map((q) => q.join(",")).join(" L"), blue); }
    L(g, XC(v), Y(d3), cX1, Y(d3), { ...blue, arrow: true }); C(g, cX1, Y(d3), 4, { fill: ACC });
    g.querySelectorAll("text[paint-order]").forEach((e) => g.appendChild(e));   // altitude labels stay readable above the blue line
    const r50 = Math.round(d3 / 10) * 10;
    S.F.caption(`${pa.toLocaleString()} ft · ${oat} °C · ${w.toLocaleString()} lb · ${v > 0 ? v + " kt headwind" : v < 0 ? -v + " kt tailwind" : "calm"}`, `${r50.toLocaleString()} ft to clear 50 ft`);
    S.F.explain(`Start at the temperature, go up to your pressure altitude, then across to the first reference line. Follow the weight guide lines to your weight, across to the next reference line, along the guide lines to your wind, and across to read the distance. This sample chart is made up for practice; use the chart in your airplane's POH, and add a safety margin because it assumes a new airplane and a skilled pilot. <span class="src">PHAK 11</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
