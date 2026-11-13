// Engine gauges for the 172S: round dials (tach, oil temperature, oil pressure, EGT, fuel flow, suction) or the G1000 EIS
// (adds CHT). Pick a situation and watch the needles: CHT reacts fast, oil temperature lags. Then try the response.
// Markings: C172S POH Sec 2 Fig 2-3 (round dial): tach green 2,100-2,500 SL / -2,600 at 5,000 ft / -2,700 at 10,000 ft,
// red 2,700; oil temp green 100-245 F, red 245; oil pressure red 20, green 50-90, red 115; fuel flow 0-12 GPH; suction
// 4.5-5.5 in. Hg; static full-throttle RPM 2,300-2,400. OIL PRESS light below 20 PSI (POH 7). G1000 172S POH Fig 2-3 adds
// CHT green 200-500 F and red arcs (tach 2,700-3,000, oil temp 245-250, oil pressure 0-20 and 115-120). The round-dial 172S
// has no CHT gauge (POH 7). Low oil pressure procedure: POH 3. Temperature causes and fixes: PHAK 7.
// Needle values for each situation are examples, not published numbers.
import { chips, row } from "./base.js?v=5436de0cbc";
import { h } from "../core/util.js?v=5436de0cbc";
import { pxScene, T, R, C, hit, INK, GRAY, DIM, ACC } from "./kit.js?v=5436de0cbc";
import { dial, eisCell, anim, toward, COL } from "./dial.js?v=5436de0cbc";
const SC = {
  cruise: { name: "Cruise", v: { rpm: 2400, ff: 8.5, op: 70, ot: 190, cht: 360, egt: 0.6, vac: 5 }, say: ["Normal cruise", "Every needle in the green."] },
  climb: { name: "Long slow climb", v: { rpm: 2500, ff: 11.5, op: 66, ot: 238, cht: 470, egt: 0.45, vac: 5 }, fix: { name: "Lower the nose, enrich", v: { rpm: 2450, ff: 12, op: 70, ot: 205, cht: 390, egt: 0.4, vac: 5 } },
    say: ["High power, low airspeed", "Less cooling air at high power. CHT climbs right away; oil temperature follows later."], sayR: ["High power, low airspeed", "Less cooling air at high power. Oil temperature climbs slowly toward the red line."], fixed: ["Cooling", "More airspeed and a richer mixture bring the temperatures down. Reducing power helps too."] },
  lowoil: { name: "Oil loss", v: { rpm: 2350, ff: 8.5, op: 12, ot: 244, cht: 410, egt: 0.6, vac: 5 }, fix: { name: "Reduce power, pick a field", v: { rpm: 1700, ff: 5, op: 10, ot: 240, cht: 330, egt: 0.5, vac: 4.6 } },
    say: ["Oil pressure low, temperature rising", "Losing oil pressure with rising oil temperature: engine failure may be near."], fixed: ["Plan the landing now", "Use only the power you need to reach the field you picked."] },
  sender: { name: "Low pressure, temp normal", v: { rpm: 2400, ff: 8.5, op: 15, ot: 190, cht: 360, egt: 0.6, vac: 5 }, say: ["OIL PRESS on, temperature normal", "Probably the pressure sender or relief valve. Land at the nearest airport and have it inspected."] },
  cooler: { name: "Blocked oil cooler", v: { rpm: 2400, ff: 8.5, op: 60, ot: 246, cht: 380, egt: 0.6, vac: 5 }, fix: { name: "Reduce power, add airspeed", v: { rpm: 2200, ff: 7, op: 62, ot: 232, cht: 340, egt: 0.6, vac: 5 } },
    say: ["High oil temperature", "Low oil, a plugged line, a blocked oil cooler or a bad gauge."], fixed: ["Easing the load", "Less power and more airspeed lower engine temperature. Have the cause found before the next flight."] },
  shock: { name: "Fast idle descent", v: { rpm: 1600, ff: 3, op: 55, ot: 170, cht: 230, egt: 0.3, vac: 4.6 }, say: ["Shock cooling risk", "A high-speed descent at low power cools the cylinders abruptly. CHT drops fast; oil temperature lags."], sayR: ["Shock cooling risk", "A high-speed descent at low power cools the cylinders abruptly. The round dials have no CHT gauge to show it."] },
  static: { name: "Full-throttle static", v: { rpm: 2350, ff: 14, op: 72, ot: 185, cht: 340, egt: 0.4, vac: 5.2 }, say: ["Static RPM check", "On the ground at full throttle, the 172S should show 2,300 to 2,400 RPM."] },
};
const RATE = { rpm: 2.2, ff: 2, op: 2, ot: 0.18, cht: 0.9, egt: 1.6, vac: 2 };
const ARC = { sl: 2500, "5k": 2600, "10k": 2700 };
const INFO = { rpm: "Tachometer: green to the altitude limit, red line 2,700 RPM.", ot: "Oil temperature: green 100–245 °F, red line 245 °F. It changes slowly.", op: "Oil pressure: red line 20 PSI minimum, green 50–90, red line 115 maximum. The red OIL PRESS light comes on below 20.",
  ff: "Fuel flow: green 0–12 GPH.", egt: "EGT: exhaust gas temperature, used for leaning. The round-dial gauge has a manual reference pointer and no fixed numbers.", vac: "Suction: green 4.5–5.5 in. Hg for the vacuum gyros.", cht: "CHT, G1000 only: green 200–500 °F. It reacts right away." };
