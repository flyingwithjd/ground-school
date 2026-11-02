// Right-of-way (14 CFR 91.113). Pick a situation; the airplane that must give way is drawn faint, the one with the right-of-way in the accent.
import { frame, chips, svg, drawOn, ACC, FAINT2 } from "./base.js?v=e7b6cbaa08";
import { s } from "../core/util.js?v=e7b6cbaa08";
import { T } from "./shapes.js?v=e7b6cbaa08";
const CASES = {
  conv: { cap: ["Converging", "The one on the right has it"], t: "Same category, about the same altitude, converging (not head-on): the aircraft to the other's right has the right-of-way. The other gives way and does not pass over, under or ahead unless well clear. <span class=\"src\">91.113(b), (d)</span>", a: [700, 640, -45], b: [1180, 420, -135], who: "b", give: "M700,640 Q760,560 860,600" },
  head: { cap: ["Head-on", "Both turn right"], t: "Approaching head-on or nearly so: each pilot alters course to the right. <span class=\"src\">91.113(e)</span>", a: [380, 450, 0], b: [1220, 450, 180], who: "both", give: "M380,450 Q560,450 640,540", give2: "M1220,450 Q1040,450 960,360" },
  over: { cap: ["Overtaking", "Pass on the right, well clear"], t: "The aircraft being overtaken has the right-of-way. The overtaking pilot alters course to the right to pass well clear. <span class=\"src\">91.113(f)</span>", a: [460, 450, 0], b: [900, 450, 0], who: "b", give: "M460,450 Q640,450 760,560 L1060,560" },
  land: { cap: ["Two arriving to land", "The lower one has it"], t: "Aircraft on final or landing have the right-of-way. Of two approaching to land, the lower has it, but may not cut in front of one already on final or overtake it. <span class=\"src\">91.113(g)</span>", a: [620, 300, 0], b: [700, 620, 0], who: "b", alt: ["higher", "lower"] },
  cat: { cap: ["Different categories", "Least maneuverable first"], t: "A balloon has the right-of-way over any other category. A glider over powered aircraft. An airship over other powered aircraft, except one towing or refueling another, which has it over all other powered aircraft. An aircraft in distress has it over everyone. <span class=\"src\">91.113(c), (d)</span>", list: true },
};
function plane(g, x, y, rot, on) { const p = s("path", { d: "M26,0 L-14,-4 L-18,-30 L-24,-30 L-24,30 L-18,30 L-14,4 Z M-40,-2 L-40,-12 L-46,-12 L-46,12 L-40,12 L-40,2 M-14,-2 L-40,-2 M-14,2 L-40,2", transform: `translate(${x} ${y}) rotate(${rot}) scale(1.5)`, fill: "none", stroke: on ? ACC : FAINT2, "stroke-width": 2, ...(on ? { filter: "url(#gw)" } : {}) }, g); return p; }
export function mount(host) {
  const F = frame(host, { corners: { tl: "Right-of-way", tr: "14 CFR 91.113" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  function show(k) { g.innerHTML = ""; const c = CASES[k];
    if (c.list) { F.corner("tl", "Right-of-way"); const rows = ["In distress: over all traffic", "Balloon", "Glider", "Airship", "Towing or refueling", "Other powered aircraft"]; rows.forEach((r, i) => { const y = 140 + i * 90; s("line", { x1: 520, y1: y + 10, x2: 1080, y2: y + 10, stroke: i === 0 ? ACC : FAINT2, "stroke-width": i === 0 ? 2.5 : 1.5, ...(i === 0 ? { filter: "url(#gw)" } : {}) }, g); T(g, 800, y, r, { anchor: "middle", size: 22, op: i === 0 ? 1 : 0.7, fill: i === 0 ? ACC : "#F2F1EC" }); });
      T(g, 800, 700, "↓ gives way to everything above", { anchor: "middle", size: 15, op: 0.45, upper: false }); }
    else { const pa = plane(g, ...c.a, c.who === "both"), pb = plane(g, ...c.b, c.who !== "a");
      if (c.alt) { T(g, c.a[0], c.a[1] - 60, c.alt[0], { anchor: "middle", size: 15, op: 0.55 }); T(g, c.b[0], c.b[1] - 60, c.alt[1], { anchor: "middle", size: 15, op: 0.9, fill: ACC }); s("rect", { x: 1000, y: 600, width: 520, height: 36, fill: "none", stroke: "#F2F1EC", opacity: 0.6, "stroke-width": 2 }, g); T(g, 1260, 680, "runway", { anchor: "middle", size: 14, op: 0.45 }); }
      for (const d of [c.give, c.give2]) if (d) { const p = s("path", { d, fill: "none", stroke: "rgba(242,241,236,.6)", "stroke-width": 2.5, "stroke-dasharray": "10 10", "marker-end": "url(#ahw)" }, g); drawOn(p, { dur: 1400 }); }
      F.corner("tl", "Right-of-way\n" + (c.who === "both" ? "Both give way\nDashed: new course" : "Blue: right-of-way\nDashed: gives way")); }
    F.caption(c.cap[0], c.cap[1]); F.explain(c.t); }
  chips(F.ctrl, [["conv", "Converging"], ["head", "Head-on"], ["over", "Overtaking"], ["land", "Landing"], ["cat", "Categories"]], "conv", show, { label: "Situation" });
  show("conv");
  return { destroy() { F.destroy(); } };
}
