// Carburetor ice and carburetor heat. Set outside air temperature and humidity, pick the engine, and watch ice grow in the
// venturi and on the throttle valve as RPM (or manifold pressure) sags; then apply carb heat.
// Facts, PHAK 7 (Carburetor Icing, Carburetor Heat, Fig 7-12): ice most likely below 70 °F with humidity above 80%;
// possible with OAT as high as 100 °F and humidity as low as 50%; venturi temperature can drop 60-70 °F; first sign is an RPM
// drop with a fixed-pitch prop or a manifold pressure drop with a constant-speed prop; carb heat can cost up to 15% power;
// with ice, power drops then rises as it melts; without ice it drops and stays; full heat, not partial; especially dangerous
// at reduced power in a descent. C172S POH 7: a fuel-injected engine's spring-loaded alternate air door opens if the filter
// is blocked, costing about 10% power at full throttle. RPM and MP values shown are examples, not published numbers.
import { chips, slider, row } from "./base.js?v=c8fe6c3cee";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=c8fe6c3cee";
import { dial, anim, toward, COL } from "./dial.js?v=c8fe6c3cee";
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
  function syncRows() { const fi = eng === "fi"; r3.classList.toggle("off", fi); r4.classList.toggle("off", !fi); r3.querySelectorAll("button").forEach((b) => (b.disabled = fi)); r4.querySelectorAll("button").forEach((b) => (b.disabled = !fi)); }
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
    const ph = S.phone, wide = W >= 600, rk = risk(oat, rh), fi = eng === "fi";
    // ---------- the carburetor (or the fuel-injected air box) in cutaway: solid walls, air flowing left to right ----------
    const vx = ph ? 12 : 18, vy = top + 22, vw = wide ? W * 0.58 - 26 : W - 24, vh = wide ? H - vy - 16 : (H - top) * 0.56;
    const cy = vy + vh * (fi ? 0.4 : 0.3), half = Math.min(vh * (fi ? 0.24 : 0.19), 70), thr = fi ? half : half * 0.5, wt = 12, thx = vx + vw * 0.42, wv = vw * 0.27, tvx = vx + vw * 0.8;
    const hw = (x) => { const u = (x - thx) / wv; return Math.abs(u) >= 1 ? half : half - (half - thr) * 0.5 * (1 + Math.cos(Math.PI * u)); };
    const xs = Array.from({ length: 49 }, (_, i) => vx + (vw * i) / 48), pl = (pts) => pts.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + "," + q[1].toFixed(1)).join("");
    const METAL = "#16161a", EDGE = "rgba(242,241,236,.75)";
    for (const sg of [-1, 1]) { const inner = xs.map((x) => [x, cy + sg * hw(x)]), outer = [[vx + vw, cy + sg * (half + wt)], [vx, cy + sg * (half + wt)]];
      P(g, pl([...inner, ...outer]) + "Z", { fill: METAL, stroke: "none" }); P(g, pl(inner), { stroke: EDGE, w: 1.6 }); L(g, vx, cy + sg * (half + wt), vx + vw, cy + sg * (half + wt), { stroke: "rgba(242,241,236,.3)", w: 1 }); }
    // streamlines: they squeeze through the throat; cold air shows cyan where the venturi is when ice is possible
    const cold = !fi && rk > 0;
    for (const f of [-0.62, -0.28, 0.28, 0.62]) { const pts = xs.map((x) => [x, cy + f * hw(x)]);
      P(g, pl(pts.filter(([x]) => x < thx - wv * 0.7 || x > thx + wv * 1.2)), { stroke: GRAY, w: 1.2, dash: "6 6", op: 0.7 });
      P(g, pl(pts.filter(([x]) => x >= thx - wv * 0.75 && x <= thx + wv * 1.25)), { stroke: cold ? COL.cyan : GRAY, w: 1.3, dash: "6 6", op: cold ? 0.85 : 0.7 }); }
    L(g, vx - 2, cy, vx + 26, cy, { stroke: heat && !fi ? "#E0894A" : INK, w: 1.8, arrow: heat && !fi ? undefined : "kahw" }); L(g, vx + vw - 30, cy, vx + vw - 2, cy, { stroke: GRAY, w: 1.6, arrow: "kahg" });
    T(g, vx + 2, cy - 9, fi ? "air" : heat ? "heated air" : `air ${oat} °F`, { size: 11, fill: heat && !fi ? "#E0894A" : INK });
    if (!fi) {
      // float bowl and fuel nozzle under the throat; avgas is blue
      const bx0 = thx - vw * 0.2, bx1 = thx + vw * 0.13, by0 = cy + half + wt, by1 = Math.min(vy + vh - 18, by0 + vh * 0.36), fl = by0 + (by1 - by0) * 0.42;
      R(g, bx0, by0, bx1 - bx0, by1 - by0, { fill: "#0d0d10", stroke: EDGE, sw: 1.4, rx: 6 }); R(g, bx0 + 2, fl, bx1 - bx0 - 4, by1 - fl - 2, { fill: "rgba(59,130,246,.2)", rx: 4 });
      R(g, bx0 + (bx1 - bx0) * 0.12, fl - 9, (bx1 - bx0) * 0.4, 18, { fill: METAL, stroke: EDGE, sw: 1.2, rx: 8 });
      L(g, thx + (bx1 - bx0) * 0.18, by1 - 10, thx + (bx1 - bx0) * 0.18, cy + half + 4, { stroke: EDGE, w: 3 }); P(g, `M${thx + (bx1 - bx0) * 0.18},${cy + half + 4} Q${thx + (bx1 - bx0) * 0.18},${cy + thr * 0.2} ${thx},${cy + 2}`, { stroke: EDGE, w: 3 });
      for (let i = 0; i < 9; i++) { const a = (i * 2.399) % 1, dd = 8 + i * 6; C(g, thx + dd, cy + 2 + (a - 0.5) * dd * 0.55, 1.6, { fill: "rgba(120,170,255,.7)" }); }
      T(g, (bx0 + bx1) / 2, by1 + 15, "float bowl · fuel nozzle", { size: 11, anchor: "middle", fill: GRAY });
      // ice: frosty, bumpy layers on the throat walls and the throttle valve
      if (ice > 0.02) for (const sg of [-1, 1]) { const x0 = thx - wv * 0.55, x1 = thx + wv * 1.05, n = 26, th = ice * thr * 0.45;
        const wallP = Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [x, cy + sg * hw(x)]; });
        const faceP = wallP.map(([x, y], i) => { const env = Math.sin((Math.PI * i) / n) ** 0.7, bump = 0.75 + 0.25 * Math.sin(i * 2.3 + sg) * Math.cos(i * 1.1); return [x, y - sg * th * env * bump]; });
        P(g, pl([...wallP, ...faceP.reverse()]) + "Z", { fill: "rgba(207,230,255,.82)", stroke: "#ffffff", w: 0.8 }); }
      // throttle valve (butterfly): open at cruise, nearly closed at low power
      const ang = (pwr === "cruise" ? 62 : 18) * (Math.PI / 180), tl = hw(tvx) * 0.94, ex = Math.cos(ang) * tl, ey = Math.sin(ang) * tl;
      if (ice > 0.3) L(g, tvx - ex, cy + ey, tvx + ex, cy - ey, { stroke: "rgba(207,230,255,.85)", w: 4 + ice * 7 });
      L(g, tvx - ex, cy + ey, tvx + ex, cy - ey, { stroke: INK, w: 3 }); C(g, tvx, cy, 4, { fill: METAL, stroke: INK, sw: 1.4 });
      T(g, tvx, cy + half + wt + 15, "throttle valve", { size: 11, anchor: "middle", fill: GRAY });
      T(g, thx, cy - half - wt - 10, "venturi: up to 70 °F colder", { size: 11, anchor: "middle", fill: cold ? COL.cyan : GRAY });
    } else {
      // fuel-injected: filter at the intake, spring-loaded alternate air door in the air box
      const fx = vx + vw * 0.2; R(g, fx - 9, cy - half, 18, half * 2, { stroke: filt ? ICE : GRAY, sw: 1.4, fill: filt ? "rgba(207,230,255,.6)" : "#0d0d10", rx: 3 });
      for (let i = 1; i < 8; i++) L(g, fx - 9, cy - half + (half * 2 * i) / 8, fx + 9, cy - half + (half * 2 * i) / 8, { stroke: DIM, w: 1 });
      T(g, fx, cy + half + wt + 15, filt ? "filter iced" : "air filter", { size: 11, anchor: "middle", fill: filt ? ICE : GRAY });
      const dx = vx + vw * 0.46, dy = cy - half - wt / 2, a = ((filt ? -52 : 0) * Math.PI) / 180;
      R(g, dx - 2, dy - wt / 2 - 1, 52, wt + 2, { fill: "#0A0A0B" }); L(g, dx, dy, dx + Math.cos(a) * 48, dy + Math.sin(a) * 48, { stroke: filt ? ACC : INK, w: 3 }); C(g, dx, dy, 3.5, { fill: INK });
      if (filt) P(g, `M${dx + 34},${dy - 30} Q${dx + 30},${dy - 6} ${dx + 52},${cy - half * 0.4}`, { stroke: ACC, w: 2, arrow: true });
      T(g, dx - 6, cy - half - wt - 12, filt ? "alternate air door open" : "alternate air door", { size: 11, anchor: "start", fill: filt ? ACC : GRAY });
      const ux = vx + vw * 0.78; R(g, ux - 20, cy - half * 0.75, 40, half * 1.5, { fill: METAL, stroke: EDGE, sw: 1.2, rx: 6 }); T(g, Math.min(ux, vx + vw - 70), cy + half + wt + 15, "fuel/air control unit", { size: 11, anchor: "middle", fill: GRAY });
    }
    // ---------- likelihood chart (PHAK Fig 7-12) and the engine gauge ----------
    const gx0 = wide ? vx + vw + 46 : vx + 30, gw = wide ? W - gx0 - 18 : W * 0.52 - 40, gy0 = wide ? top + 26 : vy + vh + 24, gh = wide ? (H - top) * 0.36 : Math.min(150, H - gy0 - 34);
    if (!fi) {
      const X = (tt) => gx0 + ((tt - 20) / 90) * gw, Y = (hh) => gy0 + gh - ((hh - 30) / 70) * gh;
      R(g, gx0, gy0, gw, gh, { fill: "#0d0d10", stroke: "rgba(242,241,236,.14)", sw: 1, rx: 4 });
      R(g, X(20), Y(100), X(100) - X(20), Y(50) - Y(100), { fill: rk === 1 ? "rgba(217,178,58,.32)" : "rgba(217,178,58,.13)" });
      R(g, X(20), Y(100), X(70) - X(20), Y(80) - Y(100), { fill: rk === 2 ? "rgba(217,73,62,.55)" : "rgba(217,73,62,.22)" });
      T(g, X(45), Y(90) + 4, "likely", { size: 11, anchor: "middle", fill: INK }); T(g, X(86), Y(62) + 4, "possible", { size: 11, anchor: "middle", fill: INK });
      [20, 70, 100].forEach((tt) => T(g, X(tt), gy0 + gh + 14, tt + "°", { size: 11, anchor: "middle", fill: DIM })); [50, 80, 100].forEach((hh) => T(g, gx0 - 4, Y(hh) + 4, hh + "%", { size: 11, anchor: "end", fill: DIM }));
      C(g, X(Math.min(110, oat)), Y(Math.max(30, rh)), 11, { fill: "rgba(59,130,246,.28)" }); C(g, X(Math.min(110, oat)), Y(Math.max(30, rh)), 6, { fill: ACC, stroke: INK, sw: 1.6 });
    }
    const gr = wide ? Math.min(72, (H - top) * 0.18) : Math.min(62, W * 0.17), gcx = wide ? gx0 + gw / 2 : fi ? W / 2 : W - gr - 22, gcy = wide ? H - gr - 30 : (fi ? gy0 + gr + 6 : gy0 + gh / 2);
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
