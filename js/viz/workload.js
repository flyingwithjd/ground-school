// Workload management (PHAK 2): move tasks out of the busy pattern into quieter phases. Bar heights are illustrative, not measured.
import { chips } from "./base.js?v=681adac966";
import { pxScene, T, L, R, hit, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=681adac966";
const PH = [["Preflight", 2], ["Climb", 4], ["Cruise", 2], ["Descent", 4], ["Pattern", 6]];
const TASKS = [
  ["Review the airport diagram", 2, 0], ["Set frequencies", 1, 0], ["Get ATIS / ASOS", 1, 2], ["Before-landing checklist", 2, 3],
]; // [name, load, earliest phase index]
const CAP = 8;
export function mount(host) {
  const at = TASKS.map(() => 4); // everything left until the pattern
  let pick = 0;
  const S = pxScene(host, { cls: "tall", corners: { tl: "Workload · illustrative", tr: "PHAK 2" } }, draw);
  chips(S.F.ctrl, TASKS.map((t, i) => [String(i), t[0]]), "0", (v) => { if (v != null) { pick = +v; S.redraw(); } }, { label: "Task to move" });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 14, x1 = W - 14, bw = (x1 - x0) / PH.length, gy = H - 40, sc = (gy - top - 40) / 11, yc = gy - CAP * sc;
    L(g, x0, yc, x1, yc, { stroke: ACC, dash: "6 4", w: 1.4 }); T(g, x1, yc - 8, "YOUR CAPACITY", { anchor: "end", size: 11, fill: ACC });
    PH.forEach(([n, base], i) => {
      const tasks = TASKS.map((t, j) => [t, j]).filter(([, j]) => at[j] === i), load = base + tasks.reduce((a, [t]) => a + t[1], 0);
      const x = x0 + i * bw + 4, w = bw - 8, ok = TASKS[pick][2] <= i, over = load > CAP;
      const area = R(g, x - 2, top + 10, w + 4, gy - top - 6, { fill: ok ? "rgba(242,241,236,.03)" : "transparent", stroke: ok ? DIM : "transparent", sw: 1, rx: 6, dash: "3 5" });
      if (ok) hit(g, area, `Move ${TASKS[pick][0]} to ${n}`, () => { at[pick] = i; S.redraw(); });
      let y = gy; R(g, x, y - base * sc, w, base * sc, { fill: "rgba(242,241,236,.18)", rx: 2 }); y -= base * sc;
      tasks.forEach(([t, j]) => { R(g, x, y - t[1] * sc, w, t[1] * sc - 2, { fill: j === pick ? ACC : ACCM, rx: 2 }); y -= t[1] * sc; });
      if (over) T(g, x + w / 2, y - 8, "OVER", { anchor: "middle", size: 11, fill: INK, weight: 600 });
      T(g, x + w / 2, gy + 18, ph ? n.slice(0, 5).toUpperCase() : n.toUpperCase(), { anchor: "middle", size: 11, fill: GRAY });
      [area].forEach((a) => a.style.pointerEvents = ok ? "auto" : "none");
    });
    const overN = PH.filter((p, i) => p[1] + TASKS.reduce((a, t, j) => a + (at[j] === i ? t[1] : 0), 0) > CAP).length;
    S.F.caption(overN ? "Task-saturated" : "Workload managed", overN ? "Pattern over capacity" : "Every phase within capacity");
    S.F.explain(overN ? `Pick a task, then tap an earlier phase to do it there. Overloaded, you work harder, get less done and fixate. <span class="src">PHAK 2</span>` : `Done during quiet phases, the essential tasks don't pile up in the pattern. If you do get overloaded: stop, think, slow down, prioritize. Aviate, navigate, communicate. <span class="src">PHAK 2</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
