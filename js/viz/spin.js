// Spin phases (AFH FAA-H-8083-3C ch 5; ACS PA.VII.D): a side view of the flight path through entry, incipient spin,
// developed spin and recovery, not to scale. The phase you pick is drawn blue and its key points are listed below.
// Recovery steps are the AFH's general ones; your airplane's POH procedure comes first. Static scene.
import { chips, row } from "./base.js?v=fa1f959704";
import { pxScene, T, L, P, ACC, INK, GRAY } from "./kit.js?v=fa1f959704";
const PH = {
  entry: ["Entry", "Stalled and yawing", "A spin needs two things: a stalled wing and yaw. Uncoordinated rudder at the stall (a skid, or a slip near the ground) lets one wing stall more deeply. That wing drops and the airplane starts to rotate. Recovering from the stall at the first cue, with coordinated controls, prevents the spin."],
  inc: ["Incipient", "The first turns", "From the stall to a steady spin: about the first two turns in a small airplane. Rotation and the flight path aren't settled yet. Recovery now is quickest and takes the least altitude."],
  dev: ["Developed", "Steady rotation", "Rotation rate, airspeed and vertical speed are nearly steady from turn to turn. Airspeed stays low, near the stall, while altitude drops fast. Only a recovery input ends it."],
  rec: ["Recovery", "Stop the rotation, break the stall", "Throttle to idle, ailerons neutral, full rudder opposite the rotation, then brisk forward elevator to break the stall. When rotation stops, neutralize the rudder and ease out of the dive without exceeding the limits. Your airplane's POH procedure comes first."],
};
export function mount(host) {
  let ph = "inc";
  const S = pxScene(host, { cls: "spinv", corners: { tl: "Not to scale", tr: "AFH 5" } }, draw);
  chips(row(S.F.ctrl), Object.entries(PH).map(([k, v]) => [k, v[0]]), ph, (v) => { ph = v || ph; S.redraw(); }, { label: "Phase" });
  function draw(g, W, H, top) {
    const phn = W < 520, x0 = W * (phn ? 0.3 : 0.3), y0 = top + 10, yb = H - 22, amp = Math.min(W * 0.12, 60);
    // segments: level approach and stall (entry), widening/tightening spiral (incipient), steady helix (developed), dive + pull-out (recovery)
    const yE = y0 + (yb - y0) * 0.12, yI = y0 + (yb - y0) * 0.42, yD = y0 + (yb - y0) * 0.72, yR = yb - 10;
    const seg = { entry: [], inc: [], dev: [], rec: [] };
    for (let i = 0; i <= 30; i++) { const t = i / 30; seg.entry.push([x0 - amp * 1.6 + t * amp * 1.6, y0 + 8 + t * t * (yE - y0 - 8)]); }
    for (let i = 0; i <= 80; i++) { const t = i / 80, a = t * 4 * Math.PI, r = amp * (0.35 + 0.65 * t); seg.inc.push([x0 + r * Math.sin(a), yE + t * (yI - yE)]); }
    for (let i = 0; i <= 80; i++) { const t = i / 80, a = t * 4 * Math.PI; seg.dev.push([x0 + amp * Math.sin(a), yI + t * (yD - yI)]); }
    for (let i = 0; i <= 40; i++) { const t = i / 40, a = Math.min(1, t * 2) * 0.6 * Math.PI, r = amp * (1 - Math.min(1, t * 2)); const dx = t > 0.5 ? (t - 0.5) * 2 * amp * 2.4 : 0; seg.rec.push([x0 + r * Math.sin(a) + dx, yD + (t < 0.5 ? t * 1.4 : 0.7 + (1 - Math.cos((t - 0.5) * Math.PI)) * 0.3) * (yR - yD)]); }
    for (const k of Object.keys(seg)) { const on = k === ph; P(g, seg[k].map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" "), { stroke: on ? ACC : "rgba(242,241,236,.45)", w: on ? 3 : 1.6 }); }
    // phase labels on the right, at each segment's middle height
    const lx = phn ? W - 12 : x0 + amp * 3.2, labs = [["entry", (y0 + yE) / 2], ["inc", (yE + yI) / 2], ["dev", (yI + yD) / 2], ["rec", (yD + yR) / 2]];
    labs.forEach(([k, y]) => { const on = k === ph; L(g, x0 + amp * 1.25, y, lx - (phn ? 70 : 6), y, { stroke: on ? ACC : "rgba(242,241,236,.2)", w: 1, dash: "2 4" }); T(g, phn ? lx : lx, y + 4, PH[k][0], { size: 12, weight: on ? 700 : 500, fill: on ? INK : GRAY, anchor: phn ? "end" : "start" }); });
        S.F.caption(PH[ph][1], PH[ph][0]);
    S.F.explain(`${PH[ph][2]} <span class="src">AFH 5 · FAA-S-ACS-6C PA.VII.D</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
