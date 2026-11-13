// Left-turning tendencies (PHAK 5). Pick an effect; the view switches to where it's easiest to see. Power sets how strong it is. Labels in screen px.
import { chips, slider } from "./base.js?v=3bad3dc1c8";
import { pxScene, T, L, P, C, R, planeTop, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=3bad3dc1c8";
const FX = {
  torque: { view: "rear", cap: ["Torque", "The airplane rolls left"], t: "Newton's third law: the engine turns the propeller clockwise (seen from the cockpit), so the propeller turns the airplane the other way. The left wing is pressed down and the left tire takes more load on the takeoff roll." },
  slip: { view: "top", cap: ["Spiraling slipstream", "Prop wash hits the left fin"], t: "The propeller pushes its wash back in a corkscrew around the fuselage. It strikes the <strong>left</strong> side of the vertical fin, pushing the tail right and yawing the nose left. Strongest at high power and low airspeed." },
  pf: { view: "top", cap: ["P-factor", "The right blade bites harder"], t: "At a high angle of attack the descending blade (on the right, seen from the cockpit) meets the air at a bigger angle than the ascending blade, so it makes more thrust. The center of thrust shifts right and the nose yaws left. Strongest in a high-power climb." },
  gyro: { view: "rear", cap: ["Gyroscopic precession", "Force acts 90° later"], t: "A spinning propeller is a gyroscope: a force applied to its disc takes effect 90° ahead in the direction of rotation. Push the top of the disc forward (as when a tailwheel airplane raises its tail) and the effect appears on the right side: the nose yaws left." },
};
export function mount(host) {
  let k = "slip", pw = 90;
  const S = pxScene(host, { cls: "tall", corners: { tl: "Left-turning tendencies", tr: "PHAK 5" } }, draw);
  chips(S.F.ctrl, [["torque", "Torque"], ["slip", "Slipstream"], ["pf", "P-factor"], ["gyro", "Precession"]], k, (v) => { k = v || k; S.redraw(); }, { label: "Effect" });
  slider(S.F.ctrl, { label: "Power", min: 10, max: 100, step: 5, value: pw, fmt: (v) => v + "%", oninput: (v) => { pw = v; S.redraw(); } });
  function draw(g, W, H, top) {
    const f = FX[k], ph = W < 520, cx = W / 2, cy = top + (H - top) * 0.5, m = Math.min(W, H - top), s = pw / 100, fs = ph ? 12 : 13;
    if (f.view === "rear") {
      const span = Math.min(W - 40, m * 1.1), r = m * 0.2;
      T(g, 14, top + 6, "VIEW FROM BEHIND, LOOKING FORWARD", { size: 11, fill: GRAY });
      L(g, cx - span / 2, cy + 6, cx + span / 2, cy + 6, { stroke: INK, w: 3 }); C(g, cx, cy + 8, 14, { stroke: INK, sw: 2, fill: "#0A0A0B" }); L(g, cx, cy - 6, cx, cy - 40, { stroke: INK, w: 2.4 });
      C(g, cx, cy, r, { stroke: DIM, sw: 1.4, dash: "4 8" });
      const arc = (rad, a0, a1, yc = cy) => { const p = (a) => [cx + Math.sin((a * Math.PI) / 180) * rad, yc - Math.cos((a * Math.PI) / 180) * rad]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0},${y0} A${rad},${rad} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1},${y1}`; };
      if (k === "torque") {
        P(g, arc(r + 10, -40, 40), { stroke: GRAY, w: 2, arrow: "kahg" }); T(g, cx, cy - r - 22, "PROP TURNS CLOCKWISE", { anchor: "middle", size: 11, fill: GRAY });
        P(g, arc(span * 0.42, 50, 50 - 100 * s, cy + 20), { stroke: ACC, w: 3, arrow: "kah" });
        T(g, cx - span * 0.32, cy + span * 0.25 + 10, "AIRPLANE ROLLS LEFT", { anchor: "middle", size: fs, fill: ACC, weight: 600 });
      } else {
        C(g, cx, cy - r, 9, { stroke: INK, sw: 2 }); P(g, `M${cx - 6},${cy - r - 6} L${cx + 6},${cy - r + 6} M${cx + 6},${cy - r - 6} L${cx - 6},${cy - r + 6}`, { stroke: INK, w: 2 });
        T(g, cx, cy - r - 18, "PUSH TOP FORWARD", { anchor: "middle", size: 11, fill: GRAY });
        P(g, arc(r + 14, 10, 80), { stroke: ACC, w: 3, arrow: "kah" });
        C(g, cx + r, cy, 10, { stroke: ACC, sw: 2.4 }); P(g, `M${cx + r - 6},${cy - 6} L${cx + r + 6},${cy + 6} M${cx + r + 6},${cy - 6} L${cx + r - 6},${cy + 6}`, { stroke: ACC, w: 2.4 });
        T(g, cx + r - 4, cy + 36, "FELT HERE, 90° LATER", { anchor: "middle", size: fs, fill: ACC, weight: 600 });
        T(g, cx, cy + span * 0.25 + 10, "RIGHT SIDE FORWARD: NOSE YAWS LEFT", { anchor: "middle", size: 11, fill: GRAY });
      }
    } else {
      const sz = Math.min(W * 0.62, (H - top) * 0.62), py = cy + 12;
      T(g, 14, top + 6, "TOP VIEW, NOSE UP", { size: 11, fill: GRAY });
      planeTop(g, cx, py, 0, sz, { stroke: INK, w: 1.8 });
      const kk = sz / 28, nose = py - 13 * kk, tail = py + 11 * kk;
      L(g, cx - 13 * kk * 0.55, nose - 6, cx + 13 * kk * 0.55, nose - 6, { stroke: GRAY, w: 4 });
      if (k === "slip") {
        let d = `M${cx},${nose - 4}`; for (let i = 0; i <= 50; i++) { const t = i / 50, y = nose + t * (tail - nose - 6), x = cx + Math.sin(t * Math.PI * 2.2 - 0.3) * (sz * 0.11) * (1 - t * 0.3); d += ` L${x.toFixed(1)},${y.toFixed(1)}`; }
        P(g, d + ` L${cx - 7},${tail - 6}`, { stroke: ACC, w: 1.5 + 2 * s, arrow: "kah" });
        T(g, cx, tail + 22, "HITS LEFT SIDE OF FIN", { anchor: "middle", size: fs, fill: ACC, weight: 600 });
      } else {
        const bx = 13 * kk * 0.3;
        L(g, cx - bx, nose - 8, cx - bx, nose - 8 - 20 * (0.6 + 0.4 * (1 - s)), { stroke: GRAY, w: 2.4, arrow: "kahg" });
        L(g, cx + bx, nose - 8, cx + bx, nose - 8 - 20 - 46 * s, { stroke: ACC, w: 3, arrow: "kah" });
        T(g, cx + bx + 10, nose - 30 - 20 * s, "DESCENDING BLADE", { size: 11, fill: ACC }); T(g, cx - bx - 10, nose - 26, "ASCENDING", { anchor: "end", size: 11, fill: GRAY });
      }
      // yaw arrow at the nose
      P(g, `M${cx - 8},${nose - 46 - 20 * s} q${-30 * s - 10},${6} ${-60 * s - 20},${22}`, { stroke: INK, w: 2.4, arrow: "kahw" });
      T(g, Math.max(14, cx - 70 * s - 30 - 112), nose - 18 - 20 * s + 42, "NOSE YAWS LEFT", { size: 11, fill: INK });
    }
    const need = k === "torque" ? "Left tire loaded on the takeoff roll" : k === "gyro" ? "Matters most when the tail rises" : `Stronger with power: ${s >= 0.8 ? "large" : s >= 0.4 ? "moderate" : "small"} left yaw`;
    T(g, W / 2, H - 16, need.toUpperCase(), { anchor: "middle", size: 11, fill: GRAY });
    S.F.caption(f.cap[0], f.cap[1]); S.F.explain(f.t + " <span class=\"src\">PHAK 5</span>");
  }
  return { destroy() { S.F.destroy(); } };
}
