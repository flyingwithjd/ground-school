// Ignition and the magneto check. Turn the key (OFF-R-L-BOTH-START), watch which spark plugs fire and what the runup
// tach does at 1,800 RPM, then try the faults. Facts: C172S POH Sec 7 (two magnetos, two plugs per cylinder: right
// magneto fires lower right + upper left plugs, left magneto fires lower left + upper right; rotary switch OFF, R, L,
// BOTH, START; START is spring-loaded back to BOTH) and Sec 4 (check at 1,800 RPM: R, BOTH, L, BOTH; drop no more than
// 150 RPM on either, no more than 50 RPM difference; no drop may mean faulty grounding or advanced timing).
// PHAK 7: no drop is not normal; if the engine quits on one magneto or the drop exceeds limits, don't fly; a broken
// magneto ground wire can let the engine fire with the switch OFF, and only idle cutoff stops it.
// The RPM drops shown for each case are examples, not published values.
import { chips, row } from "./base.js?v=3bad3dc1c8";
import { pxScene, T, L, C, R, hit, INK, GRAY, DIM, ACC } from "./kit.js?v=3bad3dc1c8";
import { dial, anim, toward, COL } from "./dial.js?v=3bad3dc1c8";
const POS = ["OFF", "R", "L", "BOTH", "START"], ANG = { OFF: -84, R: -42, L: 0, BOTH: 42, START: 84 };
const FAULT = {
  normal: { name: "Normal", dR: 75, dL: 100 },
  fouled: { name: "Fouled plug", dR: 75, dL: 225, rough: "L" },
  nodrop: { name: "No drop", dR: 0, dL: 100, hot: "R" },
  dead: { name: "Dead magneto", dR: 75, dL: null },
};
export function verdict(f) { const F = FAULT[f]; if (F.dL == null || F.dR == null) return "dont"; if (F.dR === 0 || F.dL === 0) return "dont";
  return Math.max(F.dR, F.dL) <= 150 && Math.abs(F.dR - F.dL) <= 50 ? "ok" : "dont"; }
