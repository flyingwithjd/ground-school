// Thunderstorm life cycle, side view (PHAK 12, Fig 12-28): cumulus (updrafts), mature (updrafts and downdrafts, rain or
// hail, the most violent stage), dissipating (downdrafts). Updrafts are blue, downdrafts white. Loops through the stages
// on its own, or tap a stage to hold it. Continuous animation, on screen only, 30 fps cap.
import { chips, row, loop } from "./base.js?v=d5b31b47a9";
import { pxScene, T, L, C, P, ACC, INK, GRAY, BODY } from "./kit.js?v=d5b31b47a9";
const ST = {
  cu: ["Cumulus stage", "Updrafts build the cloud", "Warm, moist, unstable air rises in continuous updrafts and the cloud towers upward. There's little or no rain yet, because the updrafts hold the drops aloft."],
  ma: ["Mature stage", "Rain or hail and downdrafts: the most violent", "Drops grow too heavy to hold up and rain or hail falls, dragging air down with it. Updrafts and downdrafts now sit side by side: severe turbulence, lightning, and a gust front where the downdraft spreads out along the ground. This is the most violent stage."],
  di: ["Dissipating stage", "Downdrafts take over", "Downdrafts spread through the whole cell and cut off the warm, moist inflow. The rain tapers off and the cloud collapses, leaving the anvil top spread out by the winds aloft. It can still hold turbulence and hail."],
};
const ORDER = ["cu", "ma", "di"], STAGE_S = 5;
export function mount(host) {
  let pick = "auto", now = performance.now(), last = 0; const t0 = now;
  const S = pxScene(host, { cls: "tsl", corners: { tl: "Thunderstorm life cycle", tr: "PHAK 12" } }, draw);
  chips(row(S.F.ctrl), [["auto", "Loop"], ["cu", "Cumulus"], ["ma", "Mature"], ["di", "Dissipating"]], pick, (v) => { pick = v || pick; S.redraw(); }, { label: "Stage" });
  const run = loop(S.F, (n) => { if (n - last < 33) return; last = n; now = n; S.redraw(); }); run.start();
  function draw(g, W, H, top) {
    const ph = W < 520, t = (now - t0) / 1000, st = pick === "auto" ? ORDER[Math.floor(t / STAGE_S) % 3] : pick;
    const gy = H - (ph ? 34 : 38), hh = gy - top - 8, cx = W * 0.5, base = gy - hh * 0.3, fz = gy - hh * 0.55;
    // freezing level and ground
    L(g, 10, fz, W - 10, fz, { stroke: "rgba(242,241,236,.25)", w: 1, dash: "5 5" }); T(g, W - 12, fz - 5, "0 °C", { size: 11, fill: GRAY, anchor: "end" });
    L(g, 10, gy, W - 10, gy, { stroke: INK, w: 2 });
    // cloud: a union of puffs (white rims drawn first, dark bodies on top, so only the outline shows)
    const sc = Math.min(1, Math.max(0.72, W / 700)), wd = (ph ? 0.95 : 1) * sc;
    const puffs = [];
    const tower = (topY, halfW) => { for (let y = base - 10; y > topY; y -= 18 * sc) { const f = (base - y) / (base - topY); const w = halfW * (1 - 0.25 * f); puffs.push([cx - w * 0.55, y, w * 0.55], [cx + w * 0.5, y - 6, w * 0.5], [cx, y - 10, w * 0.6]); } };
    if (st === "cu") tower(base - hh * 0.42, 70 * wd);
    if (st === "ma") { tower(top + hh * 0.12, 95 * wd); for (let i = -5; i <= 5; i++) puffs.push([cx + i * 26 * wd + 20 * wd, top + hh * 0.1, 22 * wd]); }
    if (st === "di") { tower(top + hh * 0.16, 52 * wd); for (let i = -6; i <= 6; i++) puffs.push([cx + i * 28 * wd + 30 * wd, top + hh * 0.11, 18 * wd]); }
    for (const [x, y, r] of puffs) C(g, x, y, r, { stroke: INK, sw: 4 });
    for (const [x, y, r] of puffs) C(g, x, y, r, { fill: BODY });
    if (st !== "cu") T(g, cx + (st === "ma" ? 150 : 185) * wd, top + hh * 0.1 - (ph ? 22 : 26) * wd - 6, "anvil", { size: 11, fill: GRAY, anchor: "middle" });
    // rain shaft
    if (st !== "cu") { const n = st === "ma" ? 10 : 5, x0 = cx - (st === "ma" ? 10 : 30) * wd; for (let i = 0; i < n; i++) { const x = x0 + i * 7 * wd, y = base + 34 * wd + ((t * 120 + i * 37) % Math.max(10, gy - base - 34 * wd - 10)); L(g, x, y, x - 3, y + 9, { stroke: "rgba(242,241,236,.5)", w: 1.4 }); } }
    // drafts: arrows that move
    const arrowUp = (x, y, col) => { L(g, x, y + 12, x, y - 6, { stroke: col, w: 2.2 }); P(g, `M${x - 5},${y} L${x},${y - 8} L${x + 5},${y}`, { stroke: col, w: 2.2 }); };
    const arrowDn = (x, y, col) => { L(g, x, y - 12, x, y + 6, { stroke: col, w: 2.2 }); P(g, `M${x - 5},${y} L${x},${y + 8} L${x + 5},${y}`, { stroke: col, w: 2.2 }); };
    const span = gy - (top + hh * 0.2);
    const ups = st === "cu" ? [-30, 0, 30] : st === "ma" ? [-45, -20] : [];
    const dns = st === "ma" ? [25, 50] : st === "di" ? [-30, -5, 20, 42] : [];
    ups.forEach((dx, i) => { for (let k = 0; k < 3; k++) { const y = gy - 14 - ((t * 60 + k * span / 3 + i * 23) % (gy - 14 - (st === "cu" ? base - hh * 0.4 : top + hh * 0.2))); arrowUp(cx + dx * wd, y, ACC); } });
    dns.forEach((dx, i) => { for (let k = 0; k < 3; k++) { const y = (st === "ma" ? top + hh * 0.25 : base - hh * 0.25) + ((t * 60 + k * span / 3 + i * 29) % (gy - 16 - (st === "ma" ? top + hh * 0.25 : base - hh * 0.25))); arrowDn(cx + dx * wd, y, INK); } });
    if (st === "ma") { for (const s2 of [-1, 1]) { const x = cx + 37 * wd + s2 * (30 + ((t * 50) % 60)); L(g, x - s2 * 12, gy - 6, x, gy - 6, { stroke: INK, w: 2 }); P(g, `M${x - s2 * 6},${gy - 11} L${x},${gy - 6} L${x - s2 * 6},${gy - 1}`, { stroke: INK, w: 2 }); } T(g, W - 12, gy - 22, "gust front", { size: 11, fill: INK, anchor: "end" }); }
    // legend + stage strip
    T(g, W - 12, fz + 20, "updraft", { size: 11, fill: ACC, anchor: "end" }); T(g, W - 12, fz + 34, "downdraft", { size: 11, fill: INK, anchor: "end" });
    ORDER.forEach((k, i) => { const x = W * (0.2 + i * 0.3), on = k === st; T(g, x, gy + (ph ? 22 : 24), ["1 Cumulus", "2 Mature", "3 Dissipating"][i], { size: 11, fill: on ? ACC : GRAY, anchor: "middle", weight: on ? 700 : 500 }); });
    const s = ST[st]; S.F.caption(s[1], s[0]);
    S.F.explain(`${s[2]} Every thunderstorm needs moisture, an unstable lapse rate and a lifting force. Stay at least 20 NM from a severe one, and never fly under it. <span class="src">PHAK 12</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
