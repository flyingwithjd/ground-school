// Gyroscope properties (PHAK 8): rigidity in space and precession (a force acts 90° later in the direction of rotation).
import { slider, chips } from "./base.js?v=7204d1cc12";
import { pxScene, T, L, P, C, R, hit, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=7204d1cc12";
export function mount(host) {
  let mode = "pre", push = 0, bank = 20;
  const S = pxScene(host, { corners: { tl: "Gyroscope", tr: "PHAK 8" } }, draw);
  chips(S.F.ctrl, [["pre", "Precession"], ["rig", "Rigidity"]], mode, (v) => { mode = v || mode; ctl.el.style.display = mode === "rig" ? "" : "none"; S.redraw(); }, { label: "Property" });
  const ctl = slider(S.F.ctrl, { label: "Tilt the base", min: -45, max: 45, step: 1, value: bank, fmt: (v) => v + "°", oninput: (v) => { bank = v; S.redraw(); } });
  ctl.el.style.display = "none";
  function draw(g, W, H, top) {
    const ph = W < 520, cx = W / 2, cy = (top + H) / 2 + 4, r = Math.min(W * 0.3, (H - top) * 0.36);
    if (mode === "pre") {
      // rotor seen face-on, spinning clockwise
      C(g, cx, cy, r, { stroke: INK, sw: 2, fill: "rgba(242,241,236,.05)" }); C(g, cx, cy, 5, { fill: INK });
      P(g, `M${cx + r * 0.62 * Math.cos(-2.4)},${cy + r * 0.62 * Math.sin(-2.4)} A${r * 0.62},${r * 0.62} 0 0 1 ${cx + r * 0.62 * Math.cos(-0.8)},${cy + r * 0.62 * Math.sin(-0.8)}`, { stroke: GRAY, w: 1.6, arrow: "kahg" });
      T(g, cx, cy + r * 0.3, "SPIN", { anchor: "middle", size: 11, fill: GRAY });
      const pts = [0, 90, 180, 270];
      for (const a of pts) {
        const rad = ((a - 90) * Math.PI) / 180, x = cx + r * Math.cos(rad), y = cy + r * Math.sin(rad);
        hit(g, C(g, x, y, 18, { stroke: a === push ? ACC : DIM, sw: 1.5, fill: a === push ? ACCM : "rgba(10,10,11,.9)" }), `Push the rim at ${a}°`, () => { push = a; S.redraw(); });
        T(g, x, y + 4, "PUSH", { anchor: "middle", size: 11, fill: a === push ? INK : GRAY });
      }
      // force arrow into the rim at push, effect at push+90 (clockwise = direction of rotation)
      const fr = ((push - 90) * Math.PI) / 180, er = ((push + 90 - 90) * Math.PI) / 180;
      const fx = cx + (r + 54) * Math.cos(fr), fy = cy + (r + 54) * Math.sin(fr);
      L(g, fx, fy, cx + (r + 22) * Math.cos(fr), cy + (r + 22) * Math.sin(fr), { stroke: INK, w: 2.4, arrow: "kahw" });
      const ex = cx + r * Math.cos(er), ey = cy + r * Math.sin(er);
      C(g, ex, ey, 24, { stroke: ACC, sw: 2.4, dash: "4 3" });
      T(g, ex - Math.cos(er) * (r * 0.42), ey - Math.sin(er) * 40 + 4 + (Math.abs(Math.sin(er)) < 0.5 ? -30 : 0), "ACTS HERE", { anchor: "middle", size: ph ? 11 : 12, fill: ACC });
      S.F.caption("Precession", "Force acts 90° later");
      S.F.explain("A force on a spinning rotor acts as if applied 90° later in the direction of rotation. Tap another push point. Turn coordinators use precession; bearing friction precesses the heading indicator, so it drifts. <span class=\"src\">PHAK 8</span>");
    } else {
      // base (gimbal frame) tilts with the airplane; rotor axis stays put
      const b = (bank * Math.PI) / 180, bw = r * 1.05;
      const gg = `M${cx - bw * Math.cos(b)},${cy + r * 0.9 - bw * Math.sin(b)} L${cx + bw * Math.cos(b)},${cy + r * 0.9 + bw * Math.sin(b)}`;
      P(g, gg, { stroke: GRAY, w: 4 }); T(g, cx, cy + r * 0.9 + bw + 6, `BASE / AIRPLANE ${bank}°`, { anchor: "middle", size: 11, fill: GRAY });
      R(g, cx - r * 0.75, cy - r * 0.18, r * 1.5, r * 0.36, { stroke: INK, sw: 2, rx: r * 0.18, fill: "rgba(242,241,236,.06)" });
      L(g, cx, cy - r * 0.95, cx, cy + r * 0.6, { stroke: ACC, w: 2.2, dash: "6 4" });
      T(g, cx + 10, cy - r * 0.8, "SPIN AXIS STAYS PUT", { size: ph ? 11 : 12, fill: ACC });
      S.F.caption("Rigidity in space", `Base ${bank}°, rotor 0°`);
      S.F.explain("A fast, heavy rotor keeps pointing the same way however its base moves. That's how the attitude and heading indicators give a steady reference while the airplane maneuvers. <span class=\"src\">PHAK 8</span>");
    }
  }
  return { destroy() { S.F.destroy(); } };
}
