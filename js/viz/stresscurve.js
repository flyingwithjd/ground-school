// Stress and performance (PHAK FAA-H-8083-25C ch 2, 17): a little stress sharpens you, too much and performance falls
// off fast. Illustrative curve, not data. Slider sets the stress level. Static scene.
import { slider, row } from "./base.js?v=4d40905da2";
import { pxScene, T, L, P, C, ACC, INK, GRAY } from "./kit.js?v=4d40905da2";
const perf = (s) => Math.exp(-((s - 4.5) ** 2) / 8);
export function mount(host) {
  let st = 2;
  const S = pxScene(host, { cls: "stress", corners: { tl: "Stress vs performance · illustrative", tr: "PHAK 2, 17" } }, draw);
  slider(row(S.F.ctrl), { label: "Stress", min: 0, max: 10, step: 1, value: st, fmt: (v) => (v <= 2 ? "low" : v <= 6 ? "moderate" : "high"), oninput: (v) => { st = +v; S.redraw(); } });
  function draw(g, W, H, top) {
    const m = 30, x0 = m, x1 = W - 14, y0 = top + 10, y1 = H - 30, X = (s) => x0 + (s / 10) * (x1 - x0), Y = (p) => y1 - p * (y1 - y0 - 10);
    L(g, x0, y1, x1, y1, { stroke: GRAY, w: 1 }); L(g, x0, y0, x0, y1, { stroke: GRAY, w: 1 });
    T(g, X(5), y1 + 18, "more stress →", { size: 11, anchor: "middle", fill: GRAY }); T(g, x0 + 6, y0 + 4, "performance", { size: 11, fill: GRAY });
    let d = ""; for (let s = 0; s <= 10.001; s += 0.1) d += (s ? "L" : "M") + X(s).toFixed(1) + "," + Y(perf(s)).toFixed(1);
    P(g, d, { stroke: INK, w: 2 });
    T(g, X(4.5), Y(1) - 10, "sharp", { size: 11, anchor: "middle", fill: GRAY }); T(g, x0, y1 + 18, "bored", { size: 11, fill: GRAY }); T(g, x1, y1 + 18, "overloaded", { size: 11, anchor: "end", fill: GRAY });
    C(g, X(st), Y(perf(st)), 7, { fill: ACC });
    const zone = st <= 2 ? "low" : st <= 6 ? "mid" : "high";
    S.F.caption(zone === "low" ? "Too little: easy to get complacent" : zone === "mid" ? "Some stress: alert and focused" : "Too much: performance drops fast", zone === "high" ? "Overload" : zone === "mid" ? "The sweet spot" : "Under-stimulated");
    S.F.explain(`${zone === "high" ? "Cut the load: delegate, use the autopilot if you have one, slow down, or don't fly. Chronic stress or fatigue means staying on the ground." : zone === "mid" ? "A little acute stress sharpens attention. Keep it there by planning ahead and using checklists." : "Low workload, like long cruise legs, invites complacency. Keep scanning and stay ahead of the airplane."} <span class="src">PHAK 2 · PHAK 17 · AIM 8-1-1</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
