// Stability (PHAK 12): give a parcel of air a push up to 3,000 ft, then let go. It cools at its adiabatic rate (3 °C per
// 1,000 ft dry, about 1.5 °C saturated); the air around it cools at the environmental lapse rate you set. Warmer than its
// surroundings, it keeps rising (unstable); colder, it sinks back (stable). Continuous loop, on screen only, 30 fps cap.
import { slider, chips, row, loop } from "./base.js?v=0ffd46bda8";
import { pxScene, T, L, C, P, R, ACC, INK, GRAY } from "./kit.js?v=0ffd46bda8";
const T0 = 20, HMAX = 10000, HPUSH = 3000, CYC = 7;
const halo = (e) => { e.setAttribute("stroke", "#0a0a0a"); e.setAttribute("stroke-width", 4); e.setAttribute("paint-order", "stroke"); return e; };
export function mount(host) {
  let env = 3.5, sat = false, t0 = performance.now(), now = t0, last = 0;
  const S = pxScene(host, { cls: "parcel", corners: { tl: "Lift a parcel of air", tr: "PHAK 12" } }, draw);
  chips(row(S.F.ctrl), [["dry", "Dry parcel · 3 °C"], ["sat", "Saturated · ~1.5 °C"]], "dry", (v) => { sat = v === "sat"; t0 = performance.now(); S.redraw(); }, { label: "Parcel" });
  slider(row(S.F.ctrl), { label: "Air cools", min: -1, max: 4, step: 0.5, value: env, fmt: (x) => `${x} °C/1k ft`, oninput: (x) => { env = x; t0 = performance.now(); S.redraw(); } });
  const run = loop(S.F, (n) => { if (n - last < 33) return; last = n; now = n; S.redraw(); }); run.start();
  function draw(g, W, H, top) {
    const ph = W < 520, gp = sat ? 1.5 : 3, d = env - gp;   // > 0: parcel warmer than the air as it rises
    const st = d > 0.01 ? "unstable" : d < -0.01 ? "stable" : "neutral";
    // where is the parcel? pushed up for 2 s, then free for 4 s, then a 1 s pause
    const tc = ((now - t0) / 1000) % CYC;
    const free = (f) => (st === "unstable" ? HPUSH + (HMAX - HPUSH) * Math.min(1, f * f * (0.6 + d * 0.6)) : st === "stable" ? HPUSH * Math.pow(1 - Math.min(1, f * (0.8 - d * 0.25)), 2) : HPUSH);
    let h = tc < 2 ? HPUSH * (tc / 2) * (tc / 2) * (3 - tc) : tc < 6 ? free((tc - 2) / 4) : free(1);   // eased push, let go, pause
    h = Math.max(0, Math.min(HMAX, h));
    const x0 = ph ? 40 : 60, x1 = W - (ph ? 16 : 30), y0 = H - 30, y1 = top + 14;
    const tmin = -20, tmax = 32, X = (tc2) => x0 + ((tc2 - tmin) / (tmax - tmin)) * (x1 - x0), Y = (hh) => y0 - (hh / HMAX) * (y0 - y1);
    // axes
    L(g, x0, y0, x1, y0, { stroke: "rgba(242,241,236,.5)", w: 1 }); L(g, x0, y0, x0, y1, { stroke: "rgba(242,241,236,.5)", w: 1 });
    for (let hh = 0; hh <= HMAX; hh += 2000) { if (hh) T(g, x0 - 6, Y(hh) + 4, ph ? hh / 1000 + "k" : hh.toLocaleString(), { size: 11, fill: GRAY, anchor: "end" }); if (hh) L(g, x0, Y(hh), x1, Y(hh), { stroke: "rgba(242,241,236,.07)", w: 1 }); }
    for (const tt of [-20, -10, 0, 10, 20, 30]) T(g, X(tt), y0 + 15, tt + " °C", { size: 11, fill: GRAY, anchor: "middle" });
    // environment (white) and parcel path (blue dashed)
    const te = (hh) => T0 - (env * hh) / 1000, tp = (hh) => T0 - (gp * hh) / 1000;
    L(g, X(te(0)), Y(0), X(te(HMAX)), Y(HMAX), { stroke: INK, w: 2 });
    L(g, X(tp(0)), Y(0), X(tp(HMAX)), Y(HMAX), { stroke: ACC, w: 1.6, dash: "6 4" });
    const hl = HMAX * 0.82, envRight = te(hl) >= tp(hl);
    { const s2 = ph ? "air" : "air around", fits = X(te(hl)) + 10 + s2.length * 7.5 < x1, right = envRight && fits;
      T(g, X(te(hl)) + (right ? 10 : -10), Y(hl) + (right || envRight ? 4 : 4) + (envRight && !fits ? -14 : 0), s2, { size: 11, fill: INK, anchor: right ? "start" : "end" }); }
    T(g, X(tp(hl)) + (envRight ? -10 : 10), Y(hl) + 4, "parcel", { size: 11, fill: ACC, anchor: envRight ? "end" : "start" });
    // the parcel itself, with its temperature difference
    const px = X(tp(h)), py = Y(h), diff = te(h) - tp(h);
    L(g, X(te(h)), py, px, py, { stroke: "rgba(242,241,236,.5)", w: 1, dash: "2 3" });
    C(g, px, py, ph ? 11 : 14, { fill: "rgba(59,130,246,.25)", stroke: ACC, sw: 2 });
    if (h > 300) { const dd = Math.abs(diff) < 0.05 ? "same temp" : (diff < 0 ? Math.abs(diff).toFixed(1) + "° warmer" : diff.toFixed(1) + "° colder"); T(g, px + (diff < 0 ? 18 : -18), py - 14, dd, { size: 11, fill: ACC, anchor: diff < 0 ? "start" : "end", weight: 600 }); }
    halo(T(g, x1 - 4, y0 - 8, tc < 2 ? "pushed up…" : tc < 6 ? "let go" : "", { size: 11, fill: GRAY, anchor: "end" }));
    const big = st === "unstable" ? "Unstable: it keeps rising" : st === "stable" ? "Stable: it sinks back" : "Neutral: it stays put";
    S.F.caption(`Air ${env < 0 ? "warms " + -env : "cools " + env} °C/1,000 ft · parcel ${gp} °C`, big);
    S.F.explain(`A rising parcel expands and cools: 3 °C per 1,000 ft while dry, more slowly (1.1–2.8 °C) once saturated, because condensing water releases heat. If the air around it cools faster than the parcel, the parcel stays warmer and lighter and keeps rising: <strong>unstable</strong>, with cumulus, showers and bumps. If the air cools more slowly, or warms with height (an <strong>inversion</strong>), the parcel ends up colder and sinks back: <strong>stable</strong>, with stratus, haze and smooth air. <span class="src">PHAK 12</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
