// Right-of-way (14 CFR 91.113), seen from above (landing: from the side). Pick a situation: the aircraft with the right-of-way is
// drawn in the accent, the one that gives way in ink with its new course dashed; a faint X marks where the two paths would meet.
import { frame, chips, svg, drawOn, ACC } from "./base.js?v=ac9b353384";
import { s } from "../core/util.js?v=ac9b353384";
import { T } from "./shapes.js?v=ac9b353384";
const INK = "#F2F1EC";
const CASES = {
  conv: { cap: ["Converging", "The one on the right has it"], t: "Same category, about the same altitude, converging (not head-on): the aircraft to the other's right has the right-of-way. The other gives way and does not pass over, under or ahead unless well clear. <span class=\"src\">91.113(b), (d)</span>", a: [700, 640, -45], b: [1180, 420, -135], who: "b", give: "M700,640 Q760,560 860,600" },
  head: { cap: ["Head-on", "Both turn right"], t: "Approaching head-on or nearly so: each pilot alters course to the right. <span class=\"src\">91.113(e)</span>", a: [380, 450, 0], b: [1220, 450, 180], who: "both", give: "M380,450 Q560,450 640,540", give2: "M1220,450 Q1040,450 960,360" },
  over: { cap: ["Overtaking", "Pass on the right, well clear"], t: "The aircraft being overtaken has the right-of-way. The overtaking pilot alters course to the right to pass well clear. <span class=\"src\">91.113(f)</span>", a: [460, 450, 0], b: [900, 450, 0], who: "b", give: "M460,450 Q640,450 760,560 L1060,560" },
  land: { cap: ["Two arriving to land", "The lower one has it"], t: "Aircraft on final or landing have the right-of-way. Of two approaching to land, the lower has it, but may not cut in front of one already on final or overtake it. <span class=\"src\">91.113(g)</span>", a: [620, 300, 0], b: [700, 620, 0], who: "b", alt: ["higher", "lower"] },
  cat: { cap: ["Different categories", "Least maneuverable first"], t: "A balloon has the right-of-way over any other category. A glider over powered aircraft. An airship over other powered aircraft, except one towing or refueling another, which has it over all other powered aircraft. An aircraft in distress has it over everyone. <span class=\"src\">91.113(c), (d)</span>", list: true },
};
// top-down airplane, nose along +x, about 150 units span; side-view airplane for the landing case
const TOP = "M64,0 L48,-8 L-46,-6 L-58,0 L-46,6 L48,8 Z M14,-8 L6,-74 L-10,-74 L-8,-8 Z M14,8 L6,74 L-10,74 L-8,8 Z M-40,-6 L-48,-28 L-58,-28 L-56,-6 Z M-40,6 L-48,28 L-58,28 L-56,6 Z";
const SIDE = "M70,4 L56,-8 L22,-14 L-40,-8 L-62,-34 L-74,-34 L-70,6 L50,12 Z M-6,-14 L30,-14";
function plane(g, x, y, rot, on, side) { return s("path", { d: side ? SIDE : TOP, transform: `translate(${x} ${y}) rotate(${rot}) scale(1.3)`, fill: "#0B0B0C", stroke: on ? ACC : INK, "stroke-width": 3, "stroke-linejoin": "round", opacity: on ? 1 : 0.85, ...(on ? { filter: "url(#gw)" } : {}) }, g); }
function arrow(g, d, on) { return s("path", { d, fill: "none", stroke: on ? ACC : INK, "stroke-width": 3, opacity: on ? 0.9 : 0.55, "marker-end": on ? "url(#ah)" : "url(#ahw)" }, g); }
function dashed(g, d) { const p = s("path", { d, fill: "none", stroke: INK, "stroke-width": 3.5, "stroke-dasharray": "14 12", opacity: 0.85, "marker-end": "url(#ahw)" }, g); drawOn(p, { dur: 1400 }); return p; }
function cross(g, x, y) { s("path", { d: `M${x - 16},${y - 16} L${x + 16},${y + 16} M${x + 16},${y - 16} L${x - 16},${y + 16}`, stroke: INK, "stroke-width": 3, opacity: 0.35 }, g); }
const lab = (g, x, y, t, on, anchor = "middle") => T(g, x, y, t, { anchor, size: 32, op: on ? 1 : 0.8, fill: on ? ACC : INK });
const SCENES = {
  conv(g) { // A flies north, B flies west from A's right: B has it; A turns right and passes behind B
    cross(g, 330, 300); arrow(g, "M330,640 L330,500", false); arrow(g, "M700,300 L520,300", true);
    plane(g, 330, 700, -90, false); plane(g, 780, 300, 180, true); dashed(g, "M330,610 C330,470 520,430 620,420");
    lab(g, 960, 168, "Has the right-of-way", true, "end"); lab(g, 445, 712, "Gives way: turns right", false, "start"); },
  head(g) { // nose to nose: both alter course to the right
    cross(g, 500, 400); arrow(g, "M240,400 L360,400", false); arrow(g, "M760,400 L640,400", false);
    plane(g, 160, 400, 0, false); plane(g, 840, 400, 180, false);
    dashed(g, "M230,430 C330,440 380,520 440,600"); dashed(g, "M770,370 C670,360 620,280 560,200");
    lab(g, 50, 290, "Turns right", false, "start"); lab(g, 950, 530, "Turns right", false, "end"); },
  over(g) { // B ahead, A behind and faster: A passes on B's right, well clear
    arrow(g, "M680,360 L800,360", true); plane(g, 600, 360, 0, true); plane(g, 150, 360, 0, false);
    dashed(g, "M250,390 C340,400 380,560 470,560 L820,560");
    lab(g, 620, 250, "Being overtaken: has it", true); lab(g, 150, 485, "Overtaking", false); lab(g, 620, 640, "Passes on the right", false); },
  land(g) { // side view: the lower of two arriving airplanes has it
    s("line", { x1: 40, y1: 700, x2: 960, y2: 700, stroke: INK, "stroke-width": 2, opacity: 0.35 }, g);
    s("rect", { x: 640, y: 690, width: 320, height: 20, fill: "none", stroke: INK, "stroke-width": 3, opacity: 0.8 }, g); lab(g, 800, 760, "Runway", false);
    for (const [x, y] of [[120, 250], [330, 470]]) s("path", { d: `M${x + 80},${y + 20} L700,690`, stroke: INK, "stroke-width": 2, "stroke-dasharray": "6 10", opacity: 0.3 }, g);
    plane(g, 120, 250, 16, false, true); plane(g, 330, 470, 16, true, true);
    lab(g, 120, 160, "Higher: gives way", false, "start"); lab(g, 330, 390, "Lower: has it", true, "start"); },
  cat(g) { const rows = ["In distress: over all", "Balloon", "Glider", "Airship", "Towing or refueling", "Other powered aircraft"];
    rows.forEach((r, i) => { const y = 195 + i * 100; s("rect", { x: 140, y: y - 42, width: 720, height: 68, rx: 10, fill: "#0B0B0C", stroke: i === 0 ? ACC : INK, "stroke-width": i === 0 ? 3 : 2, opacity: i === 0 ? 1 : 0.55, ...(i === 0 ? { filter: "url(#gw)" } : {}) }, g); T(g, 500, y + 2, r, { anchor: "middle", size: 32, op: i === 0 ? 1 : 0.85, fill: i === 0 ? ACC : INK }); });
    T(g, 500, 820, "Each gives way to everything above it", { anchor: "middle", size: 28, op: 0.6, upper: false }); },
};
export function mount(host) {
  const F = frame(host, { cls: "capin rowv", corners: { tl: "Seen from above", tr: "14 CFR 91.113" } });
  const el = svg(F.stage, "0 0 1000 850"); const g = s("g", {}, el);
  function show(k) { g.innerHTML = ""; const c = CASES[k]; SCENES[k](g);
    F.corner("tl", k === "land" ? "Seen from the side" : k === "cat" ? "Who has priority" : "Seen from above");
    F.caption(c.cap[0], c.cap[1]); const KEY = { conv: "Blue: has the right-of-way. Dashed: the new course of the one that gives way.", over: "Blue: has the right-of-way. Dashed: the new course of the one that gives way.", head: "Neither has the right-of-way. Dashed: each airplane's new course.", land: "Blue: has the right-of-way." };
    F.explain(c.t + (KEY[k] ? ` <span class="src">${KEY[k]}</span>` : "")); }
  chips(F.ctrl, [["conv", "Converging"], ["head", "Head-on"], ["over", "Overtaking"], ["land", "Landing"], ["cat", "Categories"]], "conv", show, { label: "Situation" });
  show("conv");
  return { destroy() { F.destroy(); } };
}
