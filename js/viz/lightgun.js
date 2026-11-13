// ATC light gun signals (AIM 4-3-13; 14 CFR 91.125). Pick where you are, tap a signal, read its meaning.
import { frame, chips, svg, loop, FAINT, FAINT2, INK } from "./base.js?v=da5a58a7ab";
import { s, reduced } from "../core/util.js?v=da5a58a7ab";
import { T } from "./shapes.js?v=da5a58a7ab";
const COL = { g: "#39D98A", r: "#FF4D4D", w: "#FFF7E0" };
const SIG = {
  sg: ["Steady green", ["g"], "steady", "Cleared for takeoff", "Cleared to land"],
  fg: ["Flashing green", ["g"], "flash", "Cleared to taxi", "Return for landing (to be followed by steady green at the proper time)"],
  sr: ["Steady red", ["r"], "steady", "Stop", "Give way to other aircraft and continue circling"],
  fr: ["Flashing red", ["r"], "flash", "Taxi clear of the runway in use", "Airport unsafe, do not land"],
  fw: ["Flashing white", ["w"], "flash", "Return to starting point on airport", "Not applicable"],
  rg: ["Alternating red and green", ["r", "g"], "alt", "Exercise extreme caution", "Exercise extreme caution"],
};
export function mount(host, opts = {}) {
  const F = frame(host, { corners: { tl: "Light gun signals", tr: "AIM 4-3-13" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  s("path", { d: "M1180,760 L1200,360 L1320,360 L1340,760 M1160,360 L1360,360 L1340,280 L1180,280 Z", fill: "none", stroke: FAINT2, "stroke-width": 2 }, g); T(g, 1260, 800, "tower", { anchor: "middle", size: 14, op: 0.5 });
  const beam = s("path", { d: "M1190,320 L420,180 L420,460 Z", fill: COL.g, opacity: 0.08 }, g);
  const lamp = s("circle", { cx: 1190, cy: 320, r: 26, fill: COL.g }, g), halo = s("circle", { cx: 1190, cy: 320, r: 80, fill: COL.g, opacity: 0.2, filter: "url(#gw2)" }, g);
  const you = T(g, 300, 330, "you", { anchor: "middle", size: 16, op: 0.6 });
  let where = opts.where || "ground", k = "sg";
  const paint = (c, o) => { [lamp, halo, beam].forEach((e) => e.setAttribute("fill", COL[c])); lamp.setAttribute("opacity", o); halo.setAttribute("opacity", 0.25 * o); beam.setAttribute("opacity", 0.1 * o); };
  const run = loop(F, (now) => { const [, cols, kind] = SIG[k]; if (kind === "steady") paint(cols[0], 1); else if (kind === "flash") paint(cols[0], Math.floor(now / 450) % 2 ? 1 : 0.05); else paint(cols[Math.floor(now / 700) % 2], 1); });
  function show() { const [name, cols, , gnd, air] = SIG[k]; if (reduced()) paint(cols[0], 1); const m = where === "ground" ? gnd : air;
    F.caption(name + (where === "ground" ? " · on the ground" : " · in flight"), m);
    F.explain(`In daylight, acknowledge tower transmissions or light signals by moving the ailerons or rudder; at night, blink the landing or navigation lights. A light signal can only approve or disapprove what you seem to be about to do. If the radio fails after leaving the parking area, watch the tower for light signals and keep monitoring the tower frequency. <span class="src">AIM 4-3-13</span>`); }
  chips(F.ctrl, [["ground", "On the ground"], ["air", "In flight"]], where, (v) => { where = v; you.textContent = v === "ground" ? "you · taxiing" : "you · in the pattern"; show(); }, { label: "Where you are" });
  chips(F.ctrl, Object.entries(SIG).map(([id, v]) => [id, v[0]]), k, (v) => { k = v; show(); }, { label: "Signal" });
  show(); run.start();
  return { destroy: () => F.destroy() };
}
