// Pitot-static blockage trainer. Pick a failure, then move the altitude slider and read the three gauges.
// Pressures use ~1 in. Hg per 1,000 ft (PHAK 8) and q = ½ρV²; magnitudes are illustrative of direction and size.
import { frame, chips, slider, svg, loop, ACC, FAINT, FAINT2 } from "./base.js?v=b0dcfd86cb";
import { s, clamp } from "../core/util.js?v=b0dcfd86cb";
const CASES = {
  ok: ["Normal", "All three instruments read correctly."],
  pitot: ["Pitot blocked, drain open", "Ram air can't enter and the trapped air leaks out the drain, so the airspeed indicator drops to zero. Altimeter and VSI still work."],
  pitotdrain: ["Pitot and drain blocked", "Pitot pressure is trapped. The airspeed indicator now acts like an altimeter: it rises in a climb and falls in a descent. A pilot who believes it can stall in a climb."],
  static: ["Static port blocked", "Static pressure is trapped. The altimeter freezes, the VSI sits at zero, and airspeed reads low in a climb and high in a descent."],
  alt: ["Alternate static open", "Static now comes from the cabin, which is at slightly lower pressure. Airspeed and altitude read a little high; the POH has a correction table."],
};
const V0 = 100, H0 = 4500, Q0 = 0.478; // 100 KIAS ≈ 0.478 in. Hg dynamic pressure near sea-level density
export function mount(host) {
  const F = frame(host, { corners: { tl: "Pitot-static system", tr: "PHAK 8" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  // plumbing
  const pipe = (d, id) => s("path", { d, fill: "none", stroke: FAINT2, "stroke-width": 3, id }, g);
  const pitotLine = pipe("M120,300 L330,300 L330,560 L1260,560 L1260,520"); const staticLine = pipe("M120,700 L420,700 L420,620 L1300,620 L1300,520 M700,620 L700,520 M980,620 L980,520");
  s("path", { d: "M60,286 L130,286 L130,314 L60,314", fill: "none", stroke: FAINT2, "stroke-width": 3 }, g); // pitot head
  const drain = s("circle", { cx: 100, cy: 322, r: 6, fill: FAINT2 }, g);
  const pBlock = s("rect", { x: 52, y: 284, width: 14, height: 32, fill: ACC, opacity: 0, filter: "url(#gw)" }, g);
  const dBlock = s("circle", { cx: 100, cy: 322, r: 10, fill: ACC, opacity: 0, filter: "url(#gw)" }, g);
  s("rect", { x: 100, y: 680, width: 22, height: 40, rx: 4, fill: "none", stroke: FAINT2, "stroke-width": 3 }, g);
  const sBlock = s("rect", { x: 96, y: 676, width: 30, height: 48, rx: 6, fill: ACC, opacity: 0, filter: "url(#gw)" }, g);
  const altSrc = s("path", { d: "M420,700 L420,800 L560,800", fill: "none", stroke: ACC, "stroke-width": 3, opacity: 0, filter: "url(#gw)" }, g);
  const T = (x, y, t, a = "start", sz = 20, o = 0.5) => { const e = s("text", { x, y, "text-anchor": a, fill: `rgba(242,241,236,${o})`, "font-size": sz, "font-family": "IBM Plex Mono, monospace", "letter-spacing": 3 }, g); e.textContent = t; return e; };
  T(60, 262, "PITOT TUBE"); T(118, 352, "DRAIN", "start", 16, 0.4); T(60, 760, "STATIC PORT"); const altLab = T(580, 806, "CABIN (ALTERNATE)", "start", 16, 0.0);
  // gauges
  const gauge = (cx, name) => { const gg = s("g", {}, g); s("circle", { cx, cy: 380, r: 120, fill: "none", stroke: FAINT2, "stroke-width": 2 }, gg); T(cx, 528, name, "middle", 18, 0.55);
    const val = s("text", { x: cx, y: 395, "text-anchor": "middle", fill: "#F2F1EC", "font-size": 46, "font-family": "Inter, sans-serif", "font-weight": 800 }, gg); const unit = T(cx, 432, "", "middle", 16, 0.5);
    const needle = s("line", { x1: cx, y1: 380, x2: cx, y2: 280, stroke: ACC, "stroke-width": 4, "stroke-linecap": "round", filter: "url(#gw)" }, gg); return { val, unit, needle, cx }; };
  const asi = gauge(700, "AIRSPEED"), altm = gauge(980, "ALTIMETER"), vsi = gauge(1260, "VERTICAL SPEED");
  const setG = (G, v, u, frac) => { G.val.textContent = v; G.unit.textContent = u; const a = (-140 + 280 * clamp(frac, 0, 1)) * Math.PI / 180; G.needle.setAttribute("x2", G.cx + Math.sin(a) * 100); G.needle.setAttribute("y2", 380 - Math.cos(a) * 100); };
  let mode = "ok", h = H0, hBlock = H0, rate = 0, lastH = H0;
  function read() { // true values: V0 constant TAS-ish, altitude h
    const Ps = 29.92 - h / 1000, q = Q0; let Pt = Ps + q, Pst = Ps;
    if (mode === "pitot") Pt = Pst; // drain bleeds pitot side to static
    if (mode === "pitotdrain") Pt = 29.92 - hBlock / 1000 + Q0;
    if (mode === "static") Pst = 29.92 - hBlock / 1000;
    if (mode === "alt") Pst = Ps - 0.03; // cabin slightly lower (illustrative)
    const qi = Math.max(0, Pt - Pst); const ias = V0 * Math.sqrt(qi / Q0); const ia = (29.92 - Pst) * 1000; const vs = mode === "static" ? 0 : rate;
    setG(asi, Math.round(ias), "KT", ias / 200); setG(altm, Math.round(ia / 10) * 10, "FT", (ia % 1000) / 1000); setG(vsi, (vs > 0 ? "+" : "") + Math.round(vs / 50) * 50, "FPM", 0.5 + vs / 4000); }
  function setMode(m) { mode = m; hBlock = h; pBlock.setAttribute("opacity", m === "pitot" || m === "pitotdrain" ? 1 : 0); dBlock.setAttribute("opacity", m === "pitotdrain" ? 1 : 0); sBlock.setAttribute("opacity", m === "static" || m === "alt" ? 1 : 0); altSrc.setAttribute("opacity", m === "alt" ? 1 : 0); altLab.setAttribute("fill", `rgba(242,241,236,${m === "alt" ? 0.5 : 0})`);
    pitotLine.setAttribute("stroke", m === "pitot" || m === "pitotdrain" ? ACC : FAINT2); staticLine.setAttribute("stroke", m === "static" ? ACC : FAINT2);
    F.caption("Failure", CASES[m][0]); F.explain(CASES[m][1] + (m !== "ok" ? " Now climb or descend with the slider." : "")); read(); }
  chips(F.ctrl, Object.entries(CASES).map(([k, v]) => [k, v[0]]), "ok", setMode, { label: "Failure" });
  slider(F.ctrl, { label: "True altitude", min: 2500, max: 6500, step: 10, value: H0, fmt: (v) => `${v.toLocaleString()} ft`, oninput: (v) => { h = v; } });
  // VSI from altitude change rate (smoothed); airspeed held constant
  loop(F, (now, dt) => { const r = ((h - lastH) / Math.max(dt, 1)) * 60000; lastH = h; rate += (clamp(r, -2000, 2000) - rate) * 0.06; if (Math.abs(rate) < 5) rate = 0; read(); }, { always: true });
  setMode("ok");
  return { destroy() { F.destroy(); } };
}
