// Segmented circle (AIM 4-3-4; PHAK Ch 14). Set the wind; the wind sock swings; pick the runway most nearly into the wind
// and read the traffic pattern indicators. Example airport: runway 9-27, right traffic for runway 27.
import { frame, chips, slider, svg, readout, drawOn, loop, ACC, FAINT, FAINT2, INK } from "./base.js?v=522c4707bc";
import { s } from "../core/util.js?v=522c4707bc";
import { T } from "./shapes.js?v=522c4707bc";
const CX = 960, CY = 430, R = 140, D2R = Math.PI / 180;
export function mount(host, opts = {}) {
  const F = frame(host, { corners: { tl: "Segmented circle · example airport", tr: "AIM 4-3-4" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  // runway 9-27 below the circle
  s("rect", { x: 520, y: 700, width: 880, height: 46, fill: "none", stroke: FAINT2, "stroke-width": 2 }, g);
  T(g, 560, 731, "9", { anchor: "middle", size: 20, op: 0.7, sans: true, weight: 700 }); T(g, 1360, 731, "27", { anchor: "middle", size: 20, op: 0.7, sans: true, weight: 700 });
  // circle segments
  for (let i = 0; i < 12; i++) { const a0 = i * 30 + 4, a1 = i * 30 + 26; const P = (a) => [CX + R * Math.sin(a * D2R), CY - R * Math.cos(a * D2R)];
    const [x0, y0] = P(a0), [x1, y1] = P(a1); s("path", { d: `M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}`, stroke: FAINT2, "stroke-width": 10, fill: "none" }, g); }
  // landing strip indicators (aligned with 9-27) and traffic pattern indicators
  const ind = {}; const mkInd = (k, x0, x1, xb, yb) => { const gg = s("g", {}, g); ind[k] = { g: gg, lines: [s("line", { x1: x0, y1: CY, x2: x1, y2: CY, stroke: FAINT2, "stroke-width": 12 }, gg), s("line", { x1: xb, y1: CY, x2: xb, y2: yb, stroke: FAINT2, "stroke-width": 12 }, gg)] }; };
  mkInd("27", CX + R + 30, CX + R + 170, CX + R + 170, CY - 90); // approach end of 27 is east; base leg to the north = right traffic
  mkInd("9", CX - R - 30, CX - R - 170, CX - R - 170, CY - 90);   // approach end of 9 is west; base to the north = left traffic
  T(g, CX + R + 100, CY + 40, "rwy 27 · right", { anchor: "middle", size: 13, op: 0.5 }); T(g, CX - R - 100, CY + 40, "rwy 9 · left", { anchor: "middle", size: 13, op: 0.5 });
  // wind sock (center) and tetrahedron
  const sock = s("g", {}, g); s("line", { x1: 0, y1: 0, x2: 0, y2: -6, stroke: INK, "stroke-width": 4 }, sock);
  const cone = s("path", { d: "", fill: "none", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, sock);
  const tet = s("path", { d: "M0,-70 L28,50 L-28,50 Z M0,-70 L0,50", fill: "none", stroke: FAINT2, "stroke-width": 3 }, g);
  // wind arrow (upwind side)
  const wa = s("line", { x1: 0, y1: 0, x2: 0, y2: 0, stroke: ACC, "stroke-width": 4, "marker-end": "url(#ah)", filter: "url(#gw)" }, g);
  const ro = readout(F.ctrl, [["rw", "runway"], ["hw", "headwind"], ["xw", "crosswind"], ["tp", "pattern"]]);
  let wdir = opts.wind ?? 240, wkt = 12, showTet = false, flut = 0;
  const run = loop(F, (now) => { flut = Math.sin(now / 180) * (wkt > 15 ? 2 : 5); drawSock(); });
  function drawSock() { // sock streams downwind: the big end faces into the wind
    const L = 30 + Math.min(1, wkt / 15) * 70, droop = (1 - Math.min(1, wkt / 15)) * 55;
    cone.setAttribute("d", `M0,-16 L0,16 L${L},${8 + droop * 0.5 + flut} L${L},${-8 + droop * 0.5 + flut} Z`);
    sock.setAttribute("transform", `translate(${CX} ${CY}) rotate(${wdir + 90})`); }
  function update(anim) { drawSock();
    const ax = CX + 340 * Math.sin(wdir * D2R), ay = CY - 340 * Math.cos(wdir * D2R), bx = CX + 230 * Math.sin(wdir * D2R), by = CY - 230 * Math.cos(wdir * D2R);
    wa.setAttribute("x1", ax); wa.setAttribute("y1", ay); wa.setAttribute("x2", bx); wa.setAttribute("y2", by);
    const comp = (rh) => { const d = (wdir - rh) * D2R; return [wkt * Math.cos(d), wkt * Math.sin(d)]; };
    const c27 = comp(270), c9 = comp(90); const use = c27[0] >= c9[0] ? "27" : "9", c = use === "27" ? c27 : c9;
    for (const [k, v] of Object.entries(ind)) v.lines.forEach((l) => { const on = k === use; l.setAttribute("stroke", on ? ACC : FAINT2); on ? l.setAttribute("filter", "url(#gw)") : l.removeAttribute("filter"); });
    if (anim) ind[use].lines.forEach((l, i) => drawOn(l, { dur: 900, delay: i * 400 }));
    tet.setAttribute("opacity", showTet ? 1 : 0); tet.setAttribute("transform", `translate(${CX + 260} ${CY - 250}) rotate(${use === "27" ? -90 : 90}) scale(.8)`);
    ro("rw", use); ro("hw", Math.round(c[0]) + " kt"); ro("xw", Math.abs(Math.round(c[1])) + " kt " + (c[1] > 0.5 ? "from right" : c[1] < -0.5 ? "from left" : "")); ro("tp", use === "27" ? "Right" : "Left");
    F.caption(`Wind ${String(wdir).padStart(3, "0")}° at ${wkt}`, `Runway ${use}, ${use === "27" ? "right" : "left"} traffic`);
    F.explain(`The big end of the wind sock points into the wind. Land on the runway most nearly into the wind: here ${use}. Imagine the traffic pattern indicator for that runway's approach end enlarged: its short arm is the base leg, so the pattern is on that side. All turns are left unless an indicator shows right.${showTet ? " The tetrahedron's small end points in the direction of landing; it may be set by hand, so check the wind sock too." : ""} <span class="src">AIM 4-3-4; AC 90-66C 11.5; PHAK Ch 14</span>`); }
  slider(F.ctrl, { label: "Wind from", min: 0, max: 355, step: 5, value: wdir, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { wdir = v; update(false); } });
  slider(F.ctrl, { label: "Wind speed", min: 0, max: 25, value: wkt, fmt: (v) => v + " kt", oninput: (v) => { wkt = v; update(false); } });
  chips(F.ctrl, [["0", "Wind sock"], ["1", "+ Tetrahedron"]], "0", (v) => { showTet = v === "1"; update(false); }, { label: "Indicators" });
  update(true); run.start();
  return { destroy: () => F.destroy() };
}
