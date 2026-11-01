// The four forces: tap a force to read it; change thrust or pitch and watch the balance (qualitative).
import { frame, chips, svg, drawOn } from "./base.js?v=d0b3a92d56";
import { s } from "../core/util.js?v=d0b3a92d56";
import { sidePlane, T, arrow, setArrow, accentize } from "./shapes.js?v=d0b3a92d56";
const INFO = {
  lift: ["Lift", "Acts perpendicular to the relative wind, through the center of lift. Produced mostly by the wing."],
  weight: ["Weight", "Always acts straight down toward the center of the earth, through the CG, whatever the attitude."],
  thrust: ["Thrust", "The forward force from the propeller. It acts roughly along the propeller shaft."],
  drag: ["Drag", "The rearward, retarding force. It acts parallel to the relative wind, opposite the flight path."],
};
const STATES = {
  steady: { L: 1, W: 1, T: 1, D: 1, cap: ["Steady flight", "Forces in balance"], t: "Opposing forces cancel: the airplane holds its speed and flight path. Lift and weight are much larger than thrust and drag. The arrows show direction and balance, not scale." },
  power: { L: 1, W: 1, T: 1.5, D: 1, cap: ["Add power", "Thrust exceeds drag"], t: "With more thrust than drag the airplane accelerates (or, if you hold airspeed with pitch, it climbs). Drag rises with speed until a new balance is reached." },
  idle: { L: 1, W: 1, T: 0.35, D: 1, cap: ["Reduce power", "Drag exceeds thrust"], t: "The airplane slows. To hold airspeed you lower the nose and let a component of weight help pull you forward: a descent." },
  slow: { L: 1, W: 1, T: 1, D: 1.35, cap: ["Pitch up, no power", "Airspeed bleeds off"], t: "Raising the nose without adding power trades airspeed for altitude. AOA rises and induced drag grows. Keep going and the wing reaches its critical AOA." },
};
export function mount(host) {
  const F = frame(host, { corners: { tl: "Four forces", tr: "PHAK 4, 5" } });
  const el = svg(F.stage, "-800 -450 1600 900"); const g = s("g", {}, el);
  const pl = sidePlane(g, { w: 2 });
  const A = { lift: arrow(g, 0, -60, 0, -300), weight: arrow(g, 0, 0, 0, 260), thrust: arrow(g, -310, 8, -560, 8), drag: arrow(g, 60, 0, 320, 0) };
  const hit = {}; const lab = {};
  for (const k of Object.keys(A)) {
    hit[k] = s("line", { stroke: "transparent", "stroke-width": 60, class: "tap", role: "button", tabindex: 0, "aria-label": INFO[k][0] }, g);
    hit[k].addEventListener("click", () => pick(k)); hit[k].addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && pick(k));
    lab[k] = T(g, 0, 0, INFO[k][0], { size: 20, op: 0.7 });
  }
  s("circle", { cx: 0, cy: 0, r: 7, fill: "#F2F1EC", opacity: 0.8 }, g); T(g, 16, 28, "CG", { size: 16, op: 0.5 });
  let st = "steady", sel = null;
  function layout() { const S = STATES[st];
    const pos = { lift: [0, -70, 0, -70 - 230 * S.L], weight: [0, 10, 0, 10 + 230 * S.W], thrust: [-312, 8, -312 - 230 * S.T, 8], drag: [300, -4, 300 + 230 * S.D, -4] };
    for (const [k, [x1, y1, x2, y2]] of Object.entries(pos)) { setArrow(A[k], x1, y1, x2, y2); setArrow(hit[k], x1, y1, x2, y2);
      const lx = k === "thrust" ? x2 : k === "drag" ? x2 : x1 + 24, ly = k === "lift" ? y2 + 10 : k === "weight" ? y2 - 4 : y1 - 24;
      lab[k].setAttribute("x", lx); lab[k].setAttribute("y", ly); lab[k].setAttribute("text-anchor", k === "thrust" ? "start" : k === "drag" ? "end" : "start"); } }
  function pick(k) { sel = k; for (const kk of Object.keys(A)) accentize(A[kk], kk === k); drawOn(A[k], { dur: 900 }); F.caption(INFO[k][0], INFO[k][0] === "Lift" ? "Perpendicular to the wind" : INFO[k][0] === "Weight" ? "Always toward earth" : INFO[k][0] === "Thrust" ? "Forward, from the prop" : "Parallel to the wind"); F.explain(INFO[k][1]); }
  function setState(k) { st = k; layout(); for (const kk of Object.keys(A)) accentize(A[kk], false); const S = STATES[k];
    const changed = k === "power" || k === "idle" ? "thrust" : k === "slow" ? "drag" : null; if (changed) { accentize(A[changed], true); drawOn(A[changed], { dur: 900 }); }
    F.caption(S.cap[0], S.cap[1]); F.explain(S.t); }
  chips(F.ctrl, [["steady", "Steady"], ["power", "Add power"], ["idle", "Reduce power"], ["slow", "Pitch up"]], "steady", setState, { label: "Flight condition" });
  layout(); pl.querySelectorAll("path").forEach((p, i) => drawOn(p, { dur: 1400, delay: i * 40, light: i < 2 }));
  setState("steady");
  return { destroy() { F.destroy(); } };
}
