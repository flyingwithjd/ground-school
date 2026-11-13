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
    const hh = H - top, x0 = W * 0.04, x1 = W * 0.74, w = x1 - x0, cy = top + hh * 0.58;
    const fT = (x) => cy - hh * 0.13 + (x - x0) / w * hh * 0.10, fB = (x) => cy + hh * 0.15 - (x - x0) / w * hh * 0.13;
    // aft fuselage and fin: fixed structure, ink
    P(g, `M${x0} ${fT(x0)} L${x1} ${fT(x1)} L${x1} ${fB(x1)} L${x0} ${fB(x0)}`, { stroke: INK, w: 1.6 });
    const finTop = top + hh * 0.10, fa = x1 - w * 0.36;
    P(g, `M${fa} ${fT(fa)} L${x1 - w * 0.10} ${finTop} L${x1} ${finTop} L${x1} ${fT(x1)}`, { stroke: INK, w: 1.6 });
    L(g, x1 + 2, finTop + 4, x1 + 2, fT(x1), { stroke: DIM, w: 3 }); // rudder hinge line, not the focus
    const rad = (pull ? -14 : 0) * Math.PI / 180, lab = { size: 12 };
    const end = (x, y, len, a) => [x + len * Math.cos(a), y + len * Math.sin(a)];
    if (ty === "stab") {
      const len = w * 0.46, hx = x1 - len * 0.72, hy = (fT(hx) + fB(hx)) / 2, px = hx + len * 0.3;
      const [ax, ay] = end(px, hy, -len * 0.3, rad), [bx, by] = end(px, hy, len * 0.7, rad), [tx, ty2] = end(bx, by, w * 0.07, rad * 2.2);
      L(g, ax, ay, bx, by, { stroke: ACC, w: 6 }); L(g, bx, by, tx, ty2, { stroke: ACC, w: 3.5 }); C(g, px, hy, 4.5, { fill: INK });
      const yb = fB(hx) + 32; L(g, px, hy + 6, px, yb - 14, { stroke: GRAY, w: 1 }); T(g, px, yb, "pivot", { ...lab, fill: GRAY, anchor: "middle" });
      L(g, tx, ty2 + 6, tx, yb + 6, { stroke: ACC, w: 1 }); T(g, tx, yb + 20, "antiservo tab", { ...lab, fill: ACC, anchor: "end" });
      T(g, x0, top + hh * 0.2, "the whole tail pivots", { ...lab, fill: ACC });
    } else {
      const tt = ty === "ttail", len = tt ? w * 0.36 : w * 0.46, hx = tt ? x1 - len * 0.62 : x1 - len * 0.72, hy = tt ? finTop : (fT(hx) + fB(hx)) / 2;
      const ex = hx + len * 0.62; L(g, hx, hy, ex, hy, { stroke: INK, w: 6 });
      const [bx, by] = end(ex, hy, len * 0.38, rad), [tx, ty2] = end(bx, by, w * 0.05, rad); L(g, ex, hy, bx, by, { stroke: ACC, w: 6 }); L(g, bx, by, tx, ty2, { stroke: ACC, w: 3 });
      if (tt) { T(g, hx - 8, hy + 4, "stabilizer (fixed)", { ...lab, fill: GRAY, anchor: "end" }); L(g, (ex + bx) / 2, hy + 6, (ex + bx) / 2, hy + 36, { stroke: ACC, w: 1 }); T(g, (ex + bx) / 2, hy + 50, "elevator", { ...lab, fill: ACC, anchor: "middle" }); T(g, fa - 8, fT(fa) - 30, "fin", { ...lab, fill: GRAY, anchor: "end" }); }
      else { const yb = fB(hx) + 32, sx = hx + len * 0.3, mx = (ex + bx) / 2; L(g, sx, hy + 6, sx, yb - 14, { stroke: GRAY, w: 1 }); T(g, sx, yb, "stabilizer (fixed)", { ...lab, fill: GRAY, anchor: "end" }); L(g, mx, hy + 6, mx, yb + 6, { stroke: ACC, w: 1 }); T(g, mx, yb + 20, "elevator + trim tab", { ...lab, fill: ACC, anchor: "middle" }); }
    }
    T(g, x0, fB(x0) + 24, "← nose", { size: 11, fill: GRAY });
  }
  text();
  return { destroy() { S.F.destroy(); } };
}
