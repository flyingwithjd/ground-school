// Weight & balance calculator that plots on the C172S CG envelope (limits from POH Sec 2; arms from POH Sec 6).
// Defaults reproduce the POH sample loading problem's empty weight. Always use YOUR airplane's actual empty weight and moment.
import { frame, slider, chips, readout, svg, ACC, FAINT, FAINT2 } from "./base.js?v=6e081c439c";
import { s, h } from "../core/util.js?v=6e081c439c";
import { T } from "./shapes.js?v=6e081c439c";
const ARM = { front: 37, rear: 73, bagA: 95, bagB: 123, fuel: 48 };
const NORMAL = [[35, 1500], [35, 1950], [41, 2550], [47.3, 2550], [47.3, 1500]], UTIL = [[35, 1500], [35, 1950], [37.5, 2200], [40.5, 2200], [40.5, 1500]];
const fwdLimit = (w) => (w <= 1950 ? 35 : 35 + ((w - 1950) / 600) * 6);
export function mount(host) {
  const F = frame(host, { cls: "tall capin", clamp: true });   // no corner labels: the chart title row carries the axis name
  const el = svg(F.stage, "0 0 800 600"); const g = s("g", {}, el);   // compact viewBox so labels stay ~11 px on a 390 px phone
  const X0 = 146, X1 = 782, Y0 = 500, Y1 = 64, C0 = 33, C1 = 49, W0 = 1500, W1 = 2650;
  const X = (c) => X0 + ((c - C0) / (C1 - C0)) * (X1 - X0), Y = (w) => Y0 - ((w - W0) / (W1 - W0)) * (Y0 - Y1);
  s("path", { d: `M${X0},${Y1} L${X0},${Y0} L${X1},${Y0}`, fill: "none", stroke: FAINT2, "stroke-width": 1.5 }, g);
  for (let c = 34; c <= 48; c += 2) { s("line", { x1: X(c), y1: Y0, x2: X(c), y2: Y0 + 10, stroke: FAINT2 }, g); T(g, X(c), Y0 + 36, c, { anchor: "middle", size: 26, op: 0.65 }); }
  for (let w = 1600; w <= 2600; w += 200) { s("line", { x1: X0 - 10, y1: Y(w), x2: X0, y2: Y(w), stroke: FAINT2 }, g); T(g, X0 - 14, Y(w) + 9, w.toLocaleString(), { anchor: "end", size: 26, op: 0.65 }); }
  T(g, X1, Y0 + 82, "CG · inches aft of datum", { anchor: "end", size: 24, op: 0.6 }); T(g, 18, Y1 - 28, "C172S CG envelope · weight lb", { size: 24, op: 0.6 });
  const poly = (P, attrs) => s("path", { d: "M" + P.map(([c, w]) => `${X(c).toFixed(1)},${Y(w).toFixed(1)}`).join(" L"), fill: "none", ...attrs }, g);
  const envN = poly(NORMAL, { stroke: "#F2F1EC", "stroke-width": 2.5, opacity: 0.8 }); const envU = poly(UTIL, { stroke: FAINT2, "stroke-width": 1.5, "stroke-dasharray": "8 8" });
  T(g, X(44.15), Y(2550) + 34, "normal · 2,550 lb max", { anchor: "middle", size: 22, op: 0.65 }); T(g, X(38.9), Y(2200) + 30, "utility", { anchor: "middle", size: 22, op: 0.55 });
  const path = s("line", { stroke: ACC, "stroke-width": 2.5, "stroke-dasharray": "6 6", opacity: 0.8 }, g);
  const pTO = s("circle", { r: 9, fill: ACC, filter: "url(#gw)" }, g), pL = s("circle", { r: 8, fill: "none", stroke: ACC, "stroke-width": 3 }, g);
  const tTO = T(g, 0, 0, "takeoff", { size: 22, op: 0.95, fill: ACC }), tL = T(g, 0, 0, "landing", { size: 22, op: 0.8, fill: ACC });
  // empty weight inputs
  const emp = h("div", { class: "numrow" });
  const num = (label, v, step) => { const i = h("input", { type: "number", value: v, step, inputmode: "decimal", "aria-label": label }); emp.append(h("label", {}, h("span", { class: "label" }, label), i)); i.addEventListener("input", calc); return i; };
  const eW = num("Empty weight lb", 1642, 1), eM = num("Empty moment ÷1000", 62.6, 0.1);   // placed in the worksheet drawer below
  const V = { front: 340, rear: 310, bagA: 56, bagB: 0, fuel: 35, burn: 0 };
  const S = {};
  const add = (k, label, max, unit = "lb") => (S[k] = slider(F.ctrl, { label, min: 0, max, step: 1, value: V[k], fmt: (v) => `${v} ${unit}`, oninput: (v) => { V[k] = v; if (k === "fuel" && V.burn > v) S.burn.set(v, false), (V.burn = v); calc(); } }));
  add("front", "Pilot + front passenger", 440); add("rear", "Rear seats", 400); add("bagA", "Baggage area A", 120); add("bagB", "Baggage area B", 50); add("fuel", "Fuel (usable)", 53, "gal"); add("burn", "Fuel burned in flight", 53, "gal");
  const set = readout(F.ctrl, [["w", "takeoff weight"], ["m", "moment ÷1000"], ["cg", "takeoff CG"], ["lcg", "landing CG"]]); F.ctrl.lastElementChild.classList.add("wb4");
  const wbd = h("details", { class: "wbsheet" }); wbd.append(h("summary", { class: "label" }, "Empty weight and worksheet")); const tbl = h("div", { class: "wbtable" }); wbd.append(emp, tbl); F.ctrl.append(wbd);   // the full worksheet folds away so the envelope and sliders fit one phone screen
  function calc() { const ew = +eW.value || 0, em = (+eM.value || 0) * 1000;
    const rows = [["Empty", ew, ew ? em / ew : 0, em], ["Front seats", V.front, ARM.front], ["Rear seats", V.rear, ARM.rear], ["Baggage A", V.bagA, ARM.bagA], ["Baggage B", V.bagB, ARM.bagB], ["Fuel", V.fuel * 6, ARM.fuel], ["Start, taxi, runup", -8, 0, -400]].map((r) => [r[0], r[1], r[2], r[3] ?? r[1] * r[2]]);
    const ramp = rows.slice(0, 6).reduce((a, r) => a + r[1], 0); const w = rows.reduce((a, r) => a + r[1], 0), m = rows.reduce((a, r) => a + r[3], 0), cg = m / w;
    const lw = w - V.burn * 6, lm = m - V.burn * 6 * ARM.fuel, lcg = lm / lw;
    tbl.innerHTML = `<table><thead><tr><th>Item</th><th>Weight</th><th>Arm</th><th>Moment/1000</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td>${Math.round(r[1])}</td><td>${r[2] ? r[2].toFixed(1) : "–"}</td><td>${(r[3] / 1000).toFixed(1)}</td></tr>`).join("")}<tr class="tot"><td>Takeoff</td><td>${Math.round(w)}</td><td>${cg.toFixed(1)}</td><td>${(m / 1000).toFixed(1)}</td></tr></tbody></table>`;
    set("w", `${Math.round(w).toLocaleString()} lb`); set("m", (m / 1000).toFixed(1)); set("cg", `${cg.toFixed(1)} in`); set("lcg", `${lcg.toFixed(1)} in`);
    const pos = (c, ww) => [Math.min(X1, Math.max(X0, X(c))), Math.min(Y0, Math.max(Y1, Y(ww)))];
    const [x1, y1] = pos(cg, w), [x2, y2] = pos(lcg, lw); pTO.setAttribute("cx", x1); pTO.setAttribute("cy", y1); pL.setAttribute("cx", x2); pL.setAttribute("cy", y2); pL.style.display = V.burn ? "" : "none"; tL.style.display = V.burn ? "" : "none";
    path.setAttribute("x1", x1); path.setAttribute("y1", y1); path.setAttribute("x2", x2); path.setAttribute("y2", y2); // labels sit beside their dots, flipping left near the right edge and below the dot near the top so nothing is clipped
    const lab = (t, x, y, dy) => { const left = x > X1 - 130; t.setAttribute("text-anchor", left ? "end" : "start"); t.setAttribute("x", x + (left ? -16 : 16)); t.setAttribute("y", Math.max(Y1 + 26, y + dy)); };
    lab(tTO, x1, y1, -12); lab(tL, x2, y2, 30);
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
