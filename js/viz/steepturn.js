// Steep turn forces (PHAK 5; AFH FAA-H-8083-3C ch 10; ACS PA.V.A): a rear view of an airplane in a level, coordinated
// turn. Lift tilts with the wings; its vertical part must still equal weight, so total lift (load factor) grows as
// 1/cos(bank) and the stall speed by √(load factor). Turn rate and radius are shown for 100 knots true airspeed.
// Static scene: draws only on change.
import { slider, row } from "./base.js?v=27c70f9d2b";
import { pxScene, T, L, C, P, R, ACC, INK, GRAY } from "./kit.js?v=27c70f9d2b";
const D = Math.PI / 180;
export function mount(host) {
  let bank = 45;
  const S = pxScene(host, { cls: "sturn", corners: { tl: "Rear view", tr: "PHAK 5 · AFH 10" } }, draw);
  slider(row(S.F.ctrl), { label: "Bank", min: 0, max: 60, step: 5, value: bank, fmt: (v) => `${v}°`, oninput: (v) => { bank = +v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, n = 1 / Math.cos(bank * D), vs = Math.sqrt(n), tn = Math.tan(bank * D);
    const tp = ph ? top + 48 : top, cx = ph ? W / 2 : W * 0.33, cy = ph ? tp + (H - tp) * 0.5 : top + (H - top) * 0.55, k = Math.min(ph ? W * 0.32 : W * 0.2, (H - tp) * 0.34);
    // horizon reference
    L(g, 12, cy, ph ? W - 12 : W * 0.62, cy, { stroke: "rgba(242,241,236,.18)", w: 1, dash: "4 6" });
    const a = bank * D, ca = Math.cos(a), sa = Math.sin(a), rot = (x, y) => [cx + x * ca - y * sa, cy + x * sa + y * ca];   // right turn: right wing down on screen
    // airplane, rear view
    const wl = rot(-k * 0.95, 0), wr = rot(k * 0.95, 0); L(g, ...wl, ...wr, { stroke: INK, w: 3 });
    C(g, cx, cy, k * 0.13, { fill: "#111113", stroke: INK, sw: 2 });
        // forces: weight down (fixed), lift along the airplane's vertical axis (scaled by n)
    const u = k * 0.62, wy = cy + u;
    L(g, cx, cy + k * 0.15, cx, wy, { stroke: GRAY, w: 2.4, arrow: "kahg" }); T(g, cx - 8, wy - 2, "weight", { size: 11, fill: GRAY, anchor: "end" });
    const lx = cx + Math.sin(bank * D) * u * n, ly = cy - Math.cos(bank * D) * u * n;
    L(g, cx, cy, lx, ly, { stroke: ACC, w: 3, arrow: true });
    if (bank > 0) { L(g, cx, cy, cx, cy - u, { stroke: "rgba(242,241,236,.65)", w: 1.6, dash: "4 4" }); L(g, cx, cy - u, lx, ly, { stroke: "rgba(242,241,236,.65)", w: 1.6, dash: "4 4" });
      if (bank >= 25) { const tt = T(g, (cx + lx) / 2, cy - u - 8, "turns", { size: 11, fill: INK, anchor: "middle" }); tt.setAttribute("stroke", "#0a0a0a"); tt.setAttribute("stroke-width", 3); tt.setAttribute("paint-order", "stroke"); } }
    const lt = T(g, lx + (bank > 25 ? 8 : 10), ly + (bank > 25 ? -4 : 10), "lift", { size: 12, weight: 700, fill: ACC }); lt.setAttribute("stroke", "#0a0a0a"); lt.setAttribute("stroke-width", 3); lt.setAttribute("paint-order", "stroke");
    // readouts
    const rx = ph ? 16 : W * 0.66, ry = ph ? top + 6 : top + 26, lh = ph ? 18 : 24;
    const rate = bank ? (1091 * tn) / 100 : 0, rad = bank ? (168.8 * 168.8) / (32.17 * tn) : null;
    const rows = [["Load factor", `${n.toFixed(2)} G`], ["Stall speed", `+${Math.round((vs - 1) * 100)}%`], ["Turn rate", bank ? `${rate.toFixed(1)}°/s` : "0°/s"], ["Radius", rad ? `${Math.round(rad / 10) * 10} ft` : "straight"]];
    if (ph) { rows.forEach(([l, v], i) => { const x = 16 + (i % 2) * (W - 32) / 2, y = ry + Math.floor(i / 2) * 22; T(g, x, y, l, { size: 11, fill: GRAY }); T(g, x + (W - 32) / 2 - 12, y, v, { size: 13, weight: 700, anchor: "end" }); }); }
    else rows.forEach(([l, v], i) => { T(g, rx, ry + i * lh * 1.6, l, { size: 11, fill: GRAY }); T(g, rx, ry + i * lh * 1.6 + 18, v, { size: 16, weight: 700 }); });
    if (!ph) T(g, rx, ry + 4 * lh * 1.6 + 4, "rate and radius at 100 KTAS", { size: 11, fill: GRAY });
    const band = bank >= 40 && bank <= 50;
    S.F.caption(band ? "Steep turn range: about 45°, hold ±5°" : bank > 50 ? "Steeper than the steep turn task" : "Shallower than a steep turn", `${bank}° bank · ${n.toFixed(2)} G`);
    S.F.explain(`To hold altitude in a bank, total lift must grow until its vertical part equals the weight again: load factor = 1 ÷ cos(bank). At 45° that's 1.41 G and the stall speed rises about 19%; at 60° it's 2 G and about 41%. The dashed lines split lift into its vertical part, which holds the airplane up, and its horizontal part (labeled turns), which pulls it around the turn. So in a steep turn, add back-pressure and some power, and stay below your airplane's maneuvering speed. Rate and radius are for 100 knots true airspeed. <span class="src">PHAK 5 · AFH 10 · FAA-S-ACS-6C PA.V.A</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
