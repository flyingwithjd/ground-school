// Standard atmosphere column: drag altitude, read standard temperature and pressure (PHAK 4: 2 °C and about 1 "Hg per 1,000 ft near the surface; half the pressure by about 18,000 ft).
import { slider, readout } from "./base.js?v=0080002776";
import { pxScene, T, L, R, P, C, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=0080002776";
const isaT = (h) => 15 - 2 * h / 1000;                                  // °C, troposphere
const isaP = (h) => 29.92 * Math.pow(1 - 6.8756e-6 * h, 5.2559);            // "Hg
const MAX = 20000;
export function mount(host) {
  let alt = 0;
  const S = pxScene(host, { corners: { tl: "Standard atmosphere", tr: "PHAK 4" } }, draw);
  const set = readout(S.F.ctrl, [["t", "standard temp"], ["p", "standard pressure"], ["f", "pressure vs sea level"]]);
  slider(S.F.ctrl, { label: "Altitude", min: 0, max: MAX, step: 500, value: 0, fmt: (v) => v.toLocaleString() + " ft", oninput: (v) => { alt = v; S.redraw(); } });
  function draw(g, W, H, top0) {
    const pad = 16, top = top0 + 22, bot = H - 30, x0 = W < 520 ? 58 : 76, colW = Math.min(110, W * 0.2);
    const y = (h) => bot - (h / MAX) * (bot - top);
    // altitude axis
    for (let h = 0; h <= MAX; h += 5000) { L(g, x0 - 6, y(h), x0, y(h), { stroke: GRAY }); T(g, x0 - 10, y(h) + 4, (h / 1000) + "k ft", { anchor: "end", size: 11, fill: GRAY }); }
    // air column: density shading by pressure ratio
    for (let i = 0; i < 20; i++) { const h0 = (i / 20) * MAX, h1 = ((i + 1) / 20) * MAX; R(g, x0 + 4, y(h1), colW, y(h0) - y(h1), { fill: `rgba(59,130,246,${(0.08 + 0.4 * (isaP(h0) / 29.92) ** 2).toFixed(3)})` }); }
    T(g, x0 + 4 + colW / 2, top - 12, "AIR", { anchor: "middle", size: 11, fill: GRAY });
    // temperature profile on the right
    const gx0 = x0 + colW + (W < 520 ? 26 : 50), gx1 = W - pad - 8; const tx = (t) => gx0 + ((t + 30) / 50) * (gx1 - gx0);
    L(g, gx0, bot, gx1, bot, { stroke: DIM }); for (const t of [-20, 0, 15]) { L(g, tx(t), bot, tx(t), top, { stroke: DIM, dash: "3 5" }); T(g, tx(t), bot + 16, t + " °C", { anchor: "middle", size: 11, fill: GRAY }); }
    P(g, `M${tx(isaT(0))},${y(0)} L${tx(isaT(MAX))},${y(MAX)}`, { stroke: ACC, w: 2.5 });
    T(g, gx1, top - 12, "TEMPERATURE", { anchor: "end", size: 11, fill: GRAY });
    const ty = y(alt); L(g, x0, ty, gx1, ty, { stroke: INK, w: 1, dash: "2 4" }); C(g, tx(isaT(alt)), ty, 6, { fill: ACC });
    const lab = `${Math.round(isaT(alt))} °C`, lx = tx(isaT(alt)); T(g, lx + (lx > (gx0 + gx1) / 2 ? -12 : 12), ty - 10, lab, { anchor: lx > (gx0 + gx1) / 2 ? "end" : "start", size: 13, fill: INK });
    if (alt >= 17500 && alt <= 18500) T(g, x0 + 4 + colW / 2, ty + 18, "≈ half", { anchor: "middle", size: 12, fill: INK });
    const pr = isaP(alt); set("t", `${isaT(alt).toFixed(1)} °C`); set("p", `${pr.toFixed(2)} "Hg`); set("f", Math.round(pr / 29.92 * 100) + "%");
    S.F.explain(alt === 0 ? "Sea level, standard day: 15 °C and 29.92 \"Hg (1013.2 mb). Drag the altitude. <span class=\"src\">PHAK 4</span>"
      : alt < 17500 ? `Each 1,000 ft costs about 2 °C and, near the surface, about 1 "Hg. At ${alt.toLocaleString()} ft the standard day is ${Math.round(isaT(alt))} °C. Less pressure and density means less lift, thrust and power. <span class="src">PHAK 4</span>`
      : `By about 18,000 ft the pressure is roughly half its sea-level value, so half the atmosphere's weight is below you. <span class="src">PHAK 4</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
