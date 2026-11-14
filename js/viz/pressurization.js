// Pressurization: aircraft altitude vs cabin altitude. An example airplane holds an 8,000 ft cabin until it reaches its
// maximum differential (6.1 psid, the PHAK example), then the cabin climbs with the airplane. The outflow valve closes as
// the differential builds. Rapid or explosive decompression sends the cabin to the aircraft altitude.
// Facts: PHAK 7 (Pressurized Aircraft): standard pressure chart Fig 7-41; 28,000 ft = 4.8 psi + 6.1 psid = 10.9 psi =
// 8,000 ft cabin; cabin about 8,000 ft at maximum cruise altitude; outflow valve regulates the exit of air; once the maximum
// differential is reached, further climb raises cabin altitude; explosive decompression < 0.5 s, faster than the lungs can
// decompress; rapid decompression: the lungs decompress faster than the cabin; the primary danger is hypoxia.
// TUC: PHAK Fig 17-1 (via hypoxia.js). Decompression durations here are illustrative.
import { slider, chips, row } from "./base.js?v=8703609faa";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=8703609faa";
import { anim, COL } from "./dial.js?v=8703609faa";
import { TUC } from "./hypoxia.js?v=8703609faa";
const PS = [[0, 14.7], [2000, 13.7], [4000, 12.7], [6000, 11.8], [8000, 10.9], [10000, 10.1], [12000, 9.4], [14000, 8.6], [16000, 8.0], [18000, 7.3], [20000, 6.8], [22000, 6.2], [24000, 5.7], [26000, 5.2], [28000, 4.8], [30000, 4.4]];
export function psi(a) { for (let i = 1; i < PS.length; i++) if (a <= PS[i][0]) { const [a0, p0] = PS[i - 1], [a1, p1] = PS[i]; return p0 + ((a - a0) / (a1 - a0)) * (p1 - p0); } return 4.4; }
export function altOf(p) { for (let i = 1; i < PS.length; i++) if (p >= PS[i][1]) { const [a0, p0] = PS[i - 1], [a1, p1] = PS[i]; return a0 + ((p0 - p) / (p0 - p1)) * (a1 - a0); } return 30000; }
const MAXD = 6.1, SEL = 8000, TOP = 30000;
export function cabin(a) { const amb = psi(a); const p = Math.max(amb, Math.min(psi(SEL), amb + MAXD)); return { p, alt: altOf(p), d: p - amb }; }
const tucAt = (a) => { let t = null; for (const [h, x] of TUC) if (a >= h) t = [h, x]; return t; };
export function mount(host) {
  let a = 20000, mode = "ok", cab = cabin(a).alt, dur = 0;
  const S = pxScene(host, { cls: "tall press", corners: { tl: "Pressurization (example)", tr: "PHAK 7" } }, draw);
  const sl = slider(row(S.F.ctrl, "Altitude"), { label: "Aircraft altitude", min: 0, max: TOP, step: 500, value: a, fmt: (x) => x.toLocaleString() + " ft", oninput: (x) => { a = x; if (mode === "ok") cab = cabin(a).alt; S.redraw(); A.kick(); } });
  const ch = chips(row(S.F.ctrl, "Cabin"), [["ok", "Pressurized"], ["rapid", "Rapid decompression"], ["expl", "Explosive decompression"]], mode, (k) => { mode = k || "ok"; dur = mode === "expl" ? 0.4 : 3; if (mode === "ok") cab = cabin(a).alt; S.redraw(); A.kick(); }, { label: "Cabin" });
  const A = anim(S.F, (dt) => { if (mode === "ok") return false; if (cab >= a - 1) { cab = a; S.redraw(); return false; }
    cab = Math.min(a, cab + (dt / dur) * Math.max(1500, a - SEL)); S.redraw(); return true; });
  function draw(g, W, H, top) {
    const wide = W >= 600, by = top + 30, bh = H - top - 70, bw = wide ? 54 : 40, x1 = wide ? 70 : 52, x2 = x1 + bw + (wide ? 50 : 30);
    const yA = (v) => by + bh - (v / TOP) * bh;
    for (let v = 0; v <= TOP; v += 10000) { L(g, x1 - 8, yA(v), x1 - 2, yA(v), { stroke: DIM, w: 1 }); T(g, x1 - 12, yA(v) + 4, v ? v / 1000 + "k" : "0", { size: 11, anchor: "end", fill: GRAY }); }
    [[x1, a, "AIRPLANE", INK], [x2, cab, "CABIN", mode === "ok" ? ACC : COL.red]].forEach(([x, v, lab, col]) => {
      R(g, x, by, bw, bh, { stroke: DIM, sw: 1 }); R(g, x, yA(v), bw, by + bh - yA(v), { fill: col, op: 0.35 }); L(g, x, yA(v), x + bw, yA(v), { stroke: col, w: 2 });
      T(g, x + bw / 2, by - 10, lab, { size: 11, anchor: "middle", fill: GRAY }); T(g, x + bw / 2, by + bh + 18, Math.round(v / 100) * 100 >= 0 ? (Math.round(v / 100) * 100).toLocaleString() : "", { size: 12, anchor: "middle", fill: col }); });
    L(g, x1 - 2, yA(SEL), x2 + bw + 4, yA(SEL), { stroke: DIM, w: 1, dash: "3 4" });
    // differential gauge and outflow valve
    const d = mode === "ok" ? cabin(a).d : Math.max(0, psi(cab) - psi(a)), gx = wide ? x2 + bw + 90 : x2 + bw + 34, gw = Math.max(110, Math.min(260, W - gx - 24)), gy = by + 10;
    T(g, gx, gy, "DIFFERENTIAL", { size: 11, fill: GRAY }); R(g, gx, gy + 10, gw, 12, { stroke: DIM, sw: 1 }); R(g, gx, gy + 10, gw * (d / 7), 12, { fill: d >= MAXD - 0.01 ? COL.yellow : ACC });
    L(g, gx + gw * (MAXD / 7), gy + 4, gx + gw * (MAXD / 7), gy + 28, { stroke: COL.red, w: 2 }); T(g, gx, gy + 44, d.toFixed(1) + " psid", { size: 13, fill: INK, weight: 600 }); T(g, gx + gw, gy + 44, "max " + MAXD, { size: 11, anchor: "end", fill: COL.red });
    const open = mode === "ok" ? Math.max(0.1, 1 - (d / MAXD) * 0.9) : 1, vy = gy + 86;
    T(g, gx, vy, "OUTFLOW VALVE", { size: 11, fill: GRAY }); R(g, gx, vy + 10, 60, 28, { stroke: GRAY, sw: 1.2 }); R(g, gx + 2, vy + 12, 56 * open, 24, { fill: DIM });
    T(g, wide ? gx + 70 : gx, wide ? vy + 29 : vy + 56, mode !== "ok" ? "no pressure left" : open > 0.95 ? "wide open" : d >= MAXD - 0.01 ? "at max differential" : "closing", { size: 11, fill: GRAY });
    const ty = vy + (wide ? 70 : 88), t = tucAt(cab);
    T(g, gx, ty, "CABIN PRESSURE", { size: 11, fill: GRAY }); T(g, gx, ty + 18, psi(cab).toFixed(1) + " psi", { size: 13, fill: INK, weight: 600 });
    if (t && mode !== "ok") { T(g, gx, ty + 46, "USEFUL CONSCIOUSNESS", { size: 11, fill: COL.red }); T(g, gx, ty + 64, wide ? t[1] + " at " + (t[0] / 1000) + "k ft" : t[1], { size: 12, fill: INK }); if (!wide) T(g, gx, ty + 80, "at " + (t[0] / 1000) + "k ft", { size: 12, fill: INK }); }
    let cap;
    if (mode === "expl") cap = ["Explosive decompression", "Faster than your lungs can empty, under half a second: noise, fog, flying debris. Oxygen mask on now."];
    else if (mode === "rapid") cap = ["Rapid decompression", "The cabin climbs to the airplane's altitude in seconds. Oxygen mask on first, then descend."];
    else if (a <= SEL) cap = ["Below the cabin setting", "The outflow valve is open, so the cabin climbs with the airplane until the set cabin altitude."];
    else if (cabin(a).d >= MAXD - 0.01) cap = ["Maximum differential", "The structure can't hold more pressure difference, so above this the cabin climbs with you."];
    else cap = ["Cabin held at 8,000 ft", "The outflow valve closes as you climb, holding the cabin while the pressure difference builds."];
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>An example airplane with a 6.1 psid limit and the cabin set to 8,000 ft. Your airplane's POH gives its own limits. Decompression speeds are illustrations.</p>`);
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
