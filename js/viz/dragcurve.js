// Drag vs airspeed: slide the airspeed, watch parasite and induced drag trade off. Simple textbook model:
// parasite ∝ V², induced ∝ 1/V², with the minimum placed at the 172S best-glide speed (68 KIAS, POH Sec 3).
import { frame, slider, chips, readout, svg, drawOn, ACC, FAINT, FAINT2 } from "./base.js?v=58ff22094c";
import { s } from "../core/util.js?v=58ff22094c";
import { T } from "./shapes.js?v=58ff22094c";
const VLD = 68, V0 = 42, V1 = 140, VMP = VLD / Math.pow(3, 0.25);
const par = (v) => (v / VLD) ** 2, ind = (v) => (VLD / v) ** 2, tot = (v) => par(v) + ind(v);
export function mount(host) {
  const F = frame(host, { cls: "capin", corners: { tl: "Drag vs airspeed · model", tr: "PHAK 5, 11" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  const X0 = 170, X1 = 1500, Y0 = 760, Y1 = 70, YMAX = 5.2;
  const X = (v) => X0 + ((v - V0) / (V1 - V0)) * (X1 - X0), Y = (d) => Y0 - (Math.min(d, YMAX) / YMAX) * (Y0 - Y1);
  s("path", { d: `M${X0},${Y1} L${X0},${Y0} L${X1},${Y0}`, fill: "none", stroke: FAINT2, "stroke-width": 1.5 }, g);
  for (let v = 50; v <= 140; v += 10) { s("line", { x1: X(v), y1: Y0, x2: X(v), y2: Y0 + 10, stroke: FAINT2 }, g); T(g, X(v), Y0 + 38, v, { anchor: "middle", size: 16, op: 0.5 }); }
  T(g, X1, Y0 + 72, "indicated airspeed · knots", { anchor: "end", size: 15, op: 0.5 }); T(g, X0, Y1 - 24, "drag (relative)", { size: 15, op: 0.5 });
  const curve = (f) => { let d = ""; for (let v = V0; v <= V1; v += 0.5) d += (d ? " L" : "M") + X(v).toFixed(1) + "," + Y(f(v)).toFixed(1); return d; };
  const C = { parasite: s("path", { d: curve(par), fill: "none", stroke: FAINT2, "stroke-width": 2.5 }, g), induced: s("path", { d: curve(ind), fill: "none", stroke: FAINT2, "stroke-width": 2.5 }, g), total: s("path", { d: curve(tot), fill: "none", stroke: "#F2F1EC", "stroke-width": 3, opacity: 0.85 }, g) };
  T(g, X(132), Y(par(132)) - 18, "parasite", { anchor: "end", size: 16, op: 0.6 }); T(g, X(46) + 10, Y(ind(46)) + 4, "induced", { size: 16, op: 0.6 }); T(g, X(120), Y(tot(120)) - 20, "total", { anchor: "end", size: 16, op: 0.8 });
  s("line", { x1: X(VLD), y1: Y0, x2: X(VLD), y2: Y1 + 60, stroke: FAINT, "stroke-dasharray": "6 8", "stroke-width": 1.5 }, g); T(g, X(VLD) + 10, Y1 + 76, "L/D max · best glide 68", { size: 15, op: 0.65 });
  s("line", { x1: X(VMP), y1: Y0, x2: X(VMP), y2: Y1 + 140, stroke: FAINT, "stroke-dasharray": "3 8", "stroke-width": 1.5 }, g); T(g, X(VMP) - 10, Y1 + 156, "min power (model)", { anchor: "end", size: 14, op: 0.5 });
  const cur = s("line", { y1: Y0, y2: Y1, stroke: ACC, "stroke-width": 1.5, opacity: 0.5 }, g);
  const dots = { parasite: s("circle", { r: 7, fill: "#F2F1EC", opacity: 0.7 }, g), induced: s("circle", { r: 7, fill: "#F2F1EC", opacity: 0.7 }, g), total: s("circle", { r: 10, fill: ACC, filter: "url(#gw)" }, g) };
  const set = readout(F.ctrl, [["v", "airspeed"], ["p", "parasite"], ["i", "induced"], ["t", "total vs minimum"]]);
  let V = 68, sel = "total";
  function hl(k) { sel = k; for (const [kk, p] of Object.entries(C)) { const on = kk === k; p.setAttribute("stroke", on ? ACC : kk === "total" ? "#F2F1EC" : FAINT2); p.setAttribute("filter", on ? "url(#gw)" : ""); }
    drawOn(C[k], { dur: 1300 }); }
  function upd(v) { V = v; cur.setAttribute("x1", X(v)); cur.setAttribute("x2", X(v));
    for (const [k, f] of [["parasite", par], ["induced", ind], ["total", tot]]) { dots[k].setAttribute("cx", X(v)); dots[k].setAttribute("cy", Y(f(v))); }
    set("v", `${v} kt`); set("p", par(v).toFixed(2)); set("i", ind(v).toFixed(2)); set("t", `${(tot(v) / 2).toFixed(2)}×`);
    if (v < VMP) { F.caption("Region of reversed command", "Slower needs more power"); F.explain("Below the minimum-power speed, holding altitude at a lower airspeed takes <strong>more</strong> power. Pulling the nose up here without adding power only makes you slower and lower. <span class=\"src\">PHAK 11</span>"); }
    else if (v < VLD - 2) { F.caption("Behind L/D max", "Induced drag dominates"); F.explain("Slowing down here raises total drag: the wing needs a higher AOA, which makes more induced drag."); }
    else if (v <= VLD + 2) { F.caption("L/D max", "Least total drag"); F.explain("Parasite and induced drag are equal and total drag is lowest. With the engine out, this is where the airplane glides farthest: 68 KIAS in the 172S. <span class=\"src\">POH 3</span>"); }
    else { F.caption("Normal command", "Parasite drag dominates"); F.explain("Parasite drag grows with the square of airspeed: double the speed, about four times the parasite drag. <span class=\"src\">PHAK 5</span>"); } }
  slider(F.ctrl, { label: "Airspeed", min: V0 + 3, max: V1, step: 1, value: 68, fmt: (v) => `${v} kt`, oninput: upd });
  chips(F.ctrl, [["total", "Total"], ["parasite", "Parasite"], ["induced", "Induced"]], "total", hl, { label: "Highlight curve" });
  hl("total"); upd(68);
  return { destroy() { F.destroy(); } };
}
