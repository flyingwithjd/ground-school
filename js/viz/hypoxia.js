// Altitude vs oxygen: 91.211 requirements, AIM 8-1-2 recommendations and effects, PHAK Fig 17-1 time of useful consciousness.
import { slider } from "./base.js?v=e7b6cbaa08";
import { pxScene, T, L, R, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=e7b6cbaa08";
const TUC = [[20000, "30 min or more"], [22000, "5–10 min"], [25000, "3–5 min"], [28000, "2½–3 min"], [30000, "1–2 min"], [35000, "30–60 s"], [40000, "15–20 s"], [45000, "9–15 s"]];
const MAX = 30000;
function info(a) {
  const reg = a > 15000 ? "Every occupant must be provided with oxygen; crew uses it at all times." : a > 14000 ? "Required crew must use oxygen at all times." : a > 12500 ? "Required crew must use oxygen after 30 minutes." : "No oxygen required by 91.211.";
  const rec = a > 10000 ? "Use oxygen above 10,000 ft by day and above 5,000 ft at night." : a > 5000 ? "Use oxygen above 5,000 ft at night." : "No oxygen recommendation below 5,000 ft.";
  const eff = a >= 15000 ? "Performance can seriously deteriorate within 15 minutes at 15,000 ft." : a >= 12000 ? "12,000–15,000 ft: judgment, memory, alertness, coordination and calculation suffer." : a >= 5000 ? "Night vision starts to deteriorate as low as 5,000 ft." : "Healthy pilots usually notice nothing here.";
  let tuc = null; for (const [h, t] of TUC) if (a >= h) tuc = [h, t];
  return { reg, rec, eff, tuc };
}
export function mount(host) {
  let a = 8000;
  const S = pxScene(host, { cls: "tall", corners: { tl: "Cabin altitude and oxygen", tr: "14 CFR 91.211 · AIM 8-1 · PHAK 17" } }, draw);
  slider(S.F.ctrl, { label: "Cabin altitude", min: 0, max: 45000, step: 500, value: a, fmt: (x) => x.toLocaleString() + " ft", oninput: (x) => { a = x; S.redraw(); } });
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
    const blocks = [["RULE", I.reg], ["AIM", I.rec], ["EFFECTS", I.eff]]; if (I.tuc) blocks.push(["USEFUL CONSCIOUSNESS", `${I.tuc[1]} at ${I.tuc[0].toLocaleString()} ft`]);
    let ty = top + 2; const lh = fs * 1.35;
    for (const [k, v] of blocks) { T(g, cx, ty, k, { size: 11, fill: k === "RULE" ? ACC : GRAY }); ty += lh; for (const ln of wrapT(v, n)) { T(g, cx, ty, ln, { size: fs, fill: INK, mono: false }); ty += lh; } ty += lh * 0.5; }
    S.F.explain(`Oxygen is still about 21% of the air at ${a.toLocaleString()} ft, but its partial pressure drops as you climb, so each breath delivers less. Symptoms vary and the first ones can feel pleasant. Treatment: descend and/or use oxygen. <span class="src">AIM 8-1-2 · PHAK 17</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
