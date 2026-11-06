// Three definitions of night (14 CFR 1.1, 61.57(b), 91.209): drag the clock through an example evening.
import { slider } from "./base.js?v=c64a1f77b5";
import { pxScene, T, L, R, ACC, INK, GRAY, DIM, ACCF, ACCM, fmtTime } from "./kit.js?v=c64a1f77b5";
export function mount(host) {
  // Example evening only. Real sunset and civil twilight times vary by date and place: look them up.
  let ss = 19 * 60 + 30, tw = 30, t = 20 * 60 + 15;
  const S = pxScene(host, { cls: "tall", corners: { tl: "Three clocks for one sunset", tr: "Example evening" } }, draw);
  slider(S.F.ctrl, { label: "Time", min: 18 * 60 + 30, max: 22 * 60, step: 5, value: t, fmt: (v) => fmtTime(v), oninput: (v) => { t = v; S.redraw(); } });
  slider(S.F.ctrl, { label: "Example: civil twilight lasts", min: 20, max: 50, step: 5, value: tw, fmt: (v) => v + " min", oninput: (v) => { tw = v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 16, x1 = W - 16, t0 = 18 * 60 + 30, t1 = 22 * 60, X = (m) => x0 + ((m - t0) / (t1 - t0)) * (x1 - x0);
    const rows = [
      ["POSITION LIGHTS ON", "91.209", ss, t1, (m) => m >= ss],
      ["NIGHT: LOG IT, NIGHT EQUIPMENT", "1.1", ss + tw, t1, (m) => m >= ss + tw],
      ["PASSENGER CURRENCY LANDINGS", "61.57(b)", ss + 60, t1, (m) => m >= ss + 60],
    ];
    const rh = Math.min(64, (H - top - 70) / 3.4), y0 = top + 26;
    // sunset marker
    L(g, X(ss), top + 8, X(ss), y0 + rows.length * rh, { stroke: GRAY, dash: "3 4" }); T(g, X(ss), top + 6, "SUNSET " + fmtTime(ss), { anchor: X(ss) > W * 0.6 ? "end" : "middle", size: 11, fill: GRAY });
    rows.forEach(([lab, src, a, b, on], i) => { const y = y0 + i * rh, act = on(t);
      T(g, x0, y + 12, lab, { size: 11, fill: act ? INK : GRAY }); T(g, x1, y + 12, src, { anchor: "end", size: 11, fill: GRAY });
      R(g, x0, y + 20, x1 - x0, 14, { fill: "rgba(242,241,236,.05)", rx: 3 });
      R(g, X(a), y + 20, X(b) - X(a), 14, { fill: act ? ACC : ACCM, rx: 3 });
      T(g, X(a) + 4, y + 50, (i === 1 ? "END OF CIVIL TWILIGHT " : i === 2 ? "SUNSET + 1 H " : "") + fmtTime(a), { anchor: X(a) > W * 0.55 ? "end" : "start", size: 11, fill: GRAY });
    });
    // time cursor
    L(g, X(t), y0 - 6, X(t), y0 + rows.length * rh, { stroke: INK, w: 2 });
    const yb = y0 + rows.length * rh + 22;
    for (const m of [19 * 60, 20 * 60, 21 * 60, 22 * 60]) T(g, X(m), yb, fmtTime(m), { anchor: m === t1 ? "end" : "middle", size: 11, fill: GRAY });
    const n = rows.filter((r) => r[4](t)).length;
    S.F.caption(fmtTime(t), n === 0 ? "Day for every rule" : n === 1 ? "Lights on; not yet night" : n === 2 ? "Night: log it" : "Counts for night currency");
    S.F.explain(`At ${fmtTime(t)} in this example: position lights ${t >= ss ? "required" : "not yet required"}; ${t >= ss + tw ? "it's night under 1.1, so log it and carry night equipment" : "not yet night for logging or equipment"}; landings ${t >= ss + 60 ? "count" : "don't count yet"} toward the 61.57(b) passenger currency. The same rules apply in reverse before sunrise. Look up the real times for your date and place. <span class="src">14 CFR 1.1 · 61.57(b) · 91.209</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
