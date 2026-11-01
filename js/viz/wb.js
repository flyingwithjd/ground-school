// Weight & balance calculator that plots on the C172S CG envelope (limits from POH Sec 2; arms from POH Sec 6).
// Defaults reproduce the POH sample loading problem's empty weight. Always use YOUR airplane's actual empty weight and moment.
import { frame, slider, chips, readout, svg, ACC, FAINT, FAINT2 } from "./base.js?v=522c4707bc";
import { s, h } from "../core/util.js?v=522c4707bc";
import { T } from "./shapes.js?v=522c4707bc";
const ARM = { front: 37, rear: 73, bagA: 95, bagB: 123, fuel: 48 };
const NORMAL = [[35, 1500], [35, 1950], [41, 2550], [47.3, 2550], [47.3, 1500]], UTIL = [[35, 1500], [35, 1950], [37.5, 2200], [40.5, 2200], [40.5, 1500]];
const fwdLimit = (w) => (w <= 1950 ? 35 : 35 + ((w - 1950) / 600) * 6);
export function mount(host) {
  const F = frame(host, { cls: "tall capin", corners: { tl: "Weight & balance · C172S envelope", tr: "POH Sec 2, 6" } });
  const el = svg(F.stage, "0 0 1600 1100"); const g = s("g", {}, el);
  const X0 = 170, X1 = 1540, Y0 = 940, Y1 = 90, C0 = 33, C1 = 49, W0 = 1500, W1 = 2650;
  const X = (c) => X0 + ((c - C0) / (C1 - C0)) * (X1 - X0), Y = (w) => Y0 - ((w - W0) / (W1 - W0)) * (Y0 - Y1);
  s("path", { d: `M${X0},${Y1} L${X0},${Y0} L${X1},${Y0}`, fill: "none", stroke: FAINT2, "stroke-width": 1.5 }, g);
  for (let c = 34; c <= 48; c += 2) { s("line", { x1: X(c), y1: Y0, x2: X(c), y2: Y0 + 10, stroke: FAINT2 }, g); T(g, X(c), Y0 + 38, c, { anchor: "middle", size: 18, op: 0.5 }); }
  for (let w = 1600; w <= 2600; w += 200) { s("line", { x1: X0 - 10, y1: Y(w), x2: X0, y2: Y(w), stroke: FAINT2 }, g); T(g, X0 - 18, Y(w) + 6, w.toLocaleString(), { anchor: "end", size: 18, op: 0.5 }); }
  T(g, X1, Y0 + 76, "CG · inches aft of datum", { anchor: "end", size: 16, op: 0.5 }); T(g, X0, Y1 - 30, "weight · lb", { size: 16, op: 0.5 });
  const poly = (P, attrs) => s("path", { d: "M" + P.map(([c, w]) => `${X(c).toFixed(1)},${Y(w).toFixed(1)}`).join(" L"), fill: "none", ...attrs }, g);
  const envN = poly(NORMAL, { stroke: "#F2F1EC", "stroke-width": 2.5, opacity: 0.8 }); const envU = poly(UTIL, { stroke: FAINT2, "stroke-width": 1.5, "stroke-dasharray": "8 8" });
  T(g, X(44.2), Y(2550) + 34, "normal category · 2,550 lb max", { anchor: "middle", size: 15, op: 0.6 }); T(g, X(37.8), Y(2200) - 14, "utility", { anchor: "middle", size: 14, op: 0.45 });
  const path = s("line", { stroke: ACC, "stroke-width": 2.5, "stroke-dasharray": "6 6", opacity: 0.8 }, g);
  const pTO = s("circle", { r: 11, fill: ACC, filter: "url(#gw)" }, g), pL = s("circle", { r: 9, fill: "none", stroke: ACC, "stroke-width": 3 }, g);
  const tTO = T(g, 0, 0, "takeoff", { size: 15, op: 0.9, fill: ACC }), tL = T(g, 0, 0, "landing", { size: 15, op: 0.7, fill: ACC });
  // empty weight inputs
  const emp = h("div", { class: "numrow" });
  const num = (label, v, step) => { const i = h("input", { type: "number", value: v, step, inputmode: "decimal", "aria-label": label }); emp.append(h("label", {}, h("span", { class: "label" }, label), i)); i.addEventListener("input", calc); return i; };
  const eW = num("Empty weight lb", 1642, 1), eM = num("Empty moment ÷1000", 62.6, 0.1); F.ctrl.append(emp);
  const V = { front: 340, rear: 310, bagA: 56, bagB: 0, fuel: 35, burn: 0 };
  const S = {};
  const add = (k, label, max, unit = "lb") => (S[k] = slider(F.ctrl, { label, min: 0, max, step: 1, value: V[k], fmt: (v) => `${v} ${unit}`, oninput: (v) => { V[k] = v; if (k === "fuel" && V.burn > v) S.burn.set(v, false), (V.burn = v); calc(); } }));
  add("front", "Pilot + front passenger", 440); add("rear", "Rear seats", 400); add("bagA", "Baggage area A", 120); add("bagB", "Baggage area B", 50); add("fuel", "Fuel (usable)", 53, "gal"); add("burn", "Fuel burned in flight", 53, "gal");
  const set = readout(F.ctrl, [["w", "takeoff weight"], ["m", "moment ÷1000"], ["cg", "takeoff CG"], ["lcg", "landing CG"]]);
  const tbl = h("div", { class: "wbtable" }); F.ctrl.append(tbl);
  function calc() { const ew = +eW.value || 0, em = (+eM.value || 0) * 1000;
    const rows = [["Empty", ew, ew ? em / ew : 0, em], ["Front seats", V.front, ARM.front], ["Rear seats", V.rear, ARM.rear], ["Baggage A", V.bagA, ARM.bagA], ["Baggage B", V.bagB, ARM.bagB], ["Fuel", V.fuel * 6, ARM.fuel], ["Start, taxi, runup", -8, 0, -400]].map((r) => [r[0], r[1], r[2], r[3] ?? r[1] * r[2]]);
    const ramp = rows.slice(0, 6).reduce((a, r) => a + r[1], 0); const w = rows.reduce((a, r) => a + r[1], 0), m = rows.reduce((a, r) => a + r[3], 0), cg = m / w;
    const lw = w - V.burn * 6, lm = m - V.burn * 6 * ARM.fuel, lcg = lm / lw;
    tbl.innerHTML = `<table><thead><tr><th>Item</th><th>Weight</th><th>Arm</th><th>Moment/1000</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td>${Math.round(r[1])}</td><td>${r[2] ? r[2].toFixed(1) : "–"}</td><td>${(r[3] / 1000).toFixed(1)}</td></tr>`).join("")}<tr class="tot"><td>Takeoff</td><td>${Math.round(w)}</td><td>${cg.toFixed(1)}</td><td>${(m / 1000).toFixed(1)}</td></tr></tbody></table>`;
    set("w", `${Math.round(w).toLocaleString()} lb`); set("m", (m / 1000).toFixed(1)); set("cg", `${cg.toFixed(1)} in`); set("lcg", `${lcg.toFixed(1)} in`);
    const pos = (c, ww) => [Math.min(X1, Math.max(X0, X(c))), Math.min(Y0, Math.max(Y1, Y(ww)))];
    const [x1, y1] = pos(cg, w), [x2, y2] = pos(lcg, lw); pTO.setAttribute("cx", x1); pTO.setAttribute("cy", y1); pL.setAttribute("cx", x2); pL.setAttribute("cy", y2); pL.style.display = V.burn ? "" : "none"; tL.style.display = V.burn ? "" : "none";
    path.setAttribute("x1", x1); path.setAttribute("y1", y1); path.setAttribute("x2", x2); path.setAttribute("y2", y2); tTO.setAttribute("x", x1 + 18); tTO.setAttribute("y", y1 - 12); tL.setAttribute("x", x2 + 18); tL.setAttribute("y", y2 + 24);
    const issues = []; if (ramp > 2558) issues.push(`over the 2,558 lb maximum ramp weight`); if (w > 2550) issues.push(`over the 2,550 lb maximum takeoff weight by ${Math.round(w - 2550)} lb`);
    if (V.bagA + V.bagB > 120) issues.push("combined baggage over 120 lb"); if (cg < fwdLimit(w)) issues.push("CG forward of the limit"); if (cg > 47.3) issues.push("CG aft of the 47.3 in limit");
    if (lw && (lcg < fwdLimit(lw) || lcg > 47.3)) issues.push("landing CG outside the envelope");
    const util = w <= 2200 && cg >= (w <= 1950 ? 35 : 35 + ((w - 1950) / 250) * 2.5) && cg <= 40.5 && V.rear === 0 && V.bagA + V.bagB === 0;
    envN.setAttribute("stroke", issues.length ? "#F2F1EC" : ACC); envN.setAttribute("filter", issues.length ? "" : "url(#gw)");
    F.caption(issues.length ? "Outside limits" : util ? "Within limits · utility too" : "Within limits", issues.length ? "Do not fly this loading" : `${Math.round(w).toLocaleString()} lb at ${cg.toFixed(1)} in`);
    F.explain(issues.length ? "This loading is " + issues.join("; ") + ". Move or remove weight and recompute." : `CG = total moment ÷ total weight. The POH allows 8 lb of fuel for start, taxi and runup between ramp (2,558 lb max) and takeoff weight. Fuel sits at station 48, near the CG, so burning it moves the CG only a little. ${util ? "With no rear passengers or baggage, the utility category limits are also met." : "Utility category needs ≤ 2,200 lb, no rear passengers and no baggage."} <span class="src">POH 2, 6</span> <span class="dim">The defaults reproduce the POH sample loading; use your aircraft's actual W&amp;B record.</span>`); }
  calc();
  return { destroy() { F.destroy(); } };
}
