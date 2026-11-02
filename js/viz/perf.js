// Takeoff / landing distance from the C172S POH Sec 5 short-field tables at 2,550 lb (Figures 5-5 and 5-11),
// with linear interpolation and the table notes for wind and grass. Data are facts from the POH; always use your own POH.
import { frame, slider, chips, readout, svg, ACC, FAINT, FAINT2 } from "./base.js?v=167338b5e8";
import { s } from "../core/util.js?v=167338b5e8";
import { T } from "./shapes.js?v=167338b5e8";
const TO = [[860, 1465, 925, 1575, 995, 1690, 1070, 1810, 1150, 1945], [940, 1600, 1010, 1720, 1090, 1850, 1170, 1990, 1260, 2135], [1025, 1755, 1110, 1890, 1195, 2035, 1285, 2190, 1380, 2355], [1125, 1925, 1215, 2080, 1310, 2240, 1410, 2420, 1515, 2605], [1235, 2120, 1335, 2295, 1440, 2480, 1550, 2685, 1660, 2880], [1355, 2345, 1465, 2545, 1585, 2755, 1705, 2975, 1825, 3205], [1495, 2605, 1615, 2830, 1745, 3075, 1875, 3320, 2010, 3585], [1645, 2910, 1785, 3170, 1920, 3440, 2065, 3730, 2215, 4045], [1820, 3265, 1970, 3575, 2120, 3880, 2280, 4225, 2450, 4615]];
const LD = [[545, 1290, 565, 1320, 585, 1350, 605, 1380, 625, 1415], [565, 1320, 585, 1350, 605, 1385, 625, 1420, 650, 1450], [585, 1355, 610, 1385, 630, 1420, 650, 1455, 670, 1490], [610, 1385, 630, 1425, 655, 1460, 675, 1495, 695, 1530], [630, 1425, 655, 1460, 675, 1495, 700, 1535, 725, 1570], [655, 1460, 680, 1500, 705, 1535, 725, 1575, 750, 1615], [680, 1500, 705, 1540, 730, 1580, 755, 1620, 780, 1660], [705, 1545, 730, 1585, 760, 1625, 785, 1665, 810, 1705], [735, 1585, 760, 1630, 790, 1670, 815, 1715, 840, 1755]];
function look(tab, pa, t) { const i = Math.min(7, Math.floor(pa / 1000)), fi = pa / 1000 - i, j = Math.min(3, Math.floor(t / 10)), fj = t / 10 - j;
  const v = (k) => { const a = tab[i][j * 2 + k], b = tab[i][(j + 1) * 2 + k], c = tab[i + 1][j * 2 + k], d = tab[i + 1][(j + 1) * 2 + k]; return (a * (1 - fj) + b * fj) * (1 - fi) + (c * (1 - fj) + d * fj) * fi; };
  return [v(0), v(1)]; }
