// Carburetor ice and carburetor heat. Set outside air temperature and humidity, pick the engine, and watch ice grow in the
// venturi and on the throttle valve as RPM (or manifold pressure) sags; then apply carb heat.
// Facts, PHAK 7 (Carburetor Icing, Carburetor Heat, Fig 7-12): ice most likely below 70 °F with humidity above 80%;
// possible with OAT as high as 100 °F and humidity as low as 50%; venturi temperature can drop 60-70 °F; first sign is an RPM
// drop with a fixed-pitch prop or a manifold pressure drop with a constant-speed prop; carb heat can cost up to 15% power;
// with ice, power drops then rises as it melts; without ice it drops and stays; full heat, not partial; especially dangerous
// at reduced power in a descent. C172S POH 7: a fuel-injected engine's spring-loaded alternate air door opens if the filter
// is blocked, costing about 10% power at full throttle. RPM and MP values shown are examples, not published numbers.
import { chips, slider, row } from "./base.js?v=e4c491e0c8";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=e4c491e0c8";
import { dial, anim, toward, COL } from "./dial.js?v=e4c491e0c8";
const ICE = "#CFE6FF";
export function risk(oat, rh) { if (oat < 70 && rh > 80) return 2; if (oat <= 100 && rh >= 50) return 1; return 0; }
export function mount(host) {
  let oat = 60, rh = 85, eng = "fp", pwr = "cruise", heat = false, filt = false, ice = 0, pen = 0, melt = 0;
  const S = pxScene(host, { cls: "xtall carbice", corners: { tl: "Carburetor ice", tr: "PHAK 7 · POH 7" } }, draw);
  const r0 = row(S.F.ctrl, "Engine"); chips(r0, [["fp", "Carb, fixed pitch"], ["cs", "Carb, constant speed"], ["fi", "Fuel injected"]], eng, (v) => { eng = v || "fp"; ice = 0; heat = false; filt = false; hc.set("off"); fc.set(null); syncRows(); upd(); }, { label: "Engine" });
  const r1 = row(S.F.ctrl, "Air"); slider(r1, { label: "Outside air", min: 20, max: 110, value: oat, fmt: (v) => v + " °F", oninput: (v) => { oat = v; upd(); } });
  slider(r1, { label: "Humidity", min: 30, max: 100, value: rh, fmt: (v) => v + "%", oninput: (v) => { rh = v; upd(); } });
  const r2 = row(S.F.ctrl, "Power"); chips(r2, [["cruise", "Cruise"], ["desc", "Descent, low power"]], pwr, (v) => { pwr = v || "cruise"; upd(); }, { label: "Power" });
  const r3 = row(S.F.ctrl, "Carb heat"); const hc = chips(r3, [["off", "Off"], ["on", "Full on"]], "off", (v) => { heat = v === "on"; hc.set(heat ? "on" : "off"); upd(); }, { label: "Carb heat" });
  const r4 = row(S.F.ctrl, "Air filter"); const fc = chips(r4, [["blk", "Filter blocked by ice"]], null, (v) => { filt = v === "blk"; upd(); }, { label: "Air filter", toggle: true });
  function syncRows() { r3.style.display = eng === "fi" ? "none" : ""; r4.style.display = eng === "fi" ? "" : "none"; }
  syncRows();
  let gauge = null;
  const base = () => (pwr === "cruise" ? 1 : 0.62);
  function target() { const b = base(); let p = b * (1 - 0.3 * ice) - pen; if (eng === "fi" && filt) p = b * 0.9; return p; }
  let shown = 1;
  const A = anim(S.F, (dt) => { let more = false;
    if (eng !== "fi") { const rk = risk(oat, rh); if (heat) { if (ice > 0) { ice = Math.max(0, ice - 0.07 * dt); melt = ice > 0 ? 1 : 0; more = true; } else melt = 0; }
      else if (rk && ice < 1) { ice = Math.min(1, ice + (rk === 2 ? 0.045 : 0.018) * (pwr === "desc" ? 1.6 : 1) * dt); more = true; } }
    let m; [pen, m] = toward(pen, eng !== "fi" && heat ? 0.08 * base() : 0, 2.2, dt, 1e-4); more = more || m;
    [shown, m] = toward(shown, target(), 2.5, dt, 1e-4); more = more || m; S.redraw(); return more; });
  function upd() { S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const ph = S.phone, wide = W >= 600, rk = risk(oat, rh);
    // venturi box
    const vx = ph ? 12 : 20, vy = top + 14, vw = wide ? W * 0.56 - 30 : W - 24, vh = wide ? Math.min(250, (H - top) * 0.6) : Math.min(200, (H - top) * 0.4);
    const cy = vy + vh / 2, thx = vx + vw * 0.4, tvx = vx + vw * 0.72, half = vh * 0.34, thr = vh * 0.17;
    const wall = (sgn) => `M${vx},${cy + sgn * half} C${vx + vw * 0.22},${cy + sgn * half} ${thx - vw * 0.12},${cy + sgn * thr} ${thx},${cy + sgn * thr} C${thx + vw * 0.12},${cy + sgn * thr} ${tvx - vw * 0.15},${cy + sgn * half} ${tvx},${cy + sgn * half} L${vx + vw},${cy + sgn * half}`;
    P(g, wall(-1), { stroke: INK, w: 2 }); P(g, wall(1), { stroke: INK, w: 2 });
    if (eng !== "fi") {
      // ice on the throat walls and throttle valve
      if (ice > 0.02) { const th = ice * vh * 0.12; for (const sgn of [-1, 1]) P(g, `M${thx - vw * 0.1},${cy + sgn * (thr + 6)} Q${thx},${cy + sgn * (thr - th)} ${thx + vw * 0.12},${cy + sgn * (thr + 8)} Z`, { fill: ICE, stroke: ICE, w: 1, op: 0.9 }); }
      L(g, thx, cy + half + 18, thx, cy + 4, { stroke: ACC, w: 2 }); T(g, thx + 8, cy + half + 16, "fuel", { size: 11, fill: GRAY });
      const ang = (pwr === "cruise" ? 62 : 22) * (Math.PI / 180), tl = half * 0.92; L(g, tvx - Math.cos(ang) * tl, cy + Math.sin(ang) * tl, tvx + Math.cos(ang) * tl, cy - Math.sin(ang) * tl, { stroke: ice > 0.4 ? ICE : INK, w: 3 + (ice > 0.4 ? ice * 4 : 0) });
      T(g, tvx, cy + half + 16, "throttle valve", { size: 11, anchor: "middle", fill: GRAY });
      T(g, thx, vy + 2, "venturi: up to 70 °F colder", { size: 11, anchor: "middle", fill: risk(oat, rh) ? COL.cyan : GRAY });
      if (heat) { L(g, vx + 30, cy + half + 30, vx + 30, cy + half + 6, { stroke: COL.red, w: 2.4 }); P(g, `M${vx + 24},${cy + half + 12} L${vx + 30},${cy + half + 4} L${vx + 36},${cy + half + 12}`, { stroke: COL.red, w: 2.4 }); T(g, vx + 42, cy + half + 26, "heated air", { size: 11, fill: COL.red }); }
      C(g, tvx, cy, 3.5, { fill: INK });
    } else {
      // fuel-injected: filter at the intake, spring-loaded alternate air door in the air box
      const fx = vx + vw * 0.16; R(g, fx - 8, cy - half, 16, half * 2, { stroke: filt ? ICE : GRAY, sw: 1.4, fill: filt ? "rgba(207,230,255,.55)" : "none" });
      for (let i = 1; i < 6; i++) L(g, fx - 8, cy - half + (half * 2 * i) / 6, fx + 8, cy - half + (half * 2 * i) / 6, { stroke: DIM, w: 1 });
      T(g, fx, cy + half + 16, filt ? "filter iced" : "air filter", { size: 11, anchor: "middle", fill: filt ? ICE : GRAY });
      const dx = vx + vw * 0.42, dy = cy - half; const open = filt ? -50 : 0, a = (open * Math.PI) / 180;
      L(g, dx, dy, dx + Math.cos(a) * 46, dy + Math.sin(a) * 46, { stroke: filt ? ACC : INK, w: 3 });
      T(g, dx + 23, dy - (filt ? 44 : 10), filt ? "alternate air door open" : "alternate air door", { size: 11, anchor: "middle", fill: filt ? ACC : GRAY });
      if (filt) L(g, dx + 30, dy - 38, dx + 30, dy + 14, { stroke: ACC, w: 2, arrow: true });
      T(g, tvx, cy + half + 16, "fuel/air control unit", { size: 11, anchor: "middle", fill: GRAY });
    }
    L(g, vx - 2, cy, vx + 30, cy, { stroke: GRAY, w: 1.4, arrow: "kahg" }); if (eng !== "fi") T(g, vx, cy - 10, `air ${oat} °F`, { size: 11, fill: INK }); L(g, vx + vw - 34, cy, vx + vw - 2, cy, { stroke: GRAY, w: 1.4, arrow: "kahg" });
    // likelihood chart (carburetor engines) and gauge
    const gx0 = wide ? vx + vw + 40 : vx + 26, gw = wide ? W - gx0 - 20 : W * 0.5 - 40, gy0 = wide ? top + 24 : vy + vh + 54, gh = wide ? (H - top) * 0.36 : Math.min(150, H - gy0 - 40);
    if (eng !== "fi") {
      const X = (t) => gx0 + ((t - 20) / 90) * gw, Y = (h) => gy0 + gh - ((h - 30) / 70) * gh;
      R(g, X(20), Y(100), X(100) - X(20), Y(50) - Y(100), { fill: rk === 1 ? "rgba(217,178,58,.3)" : "rgba(217,178,58,.12)" });
      R(g, X(20), Y(100), X(70) - X(20), Y(80) - Y(100), { fill: rk === 2 ? "rgba(217,73,62,.5)" : "rgba(217,73,62,.22)" });
      R(g, gx0, gy0, gw, gh, { stroke: DIM, sw: 1 });
      T(g, X(45), Y(90) + 4, "likely", { size: 11, anchor: "middle", fill: INK }); T(g, X(85), Y(65) + 4, "possible", { size: 11, anchor: "middle", fill: INK });
      [20, 70, 100].forEach((t) => T(g, X(t), gy0 + gh + 14, t + "°", { size: 11, anchor: "middle", fill: DIM })); [50, 80, 100].forEach((h) => T(g, gx0 - 4, Y(h) + 4, h + "%", { size: 11, anchor: "end", fill: DIM }));
      C(g, X(Math.min(110, oat)), Y(Math.max(30, rh)), 6, { fill: ACC, stroke: INK, sw: 1.6 });
    }
    const gr = wide ? Math.min(70, (H - top) * 0.17) : Math.min(62, W * 0.17), gcx = wide ? gx0 + gw / 2 : eng === "fi" ? W / 2 : W - gr - 26, gcy = wide ? H - gr - 34 : (eng === "fi" ? gy0 + gr : gy0 + gh / 2);
    if (eng === "cs") gauge = dial(g, gcx, gcy, gr, { min: 10, max: 35, ticks: [10, 15, 20, 25, 30, 35], nums: [[15, "15"], [25, "25"]], title: "MAN PRESS", sub: "in. Hg", focus: true, value: 10 + shown * 14 });
    else gauge = dial(g, gcx, gcy, gr, { min: 0, max: 3000, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [500, 1000, 1500, 2000, 2500], nums: [[1000, "10"], [2000, "20"]], title: "RPM ×100", focus: true, value: 2400 * shown });
    let cap;
    if (eng === "fi") cap = filt ? ["Alternate air", "The filter is blocked, so engine suction opened the alternate air door. Expect about 10% less power at full throttle."] : ["Fuel injected", "No venturi, so no carburetor ice, but impact ice can still block the air filter."];
    else if (heat && melt) cap = ["Carb heat on, ice melting", (eng === "cs" ? "Manifold pressure" : "RPM") + " dropped, and now rises as the ice melts. Keep full heat on until it's gone."];
    else if (heat && ice <= 0) cap = ["Carb heat on, no ice", "Power dropped and stays down: no ice. Carb heat costs up to 15% power, so don't use it for takeoff."];
    else if (ice > 0.05) cap = ["Ice building", (eng === "cs" ? "Manifold pressure drops; RPM stays the same. Apply full carb heat." : "RPM drops, maybe with roughness. Apply full carb heat.") + (pwr === "desc" ? " Low power in a descent is the most dangerous time." : "")];
    else cap = [rk === 2 ? "Icing likely" : rk ? "Icing possible" : "Icing unlikely", rk ? "Worst below 70 °F and above 80% humidity; possible up to 100 °F and down to 50%." : "Outside the chart. Still watch for symptoms."];
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>Evaporating fuel and expanding air cool the venturi, so ice can form on a warm, humid day. Use full carb heat, never partial, and apply it before you reduce power for a descent. Your airplane's POH says when to use it.</p>`);
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
