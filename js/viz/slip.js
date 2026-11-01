// Crab vs sideslip vs forward slip on final (AFH 9). Top view of the runway with the ground track, plus a rear-view bank inset.
import { frame, chips, slider, readout, svg, ACC, FAINT, FAINT2 } from "./base.js?v=a81f689fed";
import { s } from "../core/util.js?v=a81f689fed";
import { T, topPlane, rearPlane, arrow, setArrow } from "./shapes.js?v=a81f689fed";
import { windField } from "./windfield.js?v=a81f689fed";
const M = {
  crab: { label: "Crab · wings level", big: "Nose into the wind", text: "Heading is turned into the wind so the track follows the centerline. Wings are level and the controls are coordinated. Fine on final, but the airplane must not touch down sideways." },
  side: { label: "Sideslip · wing low", big: "Low wing, opposite rudder", text: "Lower the upwind wing to stop the drift and hold opposite rudder to keep the nose on the centerline. The longitudinal axis stays aligned with the runway, so you can touch down on the upwind main wheel first. The POH notes this wing-low method gives the best control in a crosswind." },
  fwd: { label: "Forward slip · lose altitude", big: "Steeper, not faster", text: "Lower a wing and use opposite rudder to yaw the nose away from the track. The track stays the same, the fuselage presents its side to the airflow, and drag goes up, so you descend steeply without gaining airspeed. Control airspeed with pitch. With a crosswind, slip with the upwind wing low." },
};
export function mount(host, opts = {}) {
  const F = frame(host, { corners: { tl: "Final approach · top view", tr: "AFH 9 · POH 4" } });
  const el = svg(F.stage, "0 0 1600 900");
  const wf = windField(F, el, { x: 0, y: 0, w: 1130, h: 900, n: 55, op: 0.3 });
  const g = s("g", {}, el);
  // runway (vertical, landing toward the top)
  s("rect", { x: 770, y: 40, width: 120, height: 460, fill: "none", stroke: FAINT2, "stroke-width": 2 }, g);
  s("line", { x1: 830, y1: 60, x2: 830, y2: 480, stroke: FAINT2, "stroke-width": 2, "stroke-dasharray": "20 18" }, g);
  const ext = s("line", { x1: 830, y1: 500, x2: 830, y2: 880, stroke: FAINT, "stroke-width": 1.5, "stroke-dasharray": "4 10" }, g);
  const trk = s("line", { x1: 830, y1: 860, x2: 830, y2: 520, stroke: ACC, "stroke-width": 3, filter: "url(#gw)", "stroke-dasharray": "2 12", "stroke-linecap": "round" }, g);
  const pl = s("g", {}, g); topPlane(pl, { stroke: "#F2F1EC", w: 14 });
  const nose = s("line", { stroke: "#F2F1EC", "stroke-width": 2, opacity: 0.55, "stroke-dasharray": "6 6" }, g);
  const windA = arrow(g, 0, 0, 0, 0, { w: 3 }); const windT = T(g, 0, 0, "", { size: 15, op: 0.6 });
  // rear-view inset
  const ix = 1340, iy = 300; s("rect", { x: 1150, y: 90, width: 380, height: 400, fill: "none", stroke: FAINT, "stroke-width": 1, rx: 12 }, g); T(g, 1170, 124, "from behind", { size: 14, op: 0.5 });
  const rear = s("g", {}, g); rearPlane(rear, { stroke: "#F2F1EC", w: 6 }); const lift = arrow(g, ix, iy, ix, iy - 150, { accent: true, w: 4 });
  s("line", { x1: 1180, y1: iy + 120, x2: 1500, y2: iy + 120, stroke: FAINT2, "stroke-width": 1.5 }, g);
  const vs = T(g, 1340, 460, "", { anchor: "middle", size: 15, op: 0.75 });
  const st = { m: opts.mode || "side", xw: 10 }; const set = readout(F.ctrl, [["ail", "aileron"], ["rud", "rudder"], ["axis", "nose vs runway"], ["sink", "descent"]]);
  function upd() { const m = M[st.m], xw = st.xw; const dir = xw >= 0 ? 1 : -1, mag = Math.abs(xw); // + = wind from the right
    const crab = st.m === "crab" ? (Math.asin(Math.min(1, mag / 65)) * 180) / Math.PI * dir : 0; // 65 KIAS approach
const bank = st.m === "side" ? dir * Math.min(20, 2 + mag * 1.0) : st.m === "fwd" ? (dir || 1) * 18 : 0;
    const hdg = st.m === "crab" ? crab : st.m === "fwd" ? (xw === 0 ? -25 : -dir * 25) : 0;
    pl.setAttribute("transform", `translate(830,640) rotate(${hdg}) scale(${0.18 * Math.cos((bank * Math.PI) / 180) ** 0.6},0.18)`);
    const r = (hdg * Math.PI) / 180; nose.setAttribute("x1", 830); nose.setAttribute("y1", 640); nose.setAttribute("x2", 830 + Math.sin(r) * 200); nose.setAttribute("y2", 640 - Math.cos(r) * 200);
    rear.setAttribute("transform", `translate(${ix},${iy}) rotate(${bank}) scale(0.3)`); const br = (bank * Math.PI) / 180; setArrow(lift, ix, iy - 20, ix + Math.sin(br) * 150, iy - 20 - Math.cos(br) * 150);
    if (mag) { const x0 = xw > 0 ? 1200 : 460, x1 = xw > 0 ? 1060 : 600; setArrow(windA, x0, 640, x1, 640); windT.setAttribute("x", (x0 + x1) / 2); windT.setAttribute("y", 618); windT.setAttribute("text-anchor", "middle"); windT.textContent = `${mag} kt crosswind`; windA.style.display = windT.style.display = ""; }
    else windA.style.display = windT.style.display = "none";
    wf.set(xw > 0 ? 90 : 270, mag);
    const low = bank > 0 ? "right" : bank < 0 ? "left" : ""; const rudS = st.m === "crab" || bank === 0 ? "coordinated" : bank > 0 ? "left (opposite)" : "right (opposite)";
    set("ail", low ? `${low} wing low` : "neutral"); set("rud", rudS); set("axis", st.m === "fwd" ? `${Math.abs(Math.round(hdg))}° off` : st.m === "crab" ? `${Math.abs(Math.round(crab))}° crab` : "aligned"); set("sink", st.m === "fwd" ? "steep" : "normal");
    vs.textContent = st.m === "fwd" ? "more drag: steeper descent" : st.m === "side" ? "horizontal lift cancels drift" : "wings level";
    F.caption(m.label, m.big); F.explain(`${m.text} <span class="src">AFH 9; POH 4</span> Steep slips with more than 20° of flap can cause slight elevator oscillation in the 172S. <span class="dim">Confirm with your CFI and your aircraft's POH.</span>`); }
  chips(F.ctrl, [["crab", "Crab"], ["side", "Sideslip"], ["fwd", "Forward slip"]], st.m, (v) => { st.m = v; upd(); }, { label: "Technique" });
  slider(F.ctrl, { label: "Crosswind (− left / + right)", min: -15, max: 15, step: 1, value: st.xw, fmt: (v) => (v ? `${Math.abs(v)} kt ${v > 0 ? "R" : "L"}` : "calm"), oninput: (v) => { st.xw = v; upd(); } });
  upd(); return { destroy() { F.destroy(); } };
}
