// Pitot-static blockage trainer. Pick a failure, then move the altitude slider and read the three gauges. Labels in screen px.
// Pressures use ~1 in. Hg per 1,000 ft (PHAK 8) and q = ½ρV²; magnitudes are illustrative of direction and size.
import { chips, slider, loop } from "./base.js?v=6932bc693e";
import { clamp } from "../core/util.js?v=6932bc693e";
import { pxScene, T, L, P, R, C, ACC, INK, GRAY, DIM, ACCF, MONO, SANS } from "./kit.js?v=6932bc693e";
const CASES = {
  ok: ["Normal", "All three instruments read correctly."],
  pitot: ["Pitot blocked, drain open", "Ram air can't enter and the trapped air leaks out the drain, so the airspeed indicator drops to zero. Altimeter and VSI still work."],
  pitotdrain: ["Pitot and drain blocked", "Pitot pressure is trapped. The airspeed indicator now acts like an altimeter: it rises in a climb and falls in a descent. A pilot who believes it can stall in a climb."],
  static: ["Static port blocked", "Static pressure is trapped. The altimeter freezes, the VSI sits at zero, and airspeed reads low in a climb and high in a descent."],
  alt: ["Alternate static open", "Static now comes from the cabin, which is at slightly lower pressure. Airspeed and altitude read a little high; the POH has a correction table."],
};
const V0 = 100, H0 = 4500, Q0 = 0.478; // 100 KIAS ≈ 0.478 in. Hg dynamic pressure near sea-level density
export function mount(host) {
  let mode = "ok", h = H0, hBlock = H0, rate = 0, lastH = H0, G = [];
  const S = pxScene(host, { cls: "tall", corners: { tl: "Pitot-static system", tr: "PHAK 8" } }, draw);
  function draw(g, W, H, top) {
    const ph = W < 520, n = 3, gw = (W - 24) / n, r = Math.min(gw / 2 - 10, (H - top) * 0.16, 64), gy = top + r + 8;
    const names = ["AIRSPEED", "ALTIMETER", "VSI"];
    G = names.map((nm, i) => { const cx = 12 + gw * (i + 0.5);
      C(g, cx, gy, r, { stroke: GRAY, sw: 1.5 });
      const needle = L(g, cx, gy, cx, gy - r + 8, { stroke: ACC, w: 3 });
      const val = T(g, cx, gy + r * 0.45, "", { anchor: "middle", size: ph ? 17 : 22, fill: INK, mono: false, weight: 800 });
      const unit = T(g, cx, gy + r * 0.45 + 16, "", { anchor: "middle", size: 11, fill: GRAY });
      T(g, cx, gy + r + 18, nm, { anchor: "middle", size: 11, fill: GRAY }); return { cx, cy: gy, r, needle, val, unit }; });
    // plumbing
    const pitBlocked = mode === "pitot" || mode === "pitotdrain", stBlocked = mode === "static";
    const yP = gy + r + 44, yS = H - 46, xL = 24, x0 = G[0].cx, x1 = G[1].cx, x2 = G[2].cx;
    P(g, `M${xL + 40},${yP} L${x0 - 8},${yP} L${x0 - 8},${gy + r + 4}`, { stroke: pitBlocked ? ACC : GRAY, w: 2.4 });
    P(g, `M${xL + 18},${yS} L${x2 + 8},${yS} L${x2 + 8},${gy + r + 4} M${x0 + 8},${yS} L${x0 + 8},${gy + r + 4} M${x1},${yS} L${x1},${gy + r + 4}`, { stroke: stBlocked ? ACC : GRAY, w: 2.4 });
    // pitot head and drain
    P(g, `M${xL},${yP - 8} L${xL + 40},${yP - 8} L${xL + 40},${yP + 8} L${xL},${yP + 8}`, { stroke: INK, w: 2 });
    if (pitBlocked) R(g, xL - 4, yP - 10, 8, 20, { fill: ACC });
    C(g, xL + 22, yP + 14, mode === "pitotdrain" ? 6 : 3, { fill: mode === "pitotdrain" ? ACC : GRAY });
    T(g, xL, yP + 40, "PITOT TUBE", { size: 11, fill: GRAY }); T(g, xL + 34, yP + 18, "DRAIN", { size: 11, fill: GRAY });
    R(g, xL, yS - 12, 14, 24, { stroke: INK, sw: 2, rx: 3 }); if (stBlocked || mode === "alt") R(g, xL - 3, yS - 15, 20, 30, { fill: ACC, rx: 4, op: mode === "alt" ? 0.5 : 1 });
    T(g, xL, yS + 30, "STATIC PORT", { size: 11, fill: GRAY });
    if (mode === "alt") { P(g, `M${(xL + x1) / 2},${yS} L${(xL + x1) / 2},${yS + 22}`, { stroke: ACC, w: 2.4 }); T(g, (xL + x1) / 2 + 8, yS + 30, "CABIN (ALTERNATE)", { size: 11, fill: ACC }); }
    read();
  }
  function setG(Gi, v, u, frac) { if (!Gi) return; Gi.val.textContent = v; Gi.unit.textContent = u; const a = (-140 + 280 * clamp(frac, 0, 1)) * Math.PI / 180;
    Gi.needle.setAttribute("x2", (Gi.cx + Math.sin(a) * (Gi.r - 8)).toFixed(1)); Gi.needle.setAttribute("y2", (Gi.cy - Math.cos(a) * (Gi.r - 8)).toFixed(1)); }
  function read() {
    const Ps = 29.92 - h / 1000; let Pt = Ps + Q0, Pst = Ps;
    if (mode === "pitot") Pt = Pst;
    if (mode === "pitotdrain") Pt = 29.92 - hBlock / 1000 + Q0;
    if (mode === "static") Pst = 29.92 - hBlock / 1000;
    if (mode === "alt") Pst = Ps - 0.03;
    const qi = Math.max(0, Pt - Pst), ias = V0 * Math.sqrt(qi / Q0), ia = (29.92 - Pst) * 1000, vs = mode === "static" ? 0 : rate;
    setG(G[0], Math.round(ias), "KT", ias / 200); setG(G[1], (Math.round(ia / 10) * 10).toLocaleString(), "FT", (ia % 1000) / 1000); setG(G[2], (vs > 0 ? "+" : "") + Math.round(vs / 50) * 50, "FPM", 0.5 + vs / 4000);
  }
  function setMode(m) { mode = m || "ok"; hBlock = h; S.F.caption("Failure", CASES[mode][0]); S.F.explain(CASES[mode][1] + (mode !== "ok" ? " Now climb or descend with the slider." : "") + " <span class=\"src\">PHAK 8</span>"); S.redraw(); }
  chips(S.F.ctrl, Object.entries(CASES).map(([k, v]) => [k, v[0]]), "ok", setMode, { label: "Failure" });
  slider(S.F.ctrl, { label: "True altitude", min: 2500, max: 6500, step: 10, value: H0, fmt: (v) => `${v.toLocaleString()} ft`, oninput: (v) => { h = v; read(); } });
  loop(S.F, (now, dt) => { const r = ((h - lastH) / Math.max(dt, 1)) * 60000; lastH = h; rate += (clamp(r, -2000, 2000) - rate) * 0.06; if (Math.abs(rate) < 5) rate = 0; read(); }, { always: true });
  setMode("ok");
  return { destroy() { S.F.destroy(); } };
}
