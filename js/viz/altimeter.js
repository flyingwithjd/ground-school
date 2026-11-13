// Altimeter setting error (PHAK 8): fly from high to low pressure without resetting, and the airplane sits lower than the altimeter says.
import { slider, chips } from "./base.js?v=ab272ba69e";
import { pxScene, T, L, R, P, planeTop, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=ab272ba69e";
export function mount(host) {
  let set = 29.94, act = 29.69, cold = false;
  const S = pxScene(host, { cls: "tall", corners: { tl: "Altimeter setting error", tr: "PHAK 8 · 91.121" } }, draw);
  slider(S.F.ctrl, { label: "Actual setting ahead", min: 29.4, max: 30.4, step: 0.01, value: act, fmt: (v) => v.toFixed(2) + '"', oninput: (v) => { act = v; S.redraw(); } });
  const sb = slider(S.F.ctrl, { label: "Setting in your altimeter", min: 29.4, max: 30.4, step: 0.01, value: set, fmt: (v) => v.toFixed(2) + '"', oninput: (v) => { set = v; S.redraw(); } });
  chips(S.F.ctrl, [["c", "Also colder than standard"]], null, (v) => { cold = v === "c"; S.redraw(); }, { label: "Temperature", toggle: true });
  function draw(g, W, H, top) {
    const ph = W < 520, IND = 3000, err = Math.round((set - act) * 1000), tru = IND - err;
    const x0 = ph ? 60 : 74, x1 = W - 16, lo = 2300, hi = 3700, gy = H - 34, sc = (gy - top - 20) / (hi - lo), y = (a) => gy - (a - lo) * sc;
    for (let a = 2500; a <= 3500; a += 250) { L(g, x0 - 6, y(a), x0, y(a), { stroke: DIM }); T(g, x0 - 10, y(a) + 4, a.toLocaleString(), { anchor: "end", size: 11, fill: GRAY }); }
    L(g, x0, gy, x1, gy, { stroke: DIM }); T(g, x0, gy + 18, "", { size: 11 });
    // pressure areas
    const mid = (x0 + x1) / 2;
    T(g, x0 + 8, gy + 20, `SET ${set.toFixed(2)}`, { size: 11, fill: GRAY }); T(g, x1, gy + 20, `NOW ${act.toFixed(2)}`, { anchor: "end", size: 11, fill: act < set ? ACC : GRAY });
    // indicated line
    L(g, x0, y(IND), x1, y(IND), { stroke: GRAY, dash: "5 5" }); T(g, x0 + 6, y(IND) - 8, "ALTIMETER READS 3,000", { size: 11, fill: GRAY });
    // flight path from departure (correct) to the airplane's true position
    const px = x1 - (ph ? 50 : 80), py = y(tru);
    P(g, `M${x0 + 20},${y(IND)} C${mid},${y(IND)} ${mid},${py} ${px},${py}`, { stroke: ACC, w: 2 });
    planeTop(g, px, py, 90, ph ? 26 : 30, { stroke: INK, w: 1.8 });
    if (Math.abs(err) >= 10) {
      const ax = px - (ph ? 34 : 44); L(g, ax, y(IND), ax, py, { stroke: INK, w: 1.4, arrow: "kahw" });
      const lab = `${Math.abs(err)} ft ${err > 0 ? "LOW" : "HIGH"}`;
      T(g, ax - 8, (y(IND) + py) / 2 + 5, lab, { anchor: "end", size: ph ? 13 : 14, fill: err > 0 ? ACC : INK, weight: 600 });
    }
    if (cold) { T(g, px, Math.min(gy - 10, py + 34), "COLD: LOWER STILL", { anchor: "middle", size: 11, fill: ACC }); L(g, px, py + 14, px, Math.min(gy - 24, py + 22), { stroke: ACC, arrow: "kah" }); }
    S.F.caption("True altitude", `${tru.toLocaleString()} ft`);
    S.F.explain(err > 0 ? `Your altimeter still has ${set.toFixed(2)} set but the real setting is ${act.toFixed(2)}: ${(set - act).toFixed(2)} inch too high, so about ${err} ft lower than indicated. High to low, look out below. <span class="src">PHAK 8</span>` : err < 0 ? `The pressure rose, so with the old setting you're about ${-err} ft higher than indicated. <span class="src">PHAK 8</span>` : `Setting matches: the altimeter reads true altitude (in a standard-temperature atmosphere). Reset to a station within 100 NM as you go. <span class="src">14 CFR 91.121 · PHAK 8</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
