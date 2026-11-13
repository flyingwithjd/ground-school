// Altitude vs oxygen: 91.211 requirements, AIM 8-1-2 recommendations and effects, PHAK Fig 17-1 time of useful consciousness.
// With opts.systems (GL2): oxygen system chips and a pulse-oximeter readout. SpO2 breathing air: FAA CAMI, Introduction to
// Aviation Physiology, Oxygen Requirements table (sea level 96%, 5,000 ft 94%, 10,000 ft 90%, 15,000 ft 70%, 20,000 ft 62%;
// above that "totally inadequate"), straight-line between rows; with enough supplemental oxygen, 96%. System limits, PHAK 7:
// diluter-demand up to 40,000 ft, pressure-demand above 40,000 ft, systems certified above 18,000 ft need masks, not
// cannulas; AC 61-107B: continuous-flow needs very careful attention above 25,000 ft; pulse-demand saves 50-85% of the oxygen.
// AOPA Air Safety Institute hypoxia alert: below 90% SpO2 mental function begins to deteriorate.
import { slider, chips, row } from "./base.js?v=2481aa7edd";
import { pxScene, T, L, R, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=2481aa7edd";
const SPO2 = [[0, 96], [5000, 94], [10000, 90], [15000, 70], [20000, 62]];
export function spo2(a) { if (a > 20000) return null; for (let i = 1; i < SPO2.length; i++) if (a <= SPO2[i][0]) { const [a0, s0] = SPO2[i - 1], [a1, s1] = SPO2[i]; return Math.round(s0 + ((a - a0) / (a1 - a0)) * (s1 - s0)); } return 62; }
const SYS = {
  none: ["Breathing cabin air", 0, ""],
  cannula: ["Cannula", 18000, "Tubing under the nose. Systems certified above 18,000 ft must use masks instead."],
  cflow: ["Continuous-flow mask", 25000, "A steady flow into a mask with a reservoir bag; common for passengers. Very careful attention above 25,000 ft."],
  diluter: ["Diluter-demand", 40000, "Flows only when you inhale and mixes cabin air with oxygen; a sealed mask, safe up to 40,000 ft."],
  pressure: ["Pressure-demand", 45000, "Like diluter-demand, but oxygen is delivered under pressure above 34,000 ft; safe above 40,000 ft."],
  pulse: ["Pulse-demand", 0, "Portable; a pulse at the start of each breath uses 50–85% less oxygen than continuous flow. Check the unit's approved altitude."],
};
export const TUC = [[20000, "30 min or more"], [22000, "5–10 min"], [25000, "3–5 min"], [28000, "2½–3 min"], [30000, "1–2 min"], [35000, "30–60 s"], [40000, "15–20 s"], [45000, "9–15 s"]];
const MAX = 30000;
function info(a) {
  const reg = a > 15000 ? "Every occupant must be provided with oxygen; crew uses it at all times." : a > 14000 ? "Required crew must use oxygen at all times." : a > 12500 ? "Required crew must use oxygen after 30 minutes." : "No oxygen required by 91.211.";
  const rec = a > 10000 ? "Use oxygen above 10,000 ft by day and above 5,000 ft at night." : a > 5000 ? "Use oxygen above 5,000 ft at night." : "No oxygen recommendation below 5,000 ft.";
  const eff = a >= 15000 ? "Performance can seriously deteriorate within 15 minutes at 15,000 ft." : a >= 12000 ? "12,000–15,000 ft: judgment, memory, alertness, coordination and calculation suffer." : a >= 5000 ? "Night vision starts to deteriorate as low as 5,000 ft." : "Healthy pilots usually notice nothing here.";
  let tuc = null; for (const [h, t] of TUC) if (a >= h) tuc = [h, t];
  return { reg, rec, eff, tuc };
}
export function mount(host, opts = {}) {
  let a = 8000, sys = "none"; const SY = !!opts.systems;
  const S = pxScene(host, { cls: SY ? "xtall" : "tall", corners: { tl: "Cabin altitude and oxygen", tr: "14 CFR 91.211 · AIM 8-1 · PHAK 17" } }, draw);
  const sp = slider(SY ? row(S.F.ctrl, "Altitude") : S.F.ctrl, { label: "Cabin altitude", min: 0, max: 45000, step: 500, value: a, fmt: (x) => x.toLocaleString() + " ft", oninput: (x) => { a = x; S.redraw(); } });
  if (SY) { const r = row(S.F.ctrl, "Oxygen"); chips(r, Object.entries(SYS).map(([k, v]) => [k, k === "none" ? "None" : v[0]]), sys, (k) => { sys = k || "none"; S.redraw(); }, { label: "Oxygen" }); }
  function draw(g, W, H, top0) {
    const top = top0 + 20, bot = H - 22, x0 = W < 520 ? 54 : 70, bx = x0 + 8, bw = Math.min(46, W * 0.1);
    const y = (h) => bot - (h / MAX) * (bot - top);
    for (const h of [0, 5000, 10000, 12500, 14000, 15000, 20000, 25000, 30000]) { L(g, x0 - 5, y(h), x0, y(h), { stroke: GRAY }); if (![14000, 12500].includes(h) || W >= 520) T(g, x0 - 8, y(h) + 4, h >= 1000 ? (h / 1000) + "k" : "0", { anchor: "end", size: 11, fill: GRAY }); }
    // regulation bands
    R(g, bx, y(14000), bw, y(12500) - y(14000), { fill: ACCF, stroke: ACCM, sw: 1 });
    R(g, bx, y(15000), bw, y(14000) - y(15000), { fill: ACCM });
    R(g, bx, y(MAX), bw, y(15000) - y(MAX), { fill: ACC, op: 0.75 });
    T(g, bx + bw / 2, top - 8, "91.211", { anchor: "middle", size: 11, fill: GRAY });
    // TUC ticks
    const tx = bx + bw + 14;
    // marker
    const yy = y(Math.min(a, MAX)); L(g, x0, yy, bx + bw + 6, yy, { stroke: INK, w: 2 }); if (a > MAX) T(g, x0 - 8, yy - 10, "↑ " + Math.round(a / 1000) + "k", { anchor: "end", size: 11, fill: INK });
    const I = info(a), cx = tx + 18, maxw = W - cx - 14, fs = W < 520 ? 11.5 : 13;
    // wrap text into lines
    const wrapT = (str, n) => { const out = []; let line = ""; for (const w of str.split(" ")) { if ((line + " " + w).trim().length > n) { out.push(line.trim()); line = w; } else line += " " + w; } if (line.trim()) out.push(line.trim()); return out; };
    const n = Math.max(18, Math.floor(maxw / (fs * 0.6)));
    const Sy = SYS[sys], lim = Sy[1], over = sys !== "none" && lim && a > lim;
    const blocks = SY ? [["RULE", I.reg]] : [["RULE", I.reg], ["AIM", I.rec], ["EFFECTS", I.eff]];
    if (SY && sys !== "none") blocks.push([Sy[0].toUpperCase(), Sy[2]]); else if (SY) blocks.push(["EFFECTS", I.eff]);
    if (I.tuc && (!SY || sys === "none" || over)) blocks.push(["USEFUL CONSCIOUSNESS", `${I.tuc[1]} at ${I.tuc[0].toLocaleString()} ft`]);
    let ty = top + 2; const lh = fs * 1.35;
    for (const [k, v] of blocks) { T(g, cx, ty, k, { size: 11, fill: k === "RULE" ? ACC : GRAY }); ty += lh; for (const ln of wrapT(v, n)) { T(g, cx, ty, ln, { size: fs, fill: INK, mono: false }); ty += lh; } ty += lh * 0.5; }
    if (SY) { const o2 = sys === "none" ? spo2(a) : over ? null : 96, bx2 = cx, by2 = Math.max(ty + 6, bot - 70), low = o2 != null && o2 < 90;
      R(g, bx2, by2, 170, 64, { rx: 10, fill: "#0A0A0B", stroke: low || o2 == null ? "#D9493E" : GRAY, sw: 1.4 });
      T(g, bx2 + 12, by2 + 20, "PULSE OXIMETER", { size: 11, fill: GRAY });
      T(g, bx2 + 12, by2 + 50, o2 == null ? (sys === "none" ? "inadequate" : "over limit") : `SpO2 ${o2}%`, { mono: false, size: o2 == null ? 13 : 20, fill: low || o2 == null ? "#D9493E" : INK, weight: 700 });
      const cap = sys === "none" ? (o2 == null ? ["No oxygen", "Breathing air is totally inadequate at this altitude. Use supplemental oxygen or descend now."] : low ? ["Below 90%", "Mental function starts to suffer below about 90%. Use supplemental oxygen or descend now."] : ["Breathing air", "Drag the altitude and watch your blood oxygen fall. The readout uses the FAA's typical values."])
        : over ? ["Past this system's limit", "This system isn't rated for this altitude. Switch to one that is, or descend to where it works."] : ["On oxygen", "Enough supplemental oxygen keeps blood saturation near sea-level values: 96% in the FAA table."];
      S.F.caption(cap[0], cap[1]); }
    S.F.explain(`Oxygen is still about 21% of the air at ${a.toLocaleString()} ft, but its partial pressure drops as you climb, so each breath delivers less. Symptoms vary and the first ones can feel pleasant. Treatment: descend and/or use oxygen. <span class="src">AIM 8-1-2 · PHAK 17</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
