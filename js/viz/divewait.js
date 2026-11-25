// Diving, then flying (AIM 8-1-2; PHAK 17): choose the dive type and how high you'll fly, and the bar shows the minimum
// wait before flight: 12 hours, or 24. Static scene.
import { chips, row } from "./base.js?v=4d40905da2";
import { pxScene, T, L, R, ACC, INK, GRAY, ACCF } from "./kit.js?v=4d40905da2";
export function mount(host) {
  let deco = false, high = false;
  const S = pxScene(host, { cls: "dive", corners: { tl: "Wait before flying", tr: "AIM 8-1-2 · PHAK 17" } }, draw);
  chips(row(S.F.ctrl), [["n", "No decompression stops"], ["d", "Decompression stops"]], "n", (v) => { deco = v === "d"; S.redraw(); }, { label: "Dive" });
  chips(row(S.F.ctrl), [["lo", "Up to 8,000 ft"], ["hi", "Above 8,000 ft"]], "lo", (v) => { high = v === "hi"; S.redraw(); }, { label: "Flight altitude" });
  function draw(g, W, H, top) {
    const wait = deco || high ? 24 : 12, m = 18, x0 = m, x1 = W - m, X = (h) => x0 + (h / 24) * (x1 - x0), by = top + (H - top) * 0.38, bh = 30;
    R(g, x0, by, x1 - x0, bh, { stroke: "rgba(242,241,236,.3)", sw: 1, rx: 6 });
    R(g, x0, by, X(wait) - x0, bh, { fill: "rgba(239,68,68,.22)", rx: 6 });
    L(g, X(wait), by - 10, X(wait), by + bh + 10, { stroke: ACC, w: 3 });
    for (const h of [0, 12, 24]) T(g, X(h), by + bh + 24, `${h} h`, { size: 11, anchor: h === 0 ? "start" : h === 24 ? "end" : "middle", fill: GRAY });
    T(g, x0 + 8, by + bh / 2 + 4, "don't fly", { size: 11, fill: INK });
    T(g, x0, by - 14, "last dive", { size: 11, fill: GRAY }); T(g, X(wait), by - 14, "earliest flight", { size: 11, anchor: wait === 24 ? "end" : "middle", fill: INK });
    S.F.caption(`${deco ? "Dive with decompression stops" : "No-decompression dive"} · flying ${high ? "above" : "up to"} 8,000 ft`, `Wait at least ${wait} hours`);
    S.F.explain(`Nitrogen absorbed under water can form bubbles as cabin pressure drops: decompression sickness. Wait at least 12 hours after a dive without decompression stops if you'll fly up to 8,000 ft, and at least 24 hours after a dive with stops, or before flying above 8,000 ft. <span class="src">AIM 8-1-2 · PHAK 17</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
