// Taxiway and holding position markings (AIM 2-3-4, 2-3-5, 2-3-6; FAA hot spots). Plan view, schematic, not to scale.
// Tap a marking; switch between taxiing out and exiting the runway to see which side of the hold line you are on.
import { frame, chips, svg, isolate, drawOn, ACC, FAINT, FAINT2, INK } from "./base.js?v=98d92ee42f";
import { s } from "../core/util.js?v=98d92ee42f";
import { T, topPlane } from "./shapes.js?v=98d92ee42f";
const Y = "rgba(242,241,236,.5)", TX = 800, TW = 46, RY = 170, RH = 80, HOLD = 330;
const INFO = {
  center: ["Taxiway centerline", "Keep the nosewheel on it", "A continuous yellow line. Keep the airplane centered over it. Being on the centerline does <b>not</b> guarantee wingtip clearance from other aircraft or objects. <span class=\"src\">AIM 2-3-4</span>"],
  enh: ["Enhanced centerline", "Runway ahead", "Yellow dashes on both sides of the centerline for up to 150 ft before a runway holding position marking. A warning that a hold line is coming. <span class=\"src\">AIM 2-3-4</span>"],
  hold: ["Runway holding position", "Hold on the solid side", "Four yellow lines, two solid and two dashed, across the taxiway. The solid lines are always on the side where you hold. At a towered airport, do not cross without an ATC clearance. At a nontowered airport, make sure you have adequate separation from other aircraft, vehicles and people before crossing. <span class=\"src\">AIM 2-3-5</span>"],
  ils: ["ILS critical area hold", "Hold here when told", "Two solid yellow lines joined by pairs of lines, like a ladder. When ATC says \"hold short of the ILS critical area,\" stop so no part of the airplane is beyond it. You are not clear of the critical area until every part of the airplane has crossed it. <span class=\"src\">AIM 2-3-5</span>"],
  twy: ["Taxiway/taxiway hold", "Hold when told", "A single dashed yellow line across the taxiway. Where ATC holds aircraft short of an intersecting taxiway. When told \"hold short of taxiway B,\" stop so no part of the airplane extends beyond it. <span class=\"src\">AIM 2-3-5</span>"],
  edge: ["Edge: continuous double", "Do not cross", "A continuous double yellow line marks a taxiway edge where the shoulder or adjoining pavement is not for aircraft. <span class=\"src\">AIM 2-3-4</span>"],
  edged: ["Edge: dashed double", "Adjoining pavement usable", "A dashed double yellow line marks a taxiway edge where the adjoining pavement, such as a run-up pad or apron, is intended for aircraft. <span class=\"src\">AIM 2-3-4</span>"],
  nmb: ["Nonmovement area boundary", "Ramp vs. movement area", "A solid yellow line on the nonmovement side and a dashed one on the movement side. At a towered airport, ATC controls you only on the movement side. <span class=\"src\">AIM 2-3-6</span>"],
  sps: ["Surface-painted signs", "Red: holding. Black: location", "A red sign with white numbers, left of the centerline, marks a holding position (here, runway 9-27). A black sign with a yellow letter, right of the centerline, tells you which taxiway you are on. <span class=\"src\">AIM 2-3-4</span>"],
  hs: ["Hot spot", "Heightened attention", "A location on an airport movement area with a history or potential risk of collision or runway incursion, where pilots and drivers need extra attention. Hot spots are shown on the airport diagram as circles or ellipses labeled HS 1, HS 2 and so on, and described in the Chart Supplement. This airport is fictional. <span class=\"src\">FAA Runway Safety: Hot Spots; Chart Supplement</span>"],
};
export function mount(host) {
  const F = frame(host, { cls: "capin", corners: { tl: "Taxiway & hold markings · schematic", tr: "AIM 2-3-4 to 2-3-6" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el), G = {}, mk = (k) => (G[k] = s("g", { class: "tap", role: "button", tabindex: 0, "aria-label": INFO[k][0] }, g));
  const L = (p, x1, y1, x2, y2, dash, w = 4) => s("line", { x1, y1, x2, y2, stroke: Y, "stroke-width": w, "data-ink": Y, ...(dash ? { "stroke-dasharray": dash } : {}) }, p);
  const hit = (p, x, y, w, h) => s("rect", { x, y, width: w, height: h, fill: "transparent" }, p);
  // runway
  s("rect", { x: 20, y: RY - RH, width: 1560, height: RH * 2, fill: "none", stroke: FAINT2, "stroke-width": 2 }, g);
  for (let x = 60; x < 1560; x += 110) s("line", { x1: x, y1: RY, x2: x + 60, y2: RY, stroke: FAINT2, "stroke-width": 4 }, g);
  T(g, 40, RY - RH - 14, "runway 9-27", { size: 14, op: 0.45 });
  // pavement outlines: taxiway A (vertical), B (left), run-up pad (left), ramp (right)
  s("path", { d: `M${TX - TW},${RY + RH} L${TX - TW},900 M${TX + TW},${RY + RH} L${TX + TW},900`, stroke: FAINT, "stroke-width": 1.5, fill: "none" }, g);
  s("rect", { x: 560, y: 440, width: TX - TW - 560, height: 110, fill: "none", stroke: FAINT, "stroke-width": 1.5 }, g); T(g, 580, 500, "run-up", { size: 13, op: 0.4 });
  s("rect", { x: 100, y: 660, width: TX - TW - 100, height: 80, fill: "none", stroke: FAINT, "stroke-width": 1.5 }, g); T(g, 130, 652, "taxiway B", { size: 13, op: 0.4 });
  s("rect", { x: TX + TW, y: 560, width: 700, height: 340, fill: "none", stroke: FAINT, "stroke-width": 1.5 }, g); T(g, 1200, 760, "ramp · nonmovement", { anchor: "middle", size: 14, op: 0.4 });
  T(g, TX + 70, 870, "taxiway A", { size: 13, op: 0.4 });
  // markings
  let p = mk("center"); L(p, TX, RY + RH, TX, 900, null, 4); L(p, TX - TW, 700, 100, 700, null, 4); hit(p, TX - 14, HOLD + 110, 28, 520);
  p = mk("enh"); for (const dx of [-12, 12]) L(p, TX + dx, HOLD + 12, TX + dx, HOLD + 110, "14 10", 3); hit(p, TX - 24, HOLD + 10, 48, 100);
  p = mk("hold"); [HOLD - 30, HOLD - 20].forEach((y) => L(p, TX - TW, y, TX + TW, y, "10 8", 4)); [HOLD - 8, HOLD + 2].forEach((y) => L(p, TX - TW, y, TX + TW, y, null, 4)); hit(p, TX - TW, HOLD - 40, TW * 2, 50);
  T(g, TX - TW - 14, HOLD - 18, "hold short", { anchor: "end", size: 13, op: 0.45 });
  p = mk("ils"); [600, 614].forEach((y) => L(p, TX - TW, y, TX + TW, y, null, 3)); for (let x = TX - TW + 8; x < TX + TW; x += 22) { L(p, x, 600, x, 614, null, 3); L(p, x + 5, 600, x + 5, 614, null, 3); } hit(p, TX - TW, 590, TW * 2, 34);
  p = mk("twy"); L(p, 620, 660, 620, 740, "10 8", 4); hit(p, 604, 660, 32, 80);
  p = mk("edge"); for (const dx of [0, 7]) { L(p, TX + TW - dx, RY + RH, TX + TW - dx, 560, null, 2.5); L(p, TX - TW + dx, RY + RH, TX - TW + dx, 440, null, 2.5); L(p, TX - TW + dx, 550, TX - TW + dx, 660, null, 2.5); } hit(p, TX + TW - 16, 300, 26, 250);
  p = mk("edged"); for (const dx of [0, 7]) L(p, TX - TW + dx, 440, TX - TW + dx, 550, "10 8", 2.5); hit(p, TX - TW - 12, 440, 26, 110);
  p = mk("nmb"); L(p, TX + TW + 12, 560, TX + TW + 12, 900, null, 3); L(p, TX + TW + 4, 560, TX + TW + 4, 900, "10 8", 3); hit(p, TX + TW - 4, 600, 30, 300);
  p = mk("sps"); s("rect", { x: TX - 40, y: HOLD + 130, width: 34, height: 46, fill: "rgba(190,40,40,.55)", stroke: "none", "data-ink": "none", "data-fillink": "rgba(190,40,40,.55)" }, p); s("rect", { x: TX + 6, y: HOLD + 130, width: 34, height: 46, fill: "rgba(20,20,20,1)", stroke: Y, "stroke-width": 2, "data-ink": Y }, p);
  T(p, TX - 23, HOLD + 159, "9-27", { anchor: "middle", size: 9, op: 0.95, sans: true, weight: 700 }); T(p, TX + 23, HOLD + 162, "A", { anchor: "middle", size: 20, op: 0.9, fill: "#e8c547", sans: true, weight: 700 });
  p = mk("hs"); s("ellipse", { cx: TX - 70, cy: 700, rx: 150, ry: 80, fill: "none", stroke: FAINT2, "stroke-width": 2.5, "stroke-dasharray": "3 9", "data-ink": FAINT2 }, p); T(p, TX - 210, 630, "HS 1", { size: 15, op: 0.6 });
  // airplane
  const plane = topPlane(g, { stroke: INK, w: 22 }); plane.setAttribute("opacity", 0.8);
  let where = "out";
  function placePlane() { if (where === "out") plane.setAttribute("transform", `translate(${TX} ${HOLD + 52}) scale(.075)`); else plane.setAttribute("transform", `translate(${TX} ${HOLD - 66}) rotate(180) scale(.075)`); }
  for (const [k, gg] of Object.entries(G)) { gg.addEventListener("click", () => pick(k)); gg.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && pick(k)); }
  const C = chips(F.ctrl, Object.keys(INFO).map((k) => [k, INFO[k][0]]), null, (k) => pick(k), { label: "Markings" });
  chips(F.ctrl, [["out", "Taxiing to the runway"], ["exit", "Exiting the runway"]], where, (v) => { where = v; placePlane(); pick("hold"); }, { label: "Where you are" });
  function pick(k) { C.set(k); isolate(G, k); F.caption(INFO[k][0], INFO[k][1]);
    let x = INFO[k][2];
    if (k === "hold") x += where === "out" ? " <b>You are on the solid side: stop before the lines</b> unless cleared (towered) or the way is clear (nontowered)." : " <b>You are on the dashed side, leaving the runway:</b> you are not clear of the runway until every part of the airplane has crossed the holding position marking. Do not stop on the lines. <span class=\"src\">AIM 2-3-5</span>";
    F.explain(x); }
  placePlane(); pick("hold");
  return { destroy: () => F.destroy() };
}