export function mount(host) {
  let panel = "round", sc = "cruise", alt = "sl", fixed = false, focus = null; const val = { ...SC.cruise.v };
  const S = pxScene(host, { cls: "xtall enggauges", corners: { tl: "Engine instruments · 172S", tr: "POH 2, 3 · PHAK 7" } }, draw);
  const r0 = row(S.F.ctrl, "Panel"); chips(r0, [["round", "Round dials"], ["g1000", "G1000"]], panel, (v) => { panel = v || "round"; upd(); }, { label: "Panel" });
  const r1 = row(S.F.ctrl, "Situation"); const scC = chips(r1, Object.entries(SC).map(([k, v]) => [k, v.name]), sc, (v) => { sc = v || "cruise"; scC.set(sc); fixed = false; upd(); }, { label: "Situation" });
  const r2 = row(S.F.ctrl, "Altitude"); chips(r2, [["sl", "Sea level"], ["5k", "5,000 ft"], ["10k", "10,000 ft"]], alt, (v) => { alt = v || "sl"; upd(); }, { label: "Altitude" });
  const r3 = row(S.F.ctrl, "Respond"); const fb = h("button", { class: "chip", type: "button" }, "–"); const fg = h("div", { class: "chips", role: "group", "aria-label": "Respond" }); fg.append(fb); r3.append(fg);
  fb.addEventListener("click", () => { if (SC[sc].fix) { fixed = !fixed; upd(); } });
  let G = {};
  const A = anim(S.F, (dt) => { const tg = (fixed && SC[sc].fix ? SC[sc].fix : SC[sc]).v; let more = false;
    for (const k in val) { let m; [val[k], m] = toward(val[k], tg[k], RATE[k], dt, k === "egt" || k === "vac" ? 0.005 : 0.3); more = more || m; G[k] && G[k].set(val[k]); }
    if (G.press) G.press.setAttribute("fill", val.op < 20 ? COL.red : "#1a1a1c"); if (G.pressT) G.pressT.setAttribute("fill", val.op < 20 ? "#fff" : DIM);
    return more; });
  function upd() { const F = SC[sc].fix; fb.textContent = F ? (fixed ? "Undo" : F.name) : "No response needed"; fb.disabled = !F; fb.classList.toggle("on", fixed); S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const ph = S.phone; G = {}; const top2 = top + 8;
    if (panel === "round") {
      const cols = ph ? 2 : 3, rows = Math.ceil(6 / cols), cw = W / cols, rh = (H - top2 - 46) / rows, r = Math.min(cw * 0.36, rh * 0.43, 84);
      const defs = [["rpm", { min: 0, max: 3500, arcs: [[2100, ARC[alt], "green"]], reds: [2700], ticks: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500], nums: [[1000, "10"], [2000, "20"], [3000, "30"]], title: "RPM ×100", fmt: (v) => String(Math.round(v / 10) * 10) }],
        ["ot", { min: 75, max: 250, arcs: [[100, 245, "green"]], reds: [245], ticks: [100, 150, 200, 250], nums: [[100, "100"], [200, "200"]], title: "OIL °F" }],
        ["op", { min: 0, max: 120, arcs: [[50, 90, "green"]], reds: [20, 115], ticks: [0, 20, 40, 60, 80, 100, 120], nums: [[20, "20"], [60, "60"], [100, "100"]], title: "OIL PSI" }],
        ["egt", { min: 0, max: 1, ticks: [0.25, 0.5, 0.75], title: "EGT" }],
        ["ff", { min: 0, max: 19, arcs: [[0, 12, "green"]], ticks: [0, 4, 8, 12, 16], nums: [[4, "4"], [12, "12"]], title: "FUEL GPH" }],
        ["vac", { min: 3, max: 7, arcs: [[4.5, 5.5, "green"]], ticks: [3, 4, 5, 6, 7], nums: [[4, "4"], [6, "6"]], title: "SUCTION" }]];
      defs.forEach(([k, o], i) => { const cx = cw * (i % cols) + cw / 2, cy = top2 + rh * Math.floor(i / cols) + rh / 2; G[k] = dial(g, cx, cy, r, { ...o, focus: focus === k, value: val[k] });
        const z = C(g, cx, cy, r, { fill: "transparent" }); hit(g, z, INFO[k], () => { focus = focus === k ? null : k; S.redraw(); }); });
      const ax = W / 2 - 60, ay = H - 38; G.press = R(g, ax, ay, 120, 28, { rx: 4, fill: val.op < 20 ? COL.red : "#1a1a1c", stroke: GRAY, sw: 1 });
      G.pressT = T(g, ax + 60, ay + 19, "OIL PRESS", { size: 12, anchor: "middle", fill: val.op < 20 ? "#fff" : DIM, weight: 700 });
    } else {
      const x = ph ? 16 : Math.max(24, W * 0.18), w = Math.min(ph ? W - 32 : 360, W - 2 * x), dy = Math.min(54, (H - top2 - 20) / 7);
      const cells = [["rpm", { label: "RPM", min: 0, max: 3000, bands: [[2100, ARC[alt], "green"], [2700, 3000, "red"]], fmt: (v) => String(Math.round(v / 10) * 10) }],
        ["ff", { label: "FFLOW GPH", min: 0, max: 20, bands: [[0, 12, "green"]], fmt: (v) => v.toFixed(1) }],
        ["op", { label: "OIL PRES", min: 0, max: 120, bands: [[0, 20, "red"], [50, 90, "green"], [115, 120, "red"]] }],
        ["ot", { label: "OIL TEMP °F", min: 75, max: 250, bands: [[100, 245, "green"], [245, 250, "red"]] }],
        ["cht", { label: "CHT °F", min: 100, max: 550, bands: [[200, 500, "green"]] }],
        ["egt", { label: "EGT", min: 0, max: 1, fmt: () => "" }],
        ["vac", { label: "VAC", min: 3, max: 7, bands: [[4.5, 5.5, "green"]], fmt: (v) => v.toFixed(1) }]];
      cells.forEach(([k, o], i) => { const y = top2 + 14 + i * dy; G[k] = eisCell(g, x, y, w, { ...o, focus: focus === k, value: val[k] });
        const z = R(g, x - 6, y - 14, w + 12, dy - 6, { fill: "transparent" }); hit(g, z, INFO[k], () => { focus = focus === k ? null : k; S.redraw(); }); });
    }
    const say = fixed && SC[sc].fixed ? SC[sc].fixed : (panel === "round" && SC[sc].sayR) || SC[sc].say;
    S.F.caption(focus ? "Markings" : say[0], focus ? INFO[focus] : say[1]);
  }
  S.F.explain(`<p>Tap any gauge for its markings. The round-dial 172S has an EGT gauge but no CHT gauge; the G1000 shows CHT and EGT. The tach's green arc gets longer with altitude. Your airplane's POH has the limits for your engine.</p>`);
  upd();
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
