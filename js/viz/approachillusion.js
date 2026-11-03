// Approach illusions (AFH 11, PHAK 17): pick a condition and compare the path you feel you're on with where you actually fly.
import { chips } from "./base.js?v=cd2764e5ab";
import { pxScene, T, L, P, R, ACC, INK, GRAY, DIM } from "./kit.js?v=cd2764e5ab";
const IL = {
  black: ["Black hole", "Over water or dark land with only runway lights, you feel higher than you are.", "low", "AFH 11 · PHAK 17"],
  bright: ["Bright lights", "Bright runway and approach lights, with few lights on the terrain around them, make the runway look closer.", "high", "PHAK 17"],
  narrow: ["Narrow runway", "A narrower-than-usual runway makes you feel high.", "low", "PHAK 17"],
  up: ["Upsloping runway", "An upsloping runway (or terrain) makes you feel high.", "low", "PHAK 17"],
  wide: ["Wide runway", "A wider-than-usual runway makes you feel low, with the risk of leveling off high and landing hard or overshooting.", "high", "PHAK 17"],
  down: ["Downsloping runway", "A downsloping runway or approach terrain has the opposite effect of an upslope: you feel low.", "high", "PHAK 17"],
};
export function mount(host, opts = {}) {
  let k = "black";
  const S = pxScene(host, { corners: { tl: "Approach illusions", tr: "AFH 11 · PHAK 17" } }, draw);
  chips(S.F.ctrl, Object.entries(IL).map(([v, x]) => [v, x[0]]), k, (v) => { k = v || k; S.redraw(); }, { label: "Condition" });
  function draw(g, W, H, top) {
    const ph = W < 520, gy = H - 34, rx0 = W * 0.66, rx1 = W - 14, x0 = 16, y0 = top + 30;
    const I = IL[k], slope = k === "up" ? -14 : k === "down" ? 10 : 0;
    // ground and runway (side view)
    L(g, 0, gy, rx0, gy, { stroke: k === "black" ? "rgba(242,241,236,.12)" : GRAY, w: 2 });
    P(g, `M${rx0},${gy} L${rx1},${gy + slope}`, { stroke: INK, w: k === "wide" ? 7 : k === "narrow" ? 2 : 4 });
    if (k === "bright") for (let i = 0; i < 6; i++) L(g, rx0 - 14 - i * 16, gy - 4, rx0 - 14 - i * 16, gy, { stroke: INK, w: 3 });
    T(g, (rx0 + rx1) / 2, gy + 22, "RUNWAY", { anchor: "middle", size: 11, fill: GRAY });
    // normal glidepath
    L(g, x0, y0 + 30, rx0, gy, { stroke: GRAY, w: 1.6, dash: "6 5" }); T(g, x0, y0 + 20, "NORMAL PATH", { size: 11, fill: GRAY });
    // actual path flown
    const low = I[2] === "low", ex = low ? `M${x0},${y0 + 70} Q${W * 0.36},${gy - 30} ${rx0 - W * 0.14},${gy}` : `M${x0},${y0 + 4} Q${W * 0.4},${y0 + 10} ${rx0 + (rx1 - rx0) * 0.6},${gy + slope * 0.6}`;
    P(g, ex, { stroke: ACC, w: 2.6 });
    T(g, low ? W * 0.3 : W * 0.38, low ? gy - 52 : y0 - 2, low ? "YOU FLY LOW" : "YOU FLY HIGH", { anchor: "middle", size: ph ? 12 : 13, fill: ACC, weight: 600 });
    if (low) T(g, rx0 - W * 0.14, gy + 22, "SHORT", { anchor: "middle", size: 11, fill: ACC });
    else T(g, rx1, gy + slope - 12, "LONG", { anchor: "end", size: 11, fill: ACC });
    S.F.caption(I[0], low ? "Feels high → you fly low" : "Feels low → you fly high");
    S.F.explain(`${I[1]} So you tend to fly ${I[2]}${low ? ", and in the worst case land short" : ""}. Defense: fly the VASI or PAPI, cross-check the altimeter, and go around if in doubt. <span class="src">${I[3]}</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
