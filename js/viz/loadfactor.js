// Load factor and stall speed in a level turn. n = 1/cos(bank); Vs = Vs1g × √n (PHAK 5).
// Base stall speeds and the tabulated checks are from the C172S POH Sec 5 (2,550 lb, most rearward CG, power off).
import { frame, slider, chips, readout, svg, ACC, FAINT, FAINT2, D2R } from "./base.js?v=6dadda2251";
import { s } from "../core/util.js?v=6dadda2251";
import { rearPlane, T, arrow, setArrow } from "./shapes.js?v=6dadda2251";
const POH = { up: { 0: 48, 30: 52, 45: 57, 60: 68 }, 10: { 0: 42, 30: 45, 45: 50, 60: 59 }, 30: { 0: 40, 30: 43, 45: 48, 60: 57 } };
const LIMIT = 3.8, LIMF = 3.0;
export function mount(host) {
  const F = frame(host, { corners: { tl: "Load factor · level turn", tr: "PHAK 5 · POH 5" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  // left: rear view
  const cx = 420, cy = 520; const pg = s("g", {}, g); const plane = rearPlane(pg, { w: 2 });
  s("line", { x1: 80, y1: cy + 150, x2: 760, y2: cy + 150, stroke: FAINT, "stroke-width": 1.5 }, g); T(g, 80, cy + 180, "horizon", { size: 14, op: 0.4 });
  const L = arrow(g, cx, cy, cx, cy - 200, { accent: true, w: 5 }), Lv = s("line", { stroke: "rgba(242,241,236,.55)", "stroke-width": 2.5, "stroke-dasharray": "8 8" }, g), Lh = s("line", { stroke: "rgba(242,241,236,.55)", "stroke-width": 2.5, "stroke-dasharray": "8 8" }, g);
  const W = arrow(g, cx, cy, cx, cy + 130, { w: 3 }); T(g, cx + 14, cy + 130, "weight", { size: 15, op: 0.55 });
  const Lt = T(g, 0, 0, "total lift", { size: 16, op: 0.9, fill: ACC }), Lvt = T(g, 0, 0, "vertical part", { size: 14, op: 0.55 }), Lht = T(g, 0, 0, "turning part", { size: 14, op: 0.55 });
  // right: chart
  const X0 = 920, X1 = 1520, Y0 = 760, Y1 = 120, NM = 6;
  const X = (b) => X0 + (b / 80) * (X1 - X0), Y = (n) => Y0 - ((n - 1) / (NM - 1)) * (Y0 - Y1);
  s("path", { d: `M${X0},${Y1} L${X0},${Y0} L${X1},${Y0}`, fill: "none", stroke: FAINT2, "stroke-width": 1.5 }, g);
  for (let b = 0; b <= 80; b += 20) T(g, X(b), Y0 + 32, b + "°", { anchor: "middle", size: 15, op: 0.5 });
  for (let n = 1; n <= NM; n++) T(g, X0 - 14, Y(n) + 5, n + "g", { anchor: "end", size: 15, op: 0.5, upper: false });
  T(g, X1, Y0 + 64, "bank angle", { anchor: "end", size: 14, op: 0.5 });
  let d = ""; for (let b = 0; b <= 80; b += 0.5) { const n = 1 / Math.cos(b * D2R); d += (d ? " L" : "M") + X(b).toFixed(1) + "," + Y(Math.min(n, NM)).toFixed(1); } s("path", { d, fill: "none", stroke: FAINT2, "stroke-width": 2.5 }, g);
  const lim = s("line", { x1: X0, x2: X1, stroke: FAINT2, "stroke-width": 1.5, "stroke-dasharray": "6 8" }, g); const limT = T(g, X0 + 10, 0, "", { size: 14, op: 0.6, upper: false });
  const dot = s("circle", { r: 10, fill: ACC, filter: "url(#gw)" }, g);
  const set = readout(F.ctrl, [["b", "bank"], ["n", "load factor"], ["v", "stall speed"], ["p", "POH table"]]);
  let bank = 30, flap = "up";
  function upd() { const n = 1 / Math.cos(bank * D2R), vs = POH[flap][0] * Math.sqrt(n), lim1 = flap === "up" ? LIMIT : LIMF;
    plane.setAttribute("transform", `translate(${cx} ${cy}) rotate(${bank}) scale(.62)`);
    const len = 150 * n, ex = cx + Math.sin(bank * D2R) * len, ey = cy - Math.cos(bank * D2R) * len; setArrow(L, cx, cy, ex, ey);
    setArrow(Lv, ex, ey, ex, cy); Lv.setAttribute("x1", cx); Lv.setAttribute("x2", cx); Lv.setAttribute("y1", cy); Lv.setAttribute("y2", cy - 150); setArrow(Lh, cx, cy - 150, ex, ey);
    Lt.setAttribute("x", ex + 14); Lt.setAttribute("y", Math.max(40, ey)); Lvt.setAttribute("x", cx - 16); Lvt.setAttribute("y", cy - 160); Lvt.setAttribute("text-anchor", "end"); Lht.setAttribute("x", (cx + ex) / 2); Lht.setAttribute("y", cy - 166); Lht.style.display = bank > 12 ? "" : "none";
    lim.setAttribute("y1", Y(lim1)); lim.setAttribute("y2", Y(lim1)); limT.setAttribute("y", Y(lim1) - 10); limT.textContent = `limit +${lim1.toFixed(1)}g · flaps ${flap === "up" ? "up" : "down"}`;
    dot.setAttribute("cx", X(bank)); dot.setAttribute("cy", Y(Math.min(n, NM)));
    set("b", `${bank}°`); set("n", `${n.toFixed(2)}g`); set("v", `${Math.round(vs)} KIAS`); set("p", POH[flap][bank] != null ? `${POH[flap][bank]} KIAS` : "–");
    const over = n > lim1;
    F.caption(over ? "Beyond the limit load factor" : `Flaps ${flap === "up" ? "up" : flap + "°"} · ${bank}° bank`, over ? "Structural damage possible" : `Stall ≈ ${Math.round(vs)} KIAS`);
    F.explain(over ? `Holding altitude at ${bank}° needs ${n.toFixed(2)}g, more than the normal-category limit of +${lim1.toFixed(1)}g. <span class="src">POH 2</span>` : bank === 0 ? "Wings level, lift equals weight: 1g. Tap 30°, 45° or 60° to compare the calculation with the POH stall-speed table." : `To hold altitude the wing must make ${n.toFixed(2)}× its weight in lift, so it reaches the critical AOA at √${n.toFixed(2)} = ${Math.sqrt(n).toFixed(2)}× the wings-level stall speed.`); }
  let bankChips = null;
  const sl = slider(F.ctrl, { label: "Bank angle", min: 0, max: 80, step: 1, value: 30, fmt: (v) => `${v}°`, oninput: (v) => { bank = v; bankChips && bankChips.set(String(v)); upd(); } });   // a chip is lit only when the slider sits on its bank
  bankChips = chips(F.ctrl, [["0", "0°"], ["30", "30°"], ["45", "45°"], ["60", "60°"]], "30", (v) => sl.set(+v), { label: "Tabulated banks" });
  chips(F.ctrl, [["up", "Flaps up"], ["10", "Flaps 10°"], ["30", "Flaps 30°"]], "up", (v) => { flap = v; upd(); }, { label: "Flaps" });
  upd();
  return { destroy() { F.destroy(); } };
}
