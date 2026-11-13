// Tail types (GL1 "parts"), identify-only side views: conventional tail, stabilator with antiservo tab, and T-tail.
// "Pull back" shows which way the moving surface goes. Sources: PHAK Ch 3 (stabilator pivots, trailing edge up when you pull
// back; antiservo tab moves the same direction as the trailing edge, makes it less sensitive and also trims); PHAK Ch 6 (T-tail:
// elevator above most prop downwash and wing wake; needs more travel and force to raise the nose at low speed).
import { pxScene, T, L, P, C, INK, ACC, GRAY, DIM, ACCF } from "./kit.js?v=7534528db0";
import { chips } from "./base.js?v=7534528db0";
import { rich } from "../core/rich.js?v=7534528db0";
const SAY = {
  conv: ["Conventional tail", "Fixed horizontal stabilizer with a hinged elevator; the trim tab rides on the elevator. The 172 has this.", "PHAK 3"],
  stab: ["Stabilator", "The whole horizontal tail pivots. The [[antiservo tab]] moves the same way as the trailing edge, so the stabilator feels less sensitive; it trims too.", "PHAK 3"],
  ttail: ["T-tail", "The horizontal tail sits on top of the fin, above most of the prop's downwash, so at low speed you need more elevator travel and force to raise the nose.", "PHAK 6"],
};
export function mount(host) {
  let ty = "conv", pull = false;
  const S = pxScene(host, { cls: "tailtypes", corners: { tl: "Tail types", tr: "Identify only" } }, draw);
  const c1 = chips(S.F.ctrl, [["conv", "Conventional"], ["stab", "Stabilator"], ["ttail", "T-tail"]], ty, (v) => { ty = v; S.redraw(); text(); }, { label: "Tail" });
  chips(S.F.ctrl, [["n", "Neutral"], ["p", "Pull back"]], "n", (v) => { pull = v === "p"; S.redraw(); text(); }, { label: "Control wheel" });
  function text() { const [a, b, src] = SAY[ty]; S.F.caption(pull ? "Pull back: trailing edge up, nose up" : "Side view", a); S.F.explain(`${rich(b)} <span class="src">${src}</span>`); }
  function draw(g, W, H, top) {
    const x0 = W * 0.08, x1 = W * 0.92, by = top + (H - top) * 0.72, k = (x1 - x0) / 300;
    // aft fuselage and fin (the fin is fixed: ink)
    P(g, `M${x0} ${by - 34 * k} L${x1 - 30 * k} ${by - 14 * k} L${x1} ${by - 12 * k} L${x1} ${by} L${x0} ${by + 6 * k}`, { stroke: INK, w: 1.6 });
    const finTop = by - 130 * k; P(g, `M${x1 - 90 * k} ${by - 16 * k} L${x1 - 30 * k} ${finTop} L${x1} ${finTop} L${x1} ${by - 12 * k}`, { stroke: INK, w: 1.6 });
    const surf = (hx, hy, len, mov, pivotAll) => {   // horizontal tail in side view: fixed part + moving part (blue)
      const ang = pull ? -14 : 0, rad = ang * Math.PI / 180;
      if (!pivotAll) { L(g, hx, hy, hx + len * 0.62, hy, { stroke: INK, w: 5 }); const ex = hx + len * 0.62; L(g, ex, hy, ex + len * 0.38 * Math.cos(rad), hy + len * 0.38 * Math.sin(rad), { stroke: ACC, w: 5 });
        const tx = ex + len * 0.38 * Math.cos(rad); L(g, tx, hy + len * 0.38 * Math.sin(rad), tx + 12 * k, hy + len * 0.38 * Math.sin(rad), { stroke: ACC, w: 3 }); T(g, ex + 4, hy + 22, "elevator", { size: 11, fill: ACC }); T(g, hx, hy + 22, "stabilizer (fixed)", { size: 11, fill: GRAY }); }
      else { const cx = hx + len * 0.3; C(g, cx, hy, 4, { fill: INK }); const ax = cx - len * 0.3 * Math.cos(rad), ay = hy - len * 0.3 * Math.sin(rad), bx = cx + len * 0.7 * Math.cos(rad), byy = hy + len * 0.7 * Math.sin(rad);
        L(g, ax, ay, bx, byy, { stroke: ACC, w: 5 }); const tr = rad * 2.0; L(g, bx, byy, bx + 16 * k * Math.cos(tr), byy + 16 * k * Math.sin(tr), { stroke: ACC, w: 3 });
        T(g, cx - 10, hy + 22, "pivot", { size: 11, fill: GRAY }); T(g, bx - 20 * k, byy - 14, "antiservo tab", { size: 11, fill: ACC, anchor: "end" }); } };
    if (ty === "ttail") surf(x1 - 60 * k, finTop, 80 * k, true, false);
    else surf(x1 - 110 * k, by - 18 * k, 110 * k, true, ty === "stab");
    // rudder on the fin trailing edge (ink: not the focus here)
    L(g, x1, finTop, x1, by - 12 * k, { stroke: DIM, w: 3 });
    T(g, x0, by + 26, "nose ←", { size: 11, fill: GRAY });
  }
  text();
  return { destroy() { S.F.destroy(); } };
}
