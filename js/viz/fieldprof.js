// Takeoff and landing profiles (AFH FAA-H-8083-3C ch 6, 9; ACS PA.IV): a side view, not to scale, of the normal, short-field
// and soft-field takeoff or landing. Numbered points on the path match the numbered steps under the visual; the focused
// technique's path is blue. Speeds are named, never numbered: use your airplane's POH. Static scene.
import { chips, row } from "./base.js?v=d4d14c5a28";
import { pxScene, T, L, C, P, R, ACC, INK, GRAY } from "./kit.js?v=d4d14c5a28";
const STEPS = {
  "to-normal": ["Normal takeoff", "Line up on the centerline, add full power smoothly, check the engine gauges and airspeed alive, and hold right rudder.", "At the POH rotation speed, raise the nose to the liftoff attitude and let the airplane fly off.", "Pitch for V<sub>Y</sub> and hold it, +10/−5 kt on the test, with wind-drift correction.", "Climb straight ahead to a safe altitude, then follow the departure or pattern."],
  "to-short": ["Short-field takeoff", "Use every foot: start at the very beginning of the runway, flaps as the POH says, hold the brakes, full power, then release.", "Rotate at the POH speed. Don't pull the airplane off early.", "Climb at V<sub>X</sub>, +10/−5 kt, until the obstacle is cleared or you're 50 ft up.", "Then lower the nose to V<sub>Y</sub>, +10/−5 kt, and clean up the flaps as the POH says."],
  "to-soft": ["Soft-field takeoff", "Keep moving onto the runway. Flaps as the POH says. Full back-pressure to take weight off the nose wheel as you add power.", "Hold the nose wheel just off the surface and let the airplane lift off at the lowest possible speed.", "Lower the nose and stay in ground effect, a few feet up, while it accelerates.", "At V<sub>X</sub> or V<sub>Y</sub>, as needed, climb out. Don't climb out of ground effect too early."],
  "ld-normal": ["Normal landing", "Be stabilized by 500 ft above the airport: configured, on speed (POH, or no more than 1.3 V<sub>S0</sub>, +10/−5 kt) and on the glidepath.", "Keep the aim point fixed in the windshield; it neither climbs nor slides down.", "Round out 10–20 ft up: raise the nose smoothly as power comes to idle.", "Touch down on the main wheels at a proper pitch attitude, within 400 ft beyond the chosen point, with no drift."],
  "ld-short": ["Short-field landing", "Fly a steeper, stabilized final with full flaps (or as the POH says) at the POH short-field approach speed.", "Clear the obstacle, then keep the aim point fixed. Power controls the descent rate, pitch the speed.", "Little float: power to idle in a short round out.", "Touch down within 200 ft beyond the point, at minimum speed. Brake as needed, flaps up if the POH says, hold the yoke back."],
  "ld-soft": ["Soft-field landing", "A normal stabilized approach with full flaps (or as the POH says).", "Fly low over the surface in ground effect, holding the nose up.", "A little power through the flare lets the airplane touch down at the slowest possible speed.", "Keep the nose wheel off as long as you can, keep it light, and keep moving; stopping can bog the airplane down."],
};
export function mount(host, opts = {}) {
  let ph = opts.phase || "to", tq = opts.tech || "normal";
  const S = pxScene(host, { cls: "fprof", corners: { tl: "Not to scale", tr: "AFH 6, 9" } }, draw);
  chips(row(S.F.ctrl), [["to", "Takeoff"], ["ld", "Landing"]], ph, (v) => { ph = v || ph; S.redraw(); }, { label: "Phase" });
  chips(row(S.F.ctrl), [["normal", "Normal"], ["short", "Short field"], ["soft", "Soft field"]], tq, (v) => { tq = v || tq; S.redraw(); }, { label: "Technique" });
  function plane(g, x, y, ang, col) {   // tiny side view, nose toward +x, rotated by ang (radians, nose-up negative y)
    const c = Math.cos(ang), s = Math.sin(ang), p = (dx, dy) => `${(x + dx * c + dy * s).toFixed(1)},${(y - dx * s + dy * c).toFixed(1)}`;
    P(g, `M${p(-16, -1)} L${p(12, -1)} L${p(15, 1)} L${p(12, 3)} L${p(-14, 3)} Z M${p(-14, -1)} L${p(-18, -8)} L${p(-12, -8)} L${p(-9, -1)} M${p(-3, -2)} L${p(5, -2)}`, { stroke: col, w: 1.6, fill: "#0a0a0a" });
    C(g, ...p(6, 6).split(",").map(Number), 2, { fill: col }); C(g, ...p(-6, 6).split(",").map(Number), 2, { fill: col });
  }
  // geometry in u (0..1 across) and v (0 = ground, 1 = top of the scene); heights are exaggerated
  const GEO = {
    "to-normal": { rw: [0.03, 0.62], path: [[0.05, 0], [0.3, 0], [0.92, 0.55]], n: [[0.06, 0], [0.3, 0], [0.58, 0.25], [0.82, 0.46]], end: [0.92, 0.55, 0.25] },
    "to-short": { rw: [0.03, 0.45], obs: [0.55, 0.35], path: [[0.05, 0], [0.22, 0], [0.55, 0.48], [0.92, 0.7]], n: [[0.06, 0], [0.22, 0], [0.4, 0.26], [0.75, 0.6]], end: [0.92, 0.7, 0.2] },
    "to-soft": { rw: [0.03, 0.62], path: [[0.05, 0], [0.17, 0], [0.2, 0.04], [0.38, 0.04], [0.92, 0.5]], n: [[0.06, 0], [0.18, 0.02], [0.3, 0.04], [0.66, 0.27]], end: [0.92, 0.5, 0.22] },
    "ld-normal": { rw: [0.45, 0.97], aim: 0.58, tol: [400, 0.12], path: [[0.08, 0.72], [0.5, 0.1], [0.58, 0.02], [0.64, 0], [0.8, 0]], n: [[0.14, 0.63], [0.32, 0.37], [0.52, 0.08], [0.66, 0]], end: [0.08, 0.72, -0.08] },
    "ld-short": { rw: [0.46, 0.97], obs: [0.34, 0.26], aim: 0.52, tol: [200, 0.06], path: [[0.1, 1], [0.48, 0.08], [0.53, 0], [0.66, 0]], n: [[0.16, 0.86], [0.42, 0.24], [0.5, 0.05], [0.6, 0]], end: [0.1, 1, -0.12] },
    "ld-soft": { rw: [0.45, 0.97], aim: 0.58, path: [[0.08, 0.72], [0.48, 0.1], [0.56, 0.03], [0.72, 0.02], [0.74, 0], [0.88, 0]], n: [[0.14, 0.63], [0.32, 0.4], [0.62, 0.03], [0.76, 0]], end: [0.08, 0.72, -0.08] },
  };
  function draw(g, W, H, top) {
    const x0 = 14, x1 = W - 14, gy = H - 30, hTop = top + 20, span = x1 - x0, key = `${ph}-${tq}`, st = STEPS[key], G = GEO[key];
    const X = (u) => x0 + u * span, Y = (v) => gy - 8 - v * (gy - 8 - hTop);
    L(g, x0, gy, x1, gy, { stroke: GRAY, w: 1 });
    const [r0, r1] = G.rw.map(X); R(g, r0, gy - 3, r1 - r0, 6, { fill: "#2a2a2e", stroke: "rgba(242,241,236,.5)", sw: 1 });
    if (tq === "soft") for (let x = r0 + 4; x < r1 - 2; x += 7) L(g, x, gy - 3, x + 2, gy - 8, { stroke: "rgba(74,222,128,.55)", w: 1.2 });
    const rl = tq === "soft" ? "soft or grass runway" : tq === "short" ? "short runway" : "runway";
    if (ph === "to") T(g, (r0 + r1) / 2, gy + 18, rl, { size: 11, fill: GRAY, anchor: "middle" }); else T(g, r0 - 8, gy + 18, rl, { size: 11, fill: GRAY, anchor: "end" });
    if (G.obs) { const ox = X(G.obs[0]), oy = Y(G.obs[1]); L(g, ox, gy, ox, oy, { stroke: INK, w: 2 }); P(g, `M${ox - 8},${oy + 16} L${ox},${oy - 2} L${ox + 8},${oy + 16} Z`, { stroke: INK, w: 1.4, fill: "#0a0a0a" }); T(g, ox + (ph === "to" ? 12 : -12), oy + 12, "50 ft", { size: 11, fill: GRAY, anchor: ph === "to" ? "start" : "end" }); }
    if (G.aim != null) { const ax = X(G.aim); C(g, ax, gy, 4, { stroke: INK, sw: 1.6 });
      if (G.tol) { const tw = G.tol[1] * span; R(g, ax, gy + 5, tw, 4, { fill: ACC, op: 0.75 }); T(g, ax, gy + 20, `aim point · ≤${G.tol[0]} ft`, { size: 11, fill: GRAY }); } else T(g, ax, gy + 20, "aim point", { size: 11, fill: GRAY }); }
    P(g, G.path.map(([u, v], i) => `${i ? "L" : "M"}${X(u).toFixed(1)},${Y(v).toFixed(1)}`).join(" "), { stroke: ACC, w: 2.6 });
    plane(g, X(G.end[0]), Y(G.end[1]) - 6, G.end[2], INK);
    G.n.forEach(([u, v], i) => { const x = X(u), y = Y(v) - 20; C(g, x, y, 9, { fill: "#0a0a0a", stroke: INK, sw: 1.4 }); T(g, x, y + 4, String(i + 1), { size: 11, weight: 700, anchor: "middle" }); });
    S.F.caption(`${ph === "to" ? "Takeoff" : "Landing"} · numbered steps below`, st[0]);
    S.F.explain(`<ol class="fp-steps">${st.slice(1).map((t) => `<li>${t}</li>`).join("")}</ol><p class="dim">Speeds, flap settings and procedures come from your airplane's POH; your CFI will show you each one. <span class="src">AFH 6, 9 · FAA-S-ACS-6C PA.IV</span></p>`);
  }
  return { destroy() { S.F.destroy(); } };
}
