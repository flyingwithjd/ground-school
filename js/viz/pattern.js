// Traffic pattern (AC 90-66C, AIM 4-3-3). Tap a leg for its name and what to do there; switch entries;
// fly a point of light around the circuit. Geometry is schematic; distances are not to scale.
import { frame, chips, svg, drawOn, loop, ACC, FAINT, FAINT2 } from "./base.js?v=28fd5e09fd";
import { s, h, reduced } from "../core/util.js?v=28fd5e09fd";
import { T } from "./shapes.js?v=28fd5e09fd";
const RW0 = 520, RW1 = 1080, CY = 450, OFF = 280, BX = RW0 - OFF, XX = 1300;
const LEGS = {
  dep: ["Upwind / departure", "Climb straight ahead", "After takeoff, continue straight ahead until beyond the departure end of the runway. Climb at VY (74 KIAS in the 172S, POH) unless a different speed is called for."],
  xw: ["Crosswind", "Within 300 ft of pattern altitude", "Do not turn crosswind until beyond the departure end and within 300 feet below traffic pattern altitude. Level off at pattern altitude and turn downwind. <span class=\"src\">AC 90-66C 11.7</span>"],
  dw: ["Downwind", "Pattern altitude", "Parallel to the runway, opposite the landing direction, at traffic pattern altitude: usually 1,000 ft AGL for propeller airplanes unless the Chart Supplement publishes another. Hold it until at least abeam the approach end. <span class=\"src\">AC 90-66C App A, 11.4</span>"],
  base: ["Base", "Descending", "Turn base about 45° relative bearing from the approach end of the runway. Keep descending and managing energy toward a stabilized final. <span class=\"src\">AC 90-66C 11.4</span>"],
  final: ["Final", "Aligned with the centerline", "Complete the turn to final at least ¼ mile from the runway. Stay aligned with the extended centerline to the landing. <span class=\"src\">AIM 4-3-3 (via AC 90-66C App A)</span>"],
};
const ENTRY = {
  e45: ["45° entry to downwind", "The standard entry", "Arrive at pattern altitude, well clear, and enter the downwind at a 45° angle abeam the midpoint of the runway. Everyone at the same altitude makes traffic easier to see. <span class=\"src\">AC 90-66C 11.3</span>"],
  mid: ["Midfield crossing", "An alternate entry", "From the upwind side, cross over midfield at pattern altitude and enter the downwind directly. Do not use it when the pattern is congested. <span class=\"src\">AC 90-66C App A</span>"],
  out: ["Departing the pattern", "Straight out or 45°", "Continue straight out, or exit with a 45° turn in the pattern direction, beyond the departure end and after reaching pattern altitude. <span class=\"src\">AC 90-66C 11.8</span>"],
  si: ["Straight-in", "Discouraged", "The FAA discourages VFR straight-in approaches because they conflict with traffic in the pattern. If used, announce it about 10 miles out and yield to traffic already established. <span class=\"src\">AC 90-66C 9.11.1</span>"],
};
export function mount(host, opts = {}) {
  const F = frame(host, { corners: { tl: "Traffic pattern · schematic", tr: "AC 90-66C" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  // runway
  s("rect", { x: RW0, y: CY - 16, width: RW1 - RW0, height: 32, fill: "none", stroke: "#F2F1EC", "stroke-width": 2, opacity: 0.8 }, g);
  s("line", { x1: RW0 + 60, y1: CY, x2: RW1 - 60, y2: CY, stroke: "#F2F1EC", "stroke-width": 2, "stroke-dasharray": "18 14", opacity: 0.5 }, g);
  const n1 = T(g, RW0 + 34, CY + 7, "9", { anchor: "middle", size: 20, op: 0.8, sans: true, weight: 700 }); n1.setAttribute("transform", `rotate(90 ${RW0 + 34} ${CY})`);
  const n2 = T(g, RW1 - 34, CY + 7, "27", { anchor: "middle", size: 20, op: 0.8, sans: true, weight: 700 }); n2.setAttribute("transform", `rotate(-90 ${RW1 - 34} ${CY})`);
  T(g, 1560, 60, "wind 090°", { anchor: "end", size: 15, op: 0.6 }); s("line", { x1: 1560, y1: 80, x2: 1460, y2: 80, stroke: "rgba(242,241,236,.55)", "stroke-width": 2.5, "marker-end": "url(#ahw)" }, g);
  const legsG = s("g", {}, g), extraG = s("g", {}, g), labG = s("g", {}, g);
  const dot = s("circle", { r: 9, fill: ACC, filter: "url(#gw)", opacity: 0 }, g);
  let side = opts.right ? 1 : -1, sel = null, entry = null, flying = null;
  const paths = {}, hits = {};
  function geom() { const Y = CY + side * OFF; return { Y,
    dep: `M${RW1},${CY} L${XX},${CY}`, xw: `M${XX},${CY} L${XX},${Y}`, dw: `M${XX},${Y} L${BX},${Y}`, base: `M${BX},${Y} L${BX},${CY}`, final: `M${BX},${CY} L${RW0},${CY}`,
    e45: `M${800 + 170},${Y + side * 170} L800,${Y}`, mid: `M800,${CY - side * 420} L800,${Y - side * 30} Q800,${Y} 770,${Y}`,
    out: `M${XX},${CY} L${XX + 60},${CY} M${XX},${CY} L${XX + 40},${CY} L${XX + 200},${CY + side * 160}`, si: `M40,${CY} L${RW0},${CY}` }; }
  function build() { legsG.innerHTML = ""; labG.innerHTML = ""; const G = geom();
    for (const k of Object.keys(LEGS)) { paths[k] = s("path", { d: G[k], fill: "none", stroke: FAINT2, "stroke-width": 3, "stroke-linecap": "round", "marker-end": "url(#ahw)" }, legsG);
      hits[k] = s("path", { d: G[k], fill: "none", stroke: "transparent", "stroke-width": 70, class: "tap", role: "button", tabindex: 0, "aria-label": LEGS[k][0] }, legsG);
      hits[k].addEventListener("click", () => pick(k)); hits[k].addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && pick(k)); }
    const L = (x, y, t, a = "middle") => T(labG, x, y, t, { anchor: a, size: 16, op: 0.6 });
    L((RW1 + XX) / 2, CY - side * 22 + 6, "upwind"); L(XX + 24, (CY + G.Y) / 2, "crosswind", "start"); L(800, G.Y + side * 30 + 6, "downwind"); L(BX - 24, (CY + G.Y) / 2, "base", "end"); L((BX + RW0) / 2, CY - side * 22 + 6, "final");
    // 45° base-turn reference and abeam marker
    s("line", { x1: RW0, y1: CY, x2: BX, y2: G.Y, stroke: FAINT, "stroke-width": 1.5, "stroke-dasharray": "4 8" }, labG); T(labG, RW0 - 20, (CY + G.Y) / 2 + 30 * side, "45°", { anchor: "end", size: 14, op: 0.45 });
    s("line", { x1: RW0, y1: CY - side * 20, x2: RW0, y2: G.Y - side * 14, stroke: FAINT, "stroke-width": 1.5, "stroke-dasharray": "4 8" }, labG); T(labG, RW0 + 10, G.Y - side * 40, "abeam: begin descent", { size: 13, op: 0.45 });
    if (sel) pick(sel, false); if (entry) showEntry(entry, false); }
  function clearHL() { for (const p of Object.values(paths)) { p.setAttribute("stroke", FAINT2); p.setAttribute("marker-end", "url(#ahw)"); p.removeAttribute("filter"); } }
  function pick(k, draw = true) { sel = k; entry = null; entryChips.set(null); extraG.innerHTML = ""; clearHL(); const p = paths[k]; p.setAttribute("stroke", ACC); p.setAttribute("marker-end", "url(#ah)"); p.setAttribute("filter", "url(#gw)"); if (draw) drawOn(p, { dur: 1100 });
    F.caption(LEGS[k][0], LEGS[k][1]); F.explain(LEGS[k][2]); }
  function showEntry(k, draw = true) { entry = k; sel = null; clearHL(); extraG.innerHTML = ""; const G = geom(); if (!k) return;
    const p = s("path", { d: G[k], fill: "none", stroke: ACC, "stroke-width": 3.5, "stroke-linecap": "round", filter: "url(#gw)", "marker-end": "url(#ah)", ...(k === "si" ? { "stroke-dasharray": "14 12" } : {}) }, extraG); if (draw && k !== "si") drawOn(p, { dur: 1400 });
    F.caption(ENTRY[k][0], ENTRY[k][1]); F.explain(ENTRY[k][2]); }
  chips(F.ctrl, [["-1", "Left traffic"], ["1", "Right traffic"]], String(side), (v) => { side = +v; build(); if (!sel && !entry) intro(); }, { label: "Pattern direction" });
  const entryChips = chips(F.ctrl, [["e45", "45° entry"], ["mid", "Midfield"], ["out", "Departure"], ["si", "Straight-in"]], null, (v) => showEntry(v), { label: "Entries and exits" });
  const fly = h("button", { class: "chip", type: "button" }, "Fly the circuit"); F.ctrl.append(fly);
  const order = ["dep", "xw", "dw", "base", "final"]; let fi = 0, fl = 0;
  const run = loop(F, (now, dt) => { if (flying == null) return false; const p = paths[order[fi]], L = p.getTotalLength(); fl += dt * 0.28;
    if (fl >= L) { fl = 0; fi++; if (fi >= order.length) { flying = null; dot.setAttribute("opacity", 0); return false; } pick(order[fi], false); }
    const pt = paths[order[fi]].getPointAtLength(Math.min(fl, L)); dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y); }, { always: true });
  fly.addEventListener("click", () => { if (reduced()) { fi = (fi + 1) % order.length; pick(order[fi]); return; } flying = true; fi = 0; fl = 0; dot.setAttribute("opacity", 1); pick("dep", false); run.start(); });
  function intro() { F.caption(side < 0 ? "Left traffic · runway 9" : "Right traffic · runway 9", "Tap a leg"); F.explain(side < 0 ? "Left traffic is the default: at a non-towered airport in Class G, fixed-wing airplanes make all turns to the left unless approved lights or markings show right traffic. <span class=\"src\">14 CFR 91.126(b)</span>" : "Right traffic is used only where the airport shows it with approved lights or markings (or the Chart Supplement lists it). Look for traffic pattern indicators at the segmented circle. <span class=\"src\">14 CFR 91.126(b)</span>"); }
  build(); intro(); if (opts.entries) { entryChips.set("e45"); showEntry("e45"); }
  return { destroy() { F.destroy(); } };
}
