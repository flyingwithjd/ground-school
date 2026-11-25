// The 180° turn out of clouds (AFH FAA-H-8083-3C ch 18; FAA-H-8083-15B): a top view, not to scale, of an airplane that
// has flown into cloud and turns back the way it came, wings banked no more than 10° as the AFH advises a pilot without
// instrument training, holding altitude. The slider is time since the turn began; the attitude indicator shows the bank.
// Rate: 1,091 × tan(bank) ÷ TAS (kt) degrees per second. Static scene.
import { slider, row } from "./base.js?v=680d64f417";
import { pxScene, T, L, C, P, ACC, INK, GRAY } from "./kit.js?v=680d64f417";
import { drawAI } from "./attind.js?v=680d64f417";
const D = Math.PI / 180, TAS = 100, BANK = 10, RATE = (1091 * Math.tan(BANK * D)) / TAS, TT = Math.ceil(180 / RATE);
const halo = (t) => { t.setAttribute("stroke", "#0a0a0a"); t.setAttribute("stroke-width", 3); t.setAttribute("paint-order", "stroke"); return t; };

export function mount(host) {
  let t = 0;
  const S = pxScene(host, { cls: "t180", corners: { tl: "Top view · not to scale", tr: "AFH 18" } }, draw);
  slider(row(S.F.ctrl), { label: "Time in turn", min: 0, max: TT, step: 1, value: 0, fmt: (v) => `${v} s`, oninput: (v) => { t = +v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, mapW = ph ? W : W * 0.66, cy0 = top + (H - top) * 0.48, R0 = Math.min((H - top) * 0.28, mapW * 0.18);
    const sx = mapW * 0.05, cx = ph ? mapW * 0.5 : mapW * 0.58;   // turn starts at (cx, cy0 + R0) heading east; a left turn would go north first. We turn right: center below.
    // cloud around the turn
    { const ccx0 = cx + R0 * 0.25, rx = R0 * 1.55, ry = R0 * 1.4; let d = ""; for (let a = 0; a <= 72; a++) { const t = (a / 72) * 2 * Math.PI, k = 1 + 0.035 * Math.sin(9 * t); d += (a ? "L" : "M") + (ccx0 + Math.cos(t) * rx * k).toFixed(1) + "," + (cy0 + Math.sin(t) * ry * k).toFixed(1); }
      P(g, d + "Z", { fill: "rgba(242,241,236,.10)", stroke: "rgba(242,241,236,.35)", w: 1.2 }); halo(T(g, ccx0 + rx * 0.35, cy0 - ry * 0.72, "cloud", { size: 11, fill: GRAY, anchor: "middle" })); }
    // inbound track, then the turn: right turn around a center below the entry point
    const ey = cy0 - R0, ccx = cx, ccy = cy0;   // entry at top of circle heading east
    L(g, sx, ey, cx, ey, { stroke: GRAY, w: 2, dash: "6 5" }); halo(T(g, sx, ey - 10, "into the cloud", { size: 11, fill: GRAY }));
    const done = Math.min(180, RATE * t), arc = (deg) => [ccx + R0 * Math.sin(deg * D), ccy - R0 * Math.cos(deg * D)];
    let d = `M${cx},${ey}`; for (let a = 2; a <= 180; a += 2) d += ` L${arc(a).join(",")}`; P(g, d, { stroke: "rgba(242,241,236,.25)", w: 1.6, dash: "3 4" });
    if (done > 0) { let d2 = `M${cx},${ey}`; for (let a = 2; a <= done; a += 2) d2 += ` L${arc(a).join(",")}`; d2 += ` L${arc(done).join(",")}`; P(g, d2, { stroke: ACC, w: 3 }); }
    if (done >= 180) L(g, cx, cy0 + R0, sx, cy0 + R0, { stroke: ACC, w: 3, arrow: true });
    halo(T(g, sx, cy0 + R0 + 18, "back out the way you came", { size: 11, fill: done >= 180 ? INK : GRAY }));
    // airplane marker
    const [px, py] = arc(done), hd = done * D; P(g, `M${px + Math.cos(hd) * 9},${py + Math.sin(hd) * 9} L${px - Math.cos(hd) * 7 - Math.sin(hd) * 6},${py - Math.sin(hd) * 7 + Math.cos(hd) * 6} L${px - Math.cos(hd) * 7 + Math.sin(hd) * 6},${py - Math.sin(hd) * 7 - Math.cos(hd) * 6} Z`, { fill: INK, stroke: "none" });
    // attitude indicator
    const bank = done < 180 && t > 0 ? BANK : 0, air = ph ? Math.min(34, (H - top) * 0.13) : Math.min(70, W * 0.1);
    drawAI(g, ph ? W - air - 8 : W * 0.84, ph ? H - air - 8 : cy0, air, 0, bank);
    const hdg = (90 + done) % 360, hs = String(Math.round(hdg) || 360).padStart(3, "0");
    S.F.caption(`${t} s · heading ${hs}° · ${Math.round(done)}° of 180°`, done >= 180 ? "Wings level, heading out" : t === 0 ? "Entering cloud: start the turn" : `${BANK}° bank, holding altitude`);
    S.F.explain(`At ${TAS} knots, a ${BANK}° bank turns about ${RATE.toFixed(1)}° a second, so 180° takes about ${TT} seconds; a standard-rate turn (3° a second) would need about 15° of bank. Note your heading before you start, fly the attitude indicator with small, smooth inputs, hold altitude, and roll out on the reciprocal heading. Then tell ATC and get help. The best plan is to turn around before the visibility goes. <span class="src">AFH 18 · FAA-H-8083-15B · AIM 6-2</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
