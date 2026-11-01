// Left-turning tendencies. Pick an effect; the view changes to the one where it is easiest to see (PHAK 5).
import { frame, chips, svg, drawOn, loop, ACC, FAINT, FAINT2 } from "./base.js?v=af7918520c";
import { s } from "../core/util.js?v=af7918520c";
import { rearPlane, topPlane, T, arrow } from "./shapes.js?v=af7918520c";
const FX = {
  torque: { view: "rear", cap: ["Torque", "The airplane rolls left"], t: "Newton's third law: the engine turns the propeller clockwise (seen from the cockpit), so the propeller turns the airplane the other way. The left wing is pressed down and the left tire takes more load on the takeoff roll." },
  slip: { view: "top", cap: ["Spiraling slipstream", "Prop wash hits the left fin"], t: "The propeller pushes its wash back in a corkscrew around the fuselage. It strikes the <strong>left</strong> side of the vertical fin, pushing the tail right and yawing the nose left. Strongest at high power and low airspeed." },
  pf: { view: "top", cap: ["P-factor", "The right blade bites harder"], t: "At a high angle of attack the descending blade (on the right, seen from the cockpit) meets the air at a bigger angle than the ascending blade, so it makes more thrust. The center of thrust shifts right and the nose yaws left. Strongest in a high-power climb." },
  gyro: { view: "rear", cap: ["Gyroscopic precession", "Force acts 90° later"], t: "A spinning propeller is a gyroscope: a force applied to its disc takes effect 90° ahead in the direction of rotation. Push the top of the disc forward (as when a tailwheel airplane raises its tail) and the effect appears on the right side: the nose yaws left." },
};
export function mount(host) {
  const F = frame(host, { corners: { tl: "Left-turning tendencies", tr: "PHAK 5" } });
  const el = svg(F.stage, "-800 -450 1600 900"); const g = s("g", {}, el);
  const rear = s("g", { transform: "translate(0 40)" }, g), top = s("g", { transform: "translate(0 30) scale(.82)" }, g);
  rearPlane(rear, { w: 2 }); const disc = s("circle", { cx: 0, cy: -10, r: 150, fill: "none", stroke: FAINT, "stroke-width": 1.5, "stroke-dasharray": "4 10" }, rear);
  T(rear, -780 + 0, -400, "view from behind, looking forward", { size: 15, op: 0.45 });
  topPlane(top, { w: 2 });
  const topLbl = T(top, -900, -460, "top view, nose up", { size: 17, op: 0.45 });
  const L = s("g", {}, g); // per-effect overlay
  const blade = s("line", { x1: 0, y1: -10, x2: 0, y2: -150, stroke: "#F2F1EC", "stroke-width": 4, "stroke-linecap": "round", opacity: 0.8 }, rear);
  const blade2 = s("line", { x1: 0, y1: -10, x2: 0, y2: 130, stroke: "#F2F1EC", "stroke-width": 4, "stroke-linecap": "round", opacity: 0.8 }, rear);
  let cur = "torque", ang = 0;
  const spin = loop(F, (now, dt) => { ang = (ang + dt * 0.5) % 360; const a = (ang * Math.PI) / 180; const x = Math.sin(a) * 140, y = -Math.cos(a) * 140;
    blade.setAttribute("x2", x); blade.setAttribute("y2", -10 + y); blade2.setAttribute("x2", -x); blade2.setAttribute("y2", -10 - y); });
  function cwArc(r, a0, a1, cy = -10) { const p = (a) => [Math.sin((a * Math.PI) / 180) * r, cy - Math.cos((a * Math.PI) / 180) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0},${y0} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1},${y1}`; }
  function show(k) { cur = k; const f = FX[k]; L.innerHTML = ""; rear.style.display = f.view === "rear" ? "" : "none"; top.style.display = f.view === "top" ? "" : "none";
    const lay = s("g", { transform: f.view === "rear" ? "translate(0 40)" : "translate(0 30) scale(.82)" }, L);
    const acc = (d, w = 4) => { const p = s("path", { d, fill: "none", stroke: ACC, "stroke-width": w, "stroke-linecap": "round", filter: "url(#gw)", "marker-end": "url(#ah)" }, lay); drawOn(p, { dur: 1300 }); return p; };
    const ink = (d) => s("path", { d, fill: "none", stroke: "rgba(242,241,236,.55)", "stroke-width": 3, "stroke-linecap": "round", "marker-end": "url(#ahw)" }, lay);
    if (k === "torque") { ink(cwArc(190, -40, 40)); T(lay, 0, -228, "propeller turns clockwise", { anchor: "middle", size: 15, op: 0.6 });
      acc(cwArc(330, 60, -60, 30)); T(lay, -520, -260, "airplane rolls left", { size: 18, op: 0.9, fill: ACC }); }
    if (k === "slip") { let d = "M0,-330"; for (let i = 0; i <= 60; i++) { const t = i / 60, y = -330 + t * 520, x = Math.sin(t * Math.PI * 2.2 - 0.3) * (60 - t * 18); d += ` L${x.toFixed(1)},${y.toFixed(1)}`; } d += " L-14,210";
      acc(d, 3.5); T(lay, -60, 236, "hits the left side of the fin", { anchor: "end", size: 17, op: 0.9, fill: ACC });
      ink("M30,250 L140,250"); T(lay, 150, 256, "tail pushed right", { size: 15, op: 0.6 }); ink("M-20,-340 L-140,-340"); T(lay, -150, -334, "nose yaws left", { anchor: "end", size: 15, op: 0.6 }); }
    if (k === "pf") { s("line", { x1: -150, y1: -304, x2: 150, y2: -304, stroke: FAINT2, "stroke-width": 6, "stroke-linecap": "round" }, lay);
      ink("M-90,-310 L-90,-400"); T(lay, -90, -420, "ascending blade", { anchor: "middle", size: 14, op: 0.6 });
      acc("M90,-310 L90,-470", 5); T(lay, 110, -440, "descending blade · more thrust", { size: 15, op: 0.9, fill: ACC });
      ink("M0,-300 L-120,-250"); T(lay, -130, -236, "nose yaws left", { anchor: "end", size: 15, op: 0.6 }); }
    if (k === "gyro") { s("circle", { cx: 0, cy: -160, r: 10, fill: "none", stroke: "#F2F1EC", "stroke-width": 3 }, lay); s("path", { d: "M-7,-167 L7,-153 M7,-167 L-7,-153", stroke: "#F2F1EC", "stroke-width": 2.5 }, lay);
      T(lay, 0, -186, "force here: top pushed forward (into the page)", { anchor: "middle", size: 15, op: 0.6 });
      acc(cwArc(200, 6, 84)); s("circle", { cx: 160, cy: -10, r: 12, fill: "none", stroke: ACC, "stroke-width": 3, filter: "url(#gw)" }, lay); s("path", { d: "M152,-18 L168,-2 M168,-18 L152,-2", stroke: ACC, "stroke-width": 3 }, lay);
      T(lay, 210, -4, "felt here, 90° later", { size: 17, op: 0.9, fill: ACC }); T(lay, 210, 24, "right side moves forward: nose yaws left", { size: 14, op: 0.6 }); }
    F.caption(f.cap[0], f.cap[1]); F.explain(f.t); spin.start(); }
  chips(F.ctrl, [["torque", "Torque"], ["slip", "Slipstream"], ["pf", "P-factor"], ["gyro", "Precession"]], "torque", show, { label: "Effect" });
  show("torque");
  return { destroy() { F.destroy(); } };
}