export function mount(host) {
  const F = frame(host, { cls: "capin", corners: { tl: "Short-field distance · 2,550 lb", tr: "POH Sec 5" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  const RX = 120, RY = 680, H = 360, SC = 1400 / 5000; const X = (ft) => RX + ft * SC;
  const rwy = s("rect", { x: RX, y: RY, height: 26, fill: "none", stroke: "#F2F1EC", "stroke-width": 2, opacity: 0.7 }, g);
  const roll = s("line", { y1: RY + 13, y2: RY + 13, stroke: ACC, "stroke-width": 8, filter: "url(#gw)", "stroke-linecap": "round" }, g);
  const air = s("path", { fill: "none", stroke: ACC, "stroke-width": 3, "stroke-dasharray": "10 8" }, g);
  const obs = s("path", { fill: "none", stroke: "#F2F1EC", "stroke-width": 2.5, opacity: 0.8 }, g);
  const tR = T(g, 0, RY + 70, "", { anchor: "middle", size: 17, op: 0.9, fill: ACC }), tT = T(g, 0, 0, "", { anchor: "middle", size: 17, op: 0.8 }), tW = T(g, 0, RY + 110, "", { size: 15, op: 0.55 });
  for (let f = 0; f <= 5000; f += 1000) { s("line", { x1: X(f), y1: RY + 34, x2: X(f), y2: RY + 44, stroke: FAINT2 }, g); T(g, X(f), RY + 150, f ? f.toLocaleString() + " ft" : "0", { anchor: "middle", size: 14, op: 0.4, upper: false }); }
  const st = { mode: "to", pa: 3000, t: 20, wind: 0, grass: false, rwy: 3000 };
  const set = readout(F.ctrl, [["r", "ground roll"], ["o", "total over 50 ft"], ["m", "runway margin"]]);
  function upd() { const tab = st.mode === "to" ? TO : LD; let [gr, tot] = look(tab, st.pa, st.t);
    let wf = 1; if (st.wind > 0) wf = 1 - 0.1 * (st.wind / 9); else if (st.wind < 0) wf = 1 + 0.1 * (-st.wind / 2); gr *= wf; tot *= wf;
    if (st.grass) { const add = gr * (st.mode === "to" ? 0.15 : 0.45); gr += add; tot += add; }
    rwy.setAttribute("width", st.rwy * SC);
    if (st.mode === "to") { roll.setAttribute("x1", X(0)); roll.setAttribute("x2", X(gr)); air.setAttribute("d", `M${X(gr)},${RY} Q${(X(gr) + X(tot)) / 2},${RY - 20} ${X(tot)},${RY - H}`); obs.setAttribute("d", `M${X(tot)},${RY} L${X(tot)},${RY - H}`); tR.setAttribute("x", (X(0) + X(gr)) / 2); tT.setAttribute("x", X(tot)); tT.setAttribute("y", RY - H - 22); }
    else { const a = X(tot - gr); obs.setAttribute("d", `M${X(0)},${RY} L${X(0)},${RY - H}`); air.setAttribute("d", `M${X(0)},${RY - H} Q${(X(0) + a) / 2},${RY - 30} ${a},${RY}`); roll.setAttribute("x1", a); roll.setAttribute("x2", X(tot)); tR.setAttribute("x", (a + X(tot)) / 2); tT.setAttribute("x", X(0) + 10); tT.setAttribute("y", RY - H - 22); tT.setAttribute("text-anchor", "start"); }
    if (st.mode === "to") tT.setAttribute("text-anchor", "middle");
    tR.textContent = `ground roll ${Math.round(gr).toLocaleString()} ft`; tT.textContent = st.mode === "to" ? `clears 50 ft at ${Math.round(tot).toLocaleString()} ft` : `50 ft obstacle · total ${Math.round(tot).toLocaleString()} ft`; tW.setAttribute("x", RX); tW.textContent = `runway available ${st.rwy.toLocaleString()} ft`;
    const margin = st.rwy - tot; set("r", `${Math.round(gr).toLocaleString()} ft`); set("o", `${Math.round(tot).toLocaleString()} ft`); set("m", `${Math.round(margin).toLocaleString()} ft`);
    F.caption(`${st.mode === "to" ? "Takeoff" : "Landing"} · ${st.pa.toLocaleString()} ft PA · ${st.t} °C`, margin < 0 ? "Not enough runway" : `${Math.round(tot).toLocaleString()} ft total`);
    F.explain(`From the POH short-field ${st.mode === "to" ? "takeoff (flaps 10°, lift off 51 KIAS, 56 KIAS at 50 ft)" : "landing (flaps 30°, 61 KIAS at 50 ft, max braking)"} table at 2,550 lb, interpolated. Wind: −10% per 9 kt of headwind; +10% per 2 kt of tailwind (up to 10 kt). Grass: +${st.mode === "to" ? "15" : "45"}% of the ground roll. These are a test pilot's numbers in a new airplane: add your own margin. <span class="src">POH 5</span> <span class="dim">Confirm with your CFI and your aircraft's POH.</span>`); }
  chips(F.ctrl, [["to", "Takeoff"], ["ld", "Landing"]], "to", (v) => { st.mode = v; upd(); }, { label: "Mode" });
  chips(F.ctrl, [["paved", "Paved, dry"], ["grass", "Dry grass"]], "paved", (v) => { st.grass = v === "grass"; upd(); }, { label: "Surface" });
  slider(F.ctrl, { label: "Pressure altitude", min: 0, max: 8000, step: 100, value: st.pa, fmt: (v) => `${v.toLocaleString()} ft`, oninput: (v) => { st.pa = v; upd(); } });
  slider(F.ctrl, { label: "Temperature", min: 0, max: 40, step: 1, value: st.t, fmt: (v) => `${v} °C`, oninput: (v) => { st.t = v; upd(); } });
  slider(F.ctrl, { label: "Wind (− tail / + head)", min: -10, max: 30, step: 1, value: 0, fmt: (v) => (v < 0 ? `${-v} kt tail` : v > 0 ? `${v} kt head` : "calm"), oninput: (v) => { st.wind = v; upd(); } });
  slider(F.ctrl, { label: "Runway available", min: 1500, max: 5000, step: 50, value: st.rwy, fmt: (v) => `${v.toLocaleString()} ft`, oninput: (v) => { st.rwy = v; upd(); } });
  upd();
  return { destroy() { F.destroy(); } };
}
