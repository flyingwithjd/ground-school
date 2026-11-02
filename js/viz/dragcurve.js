// Drag vs airspeed: slide the airspeed, watch parasite and induced drag trade off. Simple textbook model:
// parasite ∝ V², induced ∝ 1/V², with the minimum placed at the 172S best-glide speed (68 KIAS, POH Sec 3). Labels in screen px.
import { slider, chips } from "./base.js?v=269fcd6a6e";
import { pxScene, T, L, P, C, ACC, INK, GRAY, DIM } from "./kit.js?v=269fcd6a6e";
const VLD = 68, V0 = 42, V1 = 140, VMP = VLD / Math.pow(3, 0.25);
const par = (v) => (v / VLD) ** 2, ind = (v) => (VLD / v) ** 2, tot = (v) => par(v) + ind(v);
export function mount(host) {
  let V = 68, sel = "total";
  const S = pxScene(host, { corners: { tl: "Drag vs airspeed · model", tr: "PHAK 5, 11" } }, draw);
  slider(S.F.ctrl, { label: "Airspeed", min: V0 + 3, max: V1, step: 1, value: 68, fmt: (v) => `${v} kt`, oninput: (v) => { V = v; S.redraw(); } });
  chips(S.F.ctrl, [["total", "Total"], ["parasite", "Parasite"], ["induced", "Induced"]], "total", (v) => { sel = v || sel; S.redraw(); }, { label: "Highlight curve" });
  function draw(g, W, H, top) {
    const ph = W < 520, X0 = ph ? 40 : 56, X1 = W - 14, Y0 = H - 40, Y1 = top + 8, YMAX = 5.2;
    const X = (v) => X0 + ((v - V0) / (V1 - V0)) * (X1 - X0), Y = (d) => Y0 - (Math.min(d, YMAX) / YMAX) * (Y0 - Y1);
    P(g, `M${X0},${Y1} L${X0},${Y0} L${X1},${Y0}`, { stroke: DIM, w: 1.2 });
    for (let v = 50; v <= 140; v += ph ? 20 : 10) { L(g, X(v), Y0, X(v), Y0 + 6, { stroke: DIM }); T(g, X(v), Y0 + 20, String(v), { anchor: "middle", size: 11, fill: GRAY }); }
    T(g, X1, Y0 + 34, "KIAS", { anchor: "end", size: 11, fill: GRAY }); T(g, X0 - 6, Y1 + 4, "DRAG", { anchor: "end", size: 11, fill: GRAY });
    const curve = (f) => { let d = ""; for (let v = V0; v <= V1; v += 1) d += (d ? " L" : "M") + X(v).toFixed(1) + "," + Y(f(v)).toFixed(1); return d; };
    for (const [k, f] of [["parasite", par], ["induced", ind], ["total", tot]]) P(g, curve(f), { stroke: k === sel ? ACC : k === "total" ? INK : GRAY, w: k === sel ? 3 : 2 });
    T(g, X(128) + 4, Y(par(128)) + 18, "PARASITE", { anchor: "end", size: 11, fill: sel === "parasite" ? ACC : GRAY });
    T(g, X(100), Y(ind(100)) - 8, "INDUCED", { size: 11, fill: sel === "induced" ? ACC : GRAY });
    T(g, X(108), Y(tot(108)) - 12, "TOTAL", { anchor: "end", size: 11, fill: sel === "total" ? ACC : INK });
    L(g, X(VLD), Y0, X(VLD), Y1 + 30, { stroke: GRAY, dash: "5 6", w: 1.2 }); T(g, X(VLD) + 6, Y1 + 24, ph ? "L/D MAX 68" : "L/D MAX · BEST GLIDE 68", { size: 11, fill: GRAY });
    L(g, X(VMP), Y0, X(VMP), Y1 + 60, { stroke: DIM, dash: "2 6", w: 1.2 }); T(g, X(VMP) - 4, Y1 + 54, ph ? "MIN PWR" : "MIN POWER (MODEL)", { anchor: "end", size: 11, fill: GRAY });
    L(g, X(V), Y0, X(V), Y1, { stroke: ACC, w: 1.2, op: 0.6 });
    for (const [k, f] of [["parasite", par], ["induced", ind]]) C(g, X(V), Y(f(V)), 5, { fill: INK });
    C(g, X(V), Y(tot(V)), 7, { fill: ACC });
    T(g, X(V) + (V > 110 ? -10 : 10), Y(tot(V)) - 12, `${(tot(V) / 2).toFixed(2)}× MIN`, { anchor: V > 110 ? "end" : "start", size: 12, fill: INK, weight: 600 });
    if (V < VMP) { S.F.caption("Region of reversed command", "Slower needs more power"); S.F.explain("Below the minimum-power speed, holding altitude at a lower airspeed takes <strong>more</strong> power. Pulling the nose up here without adding power only makes you slower and lower. <span class=\"src\">PHAK 11</span>"); }
    else if (V < VLD - 2) { S.F.caption("Behind L/D max", "Induced drag dominates"); S.F.explain("Slowing down here raises total drag: the wing needs a higher AOA, which makes more induced drag. <span class=\"src\">PHAK 5</span>"); }
    else if (V <= VLD + 2) { S.F.caption("L/D max", "Least total drag"); S.F.explain("Parasite and induced drag are equal and total drag is lowest. With the engine out, this is where the airplane glides farthest: 68 KIAS in the 172S. <span class=\"src\">C172S POH 3</span>"); }
    else { S.F.caption("Normal command", "Parasite drag dominates"); S.F.explain("Parasite drag grows with the square of airspeed: double the speed, about four times the parasite drag. <span class=\"src\">PHAK 5</span>"); }
  }
  return { destroy() { S.F.destroy(); } };
}
