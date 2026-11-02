// Crash energy grows with the square of speed (AFH 18): at a uniform 9 G, about 9.4 ft to stop from 50 mph, 37.6 ft from 100 mph.
import { slider, readout } from "./base.js?v=e7b6cbaa08";
import { pxScene, T, L, R, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=e7b6cbaa08";
export function mount(host) {
  let v = 50;
  const S = pxScene(host, { corners: { tl: "Touchdown speed vs energy", tr: "AFH 18" } }, draw);
  const set = readout(S.F.ctrl, [["e", "energy vs 50 mph"], ["d", "stopping distance at 9 G"]]);
  slider(S.F.ctrl, { label: "Groundspeed at impact", min: 30, max: 100, step: 5, value: 50, fmt: (x) => x + " mph", oninput: (x) => { v = x; S.redraw(); } });
  function draw(g, W, H, top) {
    const k = (v / 50) ** 2, d = 9.4 * k, ph = W < 520;
    const x0 = 18, x1 = W - 18, bw = x1 - x0;
    // energy bars
    T(g, x0, top + 4, "DESTRUCTIVE ENERGY", { size: 11, fill: GRAY });
    const ex = (e) => x0 + (e / 4) * bw;
    const by = top + 14; R(g, x0, by, bw, 26, { stroke: DIM, sw: 1, rx: 4 });
    R(g, x0, by, ex(k) - x0, 26, { fill: ACC, rx: 4 });
    for (const m of [1, 2, 3, 4]) { L(g, ex(m), by + 28, ex(m), by + 36, { stroke: GRAY }); T(g, ex(m), by + 50, "×" + m, { anchor: m === 4 ? "end" : "middle", size: 11, fill: GRAY }); }
    // stopping distance
    const gy = Math.max(by + 120, H * (ph ? 0.64 : 0.68));
    T(g, x0, gy - 52, "DISTANCE TO STOP AT 9 G", { size: 11, fill: GRAY });
    const fx = (ft) => x0 + (ft / 40) * bw;
    L(g, x0, gy, x1, gy, { stroke: GRAY });
    for (const ft of [0, 10, 20, 30, 40]) { L(g, fx(ft), gy, fx(ft), gy + 6, { stroke: GRAY }); T(g, fx(ft), gy + 22, ft + " ft", { anchor: ft === 40 ? "end" : ft === 0 ? "start" : "middle", size: 11, fill: GRAY }); }
    R(g, x0, gy - 30, fx(d) - x0, 22, { fill: ACCF, stroke: ACC, rx: 3 });
    const lab = d.toFixed(1) + " ft"; const lx = fx(d); T(g, lx + 8 > x1 - 60 ? lx - 8 : lx + 8, gy - 14, lab, { anchor: lx + 8 > x1 - 60 ? "end" : "start", size: 14, fill: INK });
    T(g, x0, H - 16, "Double the speed → four times the energy", { size: ph ? 11 : 12, fill: INK });
    set("e", "×" + k.toFixed(2).replace(/\.?0+$/, "")); set("d", d.toFixed(1) + " ft");
    S.F.explain(v <= 50 ? "Slow is survivable: touch down at the lowest controllable airspeed, into the wind if you can, and let crops, brush or small trees absorb the energy. <span class=\"src\">AFH 18</span>"
      : `At ${v} mph you carry ${k.toFixed(1)}× the energy of a 50 mph touchdown and need ${d.toFixed(1)} ft to stop at the same 9 G. Every knot you shed before contact counts. <span class="src">AFH 18</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
