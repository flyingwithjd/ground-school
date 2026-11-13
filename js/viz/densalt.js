// Density altitude from field elevation, altimeter setting and temperature using the standard atmosphere
// (pressure altitude ≈ elevation + (29.92 − setting) × 1,000 ft, PHAK 4/11). No rule-of-thumb shortcuts.
import { frame, slider, readout, svg, ACC, FAINT, FAINT2 } from "./base.js?v=0080002776";
import { s } from "../core/util.js?v=0080002776";
import { T } from "./shapes.js?v=0080002776";
const K = 6.8755856e-6;
export function compute(elev, alt, tc) { const pa = elev + (29.92 - alt) * 1000, isa = 15 - 1.98 * (pa / 1000);
  const delta = Math.pow(1 - K * pa, 5.2558797), theta = (tc + 273.15) / 288.15, sigma = delta / theta, da = (1 - Math.pow(sigma, 0.2349690)) / K; return { pa, isa, da, sigma }; }
export function mount(host) {
  const F = frame(host, { cls: "capin", corners: { tl: "Density altitude · standard atmosphere", tr: "PHAK 4, 11" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  const Y0 = 800, Y1 = 80, A1 = 14000, Y = (a) => Y0 - (Math.max(-2000, Math.min(A1, a)) / A1) * (Y0 - Y1);
  s("line", { x1: 200, y1: Y(0), x2: 1500, y2: Y(0), stroke: FAINT2, "stroke-width": 1.5 }, g); T(g, 200, Y(0) + 30, "sea level", { size: 14, op: 0.45 });
  for (let a = 2000; a <= 14000; a += 2000) { s("line", { x1: 200, y1: Y(a), x2: 1500, y2: Y(a), stroke: FAINT, "stroke-width": 1 }, g); T(g, 180, Y(a) + 5, a.toLocaleString(), { anchor: "end", size: 14, op: 0.45 }); }
  const bars = ["field elevation", "pressure altitude", "density altitude"].map((n, i) => { const x = 420 + i * 380; return { r: s("rect", { x: x - 70, width: 140, fill: "none", stroke: i === 2 ? ACC : FAINT2, "stroke-width": i === 2 ? 3 : 2, ...(i === 2 ? { filter: "url(#gw)" } : {}) }, g), v: T(g, x, 0, "", { anchor: "middle", size: 22, op: i === 2 ? 1 : 0.75, fill: i === 2 ? ACC : "#F2F1EC" }), n: T(g, x, Y0 + 60, n, { anchor: "middle", size: 15, op: 0.55 }) }; });
  const st = { elev: 5000, alt: 30.1, t: 30 };
  const set = readout(F.ctrl, [["pa", "pressure altitude"], ["isa", "standard temp there"], ["da", "density altitude"], ["s", "air density vs sea level"]]);
  function upd() { const r = compute(st.elev, st.alt, st.t); const vals = [st.elev, r.pa, r.da];
    bars.forEach((b, i) => { const v = vals[i], top = Y(Math.max(0, v)), base = Y(0); b.r.setAttribute("y", Math.min(top, base)); b.r.setAttribute("height", Math.abs(base - top) || 1); b.v.setAttribute("y", Math.min(top, base) - 16); b.v.textContent = `${Math.round(v / 10) * 10 >= 0 ? "" : ""}${(Math.round(v / 10) * 10).toLocaleString()} ft`; });
    set("pa", `${Math.round(r.pa).toLocaleString()} ft`); set("isa", `${r.isa.toFixed(1)} °C`); set("da", `${(Math.round(r.da / 10) * 10).toLocaleString()} ft`); set("s", `${Math.round(r.sigma * 100)}%`);
    const hot = st.t - r.isa; F.caption(`${st.t} °C · ${hot >= 0 ? "+" : ""}${hot.toFixed(0)} °C vs standard`, `Performs like ${(Math.round(r.da / 100) * 100).toLocaleString()} ft`);
    F.explain(`Pressure altitude corrects the field elevation for nonstandard pressure. Density altitude then corrects pressure altitude for nonstandard temperature. Higher density altitude means thinner air: less power, less thrust from the propeller and less lift at a given indicated airspeed, so longer takeoff rolls and weaker climbs. <span class="src">PHAK 4, 11</span> The POH tables already account for this: enter them with <strong>pressure altitude</strong> and <strong>temperature</strong>.`); }
  slider(F.ctrl, { label: "Field elevation", min: 0, max: 9000, step: 50, value: st.elev, fmt: (v) => `${v.toLocaleString()} ft`, oninput: (v) => { st.elev = v; upd(); } });
  slider(F.ctrl, { label: "Altimeter setting", min: 28.8, max: 31, step: 0.01, value: st.alt, fmt: (v) => `${v.toFixed(2)} inHg`, oninput: (v) => { st.alt = v; upd(); } });
  slider(F.ctrl, { label: "Temperature", min: -20, max: 45, step: 1, value: st.t, fmt: (v) => `${v} °C`, oninput: (v) => { st.t = v; upd(); } });
  upd();
  return { destroy() { F.destroy(); } };
}
