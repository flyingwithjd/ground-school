// VSI lag (PHAK FAA-H-8083-25C ch 8): raise the nose into a 500 fpm climb and watch a conventional VSI show the trend at
// once and settle on the rate after about 6–9 seconds; an IVSI responds almost at once. Illustrative numbers. Static scene.
import { slider, chips, row } from "./base.js?v=27c70f9d2b";
import { pxScene, T, L, C, P, ACC, INK, GRAY } from "./kit.js?v=27c70f9d2b";
const D = Math.PI / 180, VS = 500, TMAX = 12;
const real = (t) => VS * (1 - Math.exp(-t / 0.5));
const ind = (t, tau) => { const a = 0.5, b = tau; return t <= 0 ? 0 : VS * (1 - (b * Math.exp(-t / b) - a * Math.exp(-t / a)) / (b - a)); };
export function mount(host) {
  let t = 3, kind = "vsi";
  const S = pxScene(host, { cls: "vsil", corners: { tl: "Raise the nose · illustrative", tr: "PHAK 8" } }, draw);
  chips(row(S.F.ctrl), [["vsi", "VSI"], ["ivsi", "Instantaneous VSI"]], kind, (v) => { kind = v || kind; S.redraw(); }, { label: "Instrument" });
  slider(row(S.F.ctrl), { label: "Seconds", min: 0, max: TMAX, step: 1, value: t, fmt: (v) => `${v} s`, oninput: (v) => { t = +v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, tau = kind === "vsi" ? 2.2 : 0.35, iv = Math.round(ind(t, tau) / 10) * 10;
    const r = Math.min((H - top) * 0.42, ph ? W * 0.2 : W * 0.15), dx = 14 + r, dy = top + (H - top) / 2;
    // dial: 0 at 9 o'clock, climb clockwise up to 2,000 fpm at about 3 o'clock
    C(g, dx, dy, r, { stroke: INK, sw: 2, fill: "#0d0d0e" });
    const ang = (v) => (180 + (v / 2000) * 170) * D;
    for (let v = -2000; v <= 2000; v += 500) { const a = ang(v), big = v % 1000 === 0; L(g, dx + Math.cos(a) * r * (big ? 0.78 : 0.86), dy + Math.sin(a) * r * (big ? 0.78 : 0.86), dx + Math.cos(a) * r * 0.95, dy + Math.sin(a) * r * 0.95, { stroke: INK, w: big ? 2 : 1.2 });
      if (big && r > 50) T(g, dx + Math.cos(a) * r * 0.6, dy + Math.sin(a) * r * 0.6 + 4, String(Math.abs(v / 1000)), { size: 11, anchor: "middle", fill: GRAY }); }
    T(g, dx, dy + r * 0.45, "UP ↑  ×1000", { size: 11, anchor: "middle", fill: GRAY });
    const a = ang(iv); L(g, dx, dy, dx + Math.cos(a) * r * 0.85, dy + Math.sin(a) * r * 0.85, { stroke: ACC, w: 3 }); C(g, dx, dy, 4, { fill: ACC });
    // graph
    const gx = dx + r + (ph ? 22 : 40), gw = W - gx - 14, gy = top + 14, gh = H - top - 44, X = (s) => gx + (s / TMAX) * gw, Y = (v) => gy + gh - (v / 600) * gh;
    L(g, gx, Y(0), gx + gw, Y(0), { stroke: GRAY, w: 1 }); L(g, gx, gy, gx, Y(0), { stroke: GRAY, w: 1 });
    L(g, gx, Y(VS), gx + gw, Y(VS), { stroke: "rgba(242,241,236,.2)", w: 1, dash: "3 5" }); T(g, gx + gw, Y(VS) + 16, "500 fpm", { size: 11, anchor: "end", fill: GRAY });
    for (let s = 0; s <= TMAX; s += 3) T(g, X(s), Y(0) + 16, `${s}s`, { size: 11, anchor: "middle", fill: GRAY });
    let d1 = "", d2 = ""; for (let s = 0; s <= TMAX + 1e-9; s += 0.1) { d1 += (s ? "L" : "M") + X(s).toFixed(1) + "," + Y(real(s)).toFixed(1); d2 += (s ? "L" : "M") + X(s).toFixed(1) + "," + Y(ind(s, tau)).toFixed(1); }
    P(g, d1, { stroke: INK, w: 1.6, dash: "5 4" }); P(g, d2, { stroke: ACC, w: 2.4 });
    L(g, X(t), gy, X(t), Y(0), { stroke: "rgba(242,241,236,.35)", w: 1 }); C(g, X(t), Y(ind(t, tau)), 4.5, { fill: ACC });
    T(g, gx + gw, Y(0) - 26, "dashed: actual", { size: 11, anchor: "end", fill: GRAY }); T(g, gx + gw, Y(0) - 10, "blue: shown", { size: 11, anchor: "end", fill: ACC });
    const pct = Math.round((ind(t, tau) / VS) * 100);
    S.F.caption(`${t} s after raising the nose · actual climb ${Math.round(real(t) / 10) * 10} fpm`, t === 0 ? "Needle still at zero" : pct >= 95 ? `Settled: ${iv} fpm` : `Trend up, reads ${iv} fpm`);
    S.F.explain(kind === "vsi" ? `The needle moves the right way at once (trend), but the calibrated leak makes it lag: a stable rate takes about 6–9 seconds, longer in rough air. Set the attitude, hold it, and let the VSI catch up instead of chasing it. <span class="src">PHAK 8</span>` : `An instantaneous VSI (IVSI) adds accelerometers that push the needle at the start of a pitch change, so the lag nearly disappears. <span class="src">PHAK 8</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