export function mount(host) {
  let pos = "BOTH", fault = "normal", rpm = 1800, running = true, crank = 0, log = {};
  const S = pxScene(host, { cls: "xtall mag", corners: { tl: "Ignition · runup at 1,800 RPM", tr: "POH 4, 7 · PHAK 7" } }, draw);
  const rk = row(S.F.ctrl, "Key"); const keyC = chips(rk, POS.map((p) => [p, p]), pos, (p) => setPos(p || pos), { label: "Key" });
  const rf = row(S.F.ctrl, "Case"); chips(rf, Object.entries(FAULT).map(([k, v]) => [k, v.name]), fault, (k) => { fault = k || "normal"; log = {}; running = true; setPos("BOTH"); }, { label: "Case" });
  let tach = null;
  const A = anim(S.F, (dt) => { let m1 = false, m2 = false; if (crank > 0) { crank -= dt; m1 = true; if (crank <= 0) { running = true; pos = "BOTH"; keyC.set(pos); S.redraw(); } }
    [rpm, m2] = toward(rpm, target(), 3.2, dt, 0.5); if (running && rpm < 200 && target() === 0) { running = false; S.redraw(); } tach && tach.set(rpm); return m1 || m2; });
  function firing(p = pos) { const F = FAULT[fault]; const r = p === "R" || p === "BOTH" || (p === "OFF" && F.hot === "R"), l = (p === "L" || p === "BOTH") && F.dL != null; return { r, l }; }
  function target() { if (crank > 0) return 300; if (!running) return 0; const F = FAULT[fault], f = firing();
    if (!f.r && !f.l) return 0; if (f.r && f.l) return 1800; if (f.r) return 1800 - F.dR; return 1800 - F.dL; }
  function setPos(p) { pos = p; keyC.set(p); if (p === "START") { crank = 1.6; } else if (running) { const t = target(); if (p === "R" || p === "L") log[p] = t ? 1800 - t : "quit"; }
    S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const ph = S.phone, F = FAULT[fault], f = firing(); const wide = W >= 600;
    // key (left), tach (right), engine between them on wide screens; key + tach on top and engine below on phones
    const kr = wide ? Math.min(66, (H - top) * 0.18) : Math.min(54, W * 0.14), kx = wide ? 26 + kr + 22 : 14 + kr + 26, ky = wide ? top + (H - top) * 0.42 : top + kr + 24;
    C(g, kx, ky, kr, { fill: "#0A0A0B", stroke: GRAY, sw: 1.4 });
    POS.forEach((p) => { const a = (ANG[p] * Math.PI) / 180, x = kx + Math.sin(a) * (kr + 16), y = ky - Math.cos(a) * (kr + 16);
      T(g, x, y + 4, p, { size: 11, anchor: Math.abs(ANG[p]) > 60 ? (ANG[p] < 0 ? "end" : "start") : "middle", fill: p === pos ? ACC : GRAY, weight: p === pos ? 700 : 500 });
      const hz = C(g, x, y, 16, { fill: "transparent" }); hit(g, hz, "Key " + p, () => setPos(p)); });
    const a = (ANG[pos] * Math.PI) / 180; L(g, kx - Math.sin(a) * kr * 0.55, ky + Math.cos(a) * kr * 0.55, kx + Math.sin(a) * kr * 0.75, ky - Math.cos(a) * kr * 0.75, { stroke: INK, w: 9 });
    C(g, kx, ky, 6, { fill: ACC });
    if (pos === "START") T(g, kx, ky + kr + 20, "spring-loaded", { size: 11, anchor: "middle", fill: GRAY });
    const tr = wide ? Math.min(80, (H - top) * 0.22) : Math.min(64, W * 0.17), tx = W - tr - (wide ? 26 : 16), ty = wide ? ky : top + tr + 14;
    tach = dial(g, tx, ty, tr, { min: 0, max: 3000, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [500, 1000, 1500, 2000, 2500], nums: tr >= 72 ? [[0, "0"], [1000, "10"], [2000, "20"], [3000, "30"]] : [[1000, "10"], [2000, "20"]], title: "RPM ×100", focus: true, fmt: (v) => String(Math.round(v / 5) * 5) });
    tach.set(rpm);
    // engine: 4 opposed cylinders, heads outboard, two plugs in each head (upper + lower)
    const ey = wide ? top + 30 : Math.max(ky + kr + 52, ty + tr + 40), ex0 = wide ? kx + kr + 70 : 30, ex1 = wide ? tx - tr - 60 : W - 30, eh = Math.max(150, (H - ey) - 70);
    const cw = Math.min(150, (ex1 - ex0) / 2 - 26), mid = (ex0 + ex1) / 2;
    R(g, mid - 18, ey + 10, 36, eh - 20, { stroke: DIM, rx: 8 }); T(g, mid, ey + eh + 6, "crankcase", { size: 11, anchor: "middle", fill: DIM });
    const ch = (eh - 20) / 2 - 10;
    for (const side of ["L", "R"]) for (const k of [0, 1]) {
      const x = side === "L" ? mid - 22 - cw : mid + 22, y = ey + 10 + k * (ch + 20);
      R(g, x, y, cw, ch, { stroke: GRAY, rx: 6 }); for (let i = 1; i < 6; i++) L(g, x + (cw * i) / 6, y + 6, x + (cw * i) / 6, y + ch - 6, { stroke: "rgba(242,241,236,.12)", w: 1 });
      // right magneto -> lower right + upper left; left magneto -> lower left + upper right
      const upMag = side === "L" ? "r" : "l", loMag = side === "L" ? "l" : "r", px = side === "L" ? x - 1 : x + cw + 1;
      [[y + ch * 0.28, upMag], [y + ch * 0.72, loMag]].forEach(([py, m]) => { const fouled = F.rough && F.rough.toLowerCase() === m && k === 0 && side === "R";
        const on = running && crank <= 0 && f[m] && !fouled; C(g, px, py, on ? 7 : 5.5, { fill: on ? (m === "r" ? ACC : INK) : "#0A0A0B", stroke: on ? "none" : fouled ? COL.yellow : DIM, sw: 1.4 }); });
    }
    T(g, mid - 22 - cw / 2, ey + 2, "left bank", { size: 11, anchor: "middle", fill: DIM }); T(g, mid + 22 + cw / 2, ey + 2, "right bank", { size: 11, anchor: "middle", fill: DIM });
    // legend
    const ly = ey + eh + 30, lx = mid - 22 - cw; C(g, lx + 6, ly - 4, 6, { fill: ACC }); T(g, lx + 18, ly, "right magneto plugs", { size: 11, fill: f.r && running ? INK : DIM });
    C(g, lx + 6, ly + 16, 6, { fill: INK }); T(g, lx + 18, ly + 20, "left magneto plugs", { size: 11, fill: f.l && running ? INK : DIM });
    if (F.rough && pos === F.rough && running) T(g, mid + 22 + cw, ly, "rough", { size: 12, anchor: "end", fill: COL.yellow, weight: 700 });
    // caption
    const drop = (k) => (log[k] === undefined ? "–" : log[k] === "quit" ? "quits" : log[k] + " RPM");
    let cap;
    if (!running) cap = ["Engine stopped", F.hot && pos === "OFF" ? "" : "Key to START to crank it again."];
    else if (crank > 0) cap = ["Cranking", "Starter engaged. Release and the key springs back to BOTH."];
    else if (pos === "OFF" && F.hot) cap = ["Still running with the key OFF", "The right magneto's ground wire is broken, so OFF can't ground it. Only idle cutoff stops this engine. Treat every prop as live."];
    else if (pos === "BOTH") cap = ["Both magnetos", log.R !== undefined && log.L !== undefined ? `Right drop ${drop("R")}, left drop ${drop("L")}. ${verdict(fault) === "ok" ? "Within limits: OK to fly." : "Out of limits: don't fly."}` : "Turn the key to R, back to BOTH, then L, back to BOTH."];
    else if (pos === "R" || pos === "L") { const d = log[pos]; cap = [pos === "R" ? "Right magneto only" : "Left magneto only", d === "quit" ? "The engine quits on this magneto. Don't fly." : d === 0 ? "No drop. That's not normal: suspect a broken ground wire or timing. Don't fly." : `Drop ${d} RPM (example). Limit 150 RPM, and 50 RPM difference between sides.`]; }
    else cap = ["Key OFF", "Both magnetos grounded. The engine stops."];
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>Each magneto fires one of the two plugs in every cylinder, so either one alone keeps the engine running, with a small RPM drop. The check: R, back to BOTH to clear the plugs, L, back to BOTH. Your airplane's POH gives the limits; in the 172S, 150 RPM max drop and 50 RPM max difference. Magnetos don't need the battery or the master switch.</p>`);
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
