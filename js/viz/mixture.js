// Mixture and leaning. Pick an altitude, slide the mixture from full rich toward idle cutoff and watch EGT and RPM
// respond: EGT climbs to a peak and then falls; RPM peaks slightly rich of peak EGT; far too lean and the engine quits.
// Round-dial 172S: tach plus an EGT gauge (no numbers, a reference pointer). G1000: an EGT bar for each cylinder and the
// first cylinder to peak, with its difference from peak.
// Facts: PHAK 7 (Mixture Control): air density falls with altitude while fuel flow does not, so the mixture gets richer;
// too rich = rough running, lost power, fouled spark plugs; too lean = roughness, power loss, overheating, detonation;
// lean by EGT or, with a fixed-pitch prop and no EGT, by RPM (lean until RPM peaks, then enrich slightly).
// C172S POH 4 (Leaning Using EGT table): recommended lean 50 °F rich of peak EGT; best economy peak EGT. Standard-atmosphere density ratios.
// Curve shapes, RPM values and the per-cylinder spread are illustrative, not published numbers.
import { chips, slider, row } from "./base.js?v=8703609faa";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=8703609faa";
import { dial, eisCell, COL } from "./dial.js?v=8703609faa";
const SIG = { 0: 1, 5000: 0.862, 10000: 0.738 }, QP = 0.68, OFF = [0.03, -0.03, 0.05, 0.01];
// d: fraction rich (+) or lean (-) of peak EGT for mixture m (0-100) at altitude a
export const dOf = (m, a) => (m / 100 / SIG[a]) / QP - 1;
export const mFor = (d, a) => Math.max(0, Math.min(100, Math.round(100 * SIG[a] * QP * (1 + d))));
export const dEgt = (d) => (d >= 0 ? -250 * d : -2500 * d * d); // °F from peak
const QUIT = -0.32;
export function power(d) { if (d < QUIT) return 0; return d > 0.22 ? 1 - 0.15 * (d - 0.22) ** 2 : 1 - 0.8 * (d - 0.22) ** 2; }
export function zone(d, a, m) {
  if (d < QUIT) return "quit"; if (d < -0.2) return "toolean"; if (d < -0.1) return "lop"; if (d <= 0.06) return "peak";
  if (Math.abs(dEgt(d) + 50) <= 15) return "rec"; if (d <= 0.3) return "rop"; if (a === 0 && m >= 95) return "fullrich"; if (d <= 0.6) return "rich"; return "toorich";
}
const SAY = {
  toorich: ["Too rich", "Extra fuel at altitude: less power, rough running and fouled spark plugs. Lean it."],
  fullrich: ["Full rich", "Normal near sea level. As you climb, the same fuel meets thinner air and it gets rich."],
  rich: ["Rich", "Leaning from here raises EGT and RPM."],
  rop: ["Rich of peak", "Leaning raises EGT toward its peak. RPM peaks a little rich of peak EGT."],
  rec: ["Recommended lean", "About 50 °F rich of peak EGT: the 172S POH's recommended lean setting."],
  peak: ["Peak EGT", "Best economy per the 172S POH. Lean any further and power starts to fall."],
  lop: ["Lean of peak", "EGT falls, power drops and roughness starts. Enrich back to the rich side."],
  toolean: ["Too lean", "Rough running and lost power; too lean at high power risks detonation. Enrich."],
  quit: ["Engine quit", "Far too lean, like the mixture at idle cutoff. Enrich and it runs again."],
};
export function mount(host) {
  let panel = "round", alt = 5000, m = 100, peaked = false;
  const S = pxScene(host, { cls: "xtall mixture", corners: { tl: "Mixture · leaning", tr: "PHAK 7 · POH 4" } }, draw);
  const r0 = row(S.F.ctrl, "Panel"); chips(r0, [["round", "Round dials"], ["g1000", "G1000"]], panel, (v) => { panel = v || "round"; S.redraw(); }, { label: "Panel" });
  const r1 = row(S.F.ctrl, "Altitude"); chips(r1, [["0", "Sea level"], ["5000", "5,000 ft"], ["10000", "10,000 ft"]], String(alt), (v) => { alt = +(v || 0); peaked = false; pre.set(null); S.redraw(); }, { label: "Altitude" });
  const r2 = row(S.F.ctrl, "Mixture"); const sm = slider(r2, { label: "Mixture", min: 0, max: 100, value: m, fmt: (v) => (v >= 100 ? "Full rich" : v <= 0 ? "Cutoff" : v + "%"), oninput: (v) => { m = v; pre.set(null); S.redraw(); } });
  const r3 = row(S.F.ctrl, "Try"); const pre = chips(r3, [["rich", "Full rich"], ["peak", "Lean to peak"], ["rec", "Then enrich 50 °F"], ["lean", "Too lean"]], null, (k) => {
    if (!k) return; m = k === "rich" ? 100 : mFor({ peak: 0, rec: 0.2, lean: -0.26 }[k], alt); if (k === "rec") peaked = true; sm.set(m, false); S.redraw(); }, { label: "Try", toggle: true });
  function draw(g, W, H, top) {
    const wide = W >= 600, d = dOf(m, alt), z = zone(d, alt, m), pw = power(d); if (d + OFF[1] < 0) peaked = true; if (m >= 95) peaked = false;
    const base = 2450 - alt * 0.015, rpm = pw ? base - (1 - pw) * 900 : 0, egtV = (x) => 0.85 + dEgt(x) / 600;
    // chart: EGT (yellow) and RPM (blue) against the mixture setting, full rich at left, idle cutoff at right
    const cx0 = wide ? 50 : 44, cx1 = wide ? W * 0.6 : W - 18, cy0 = top + 26, cy1 = wide ? H - 34 : top + (H - top) * 0.5;
    const mlo = Math.max(0, mFor(QUIT, alt) - 12), X = (mm) => cx0 + ((100 - Math.max(mm, mlo)) / (100 - mlo)) * (cx1 - cx0), YE = (e) => cy0 + 14 + (-e / 320) * (cy1 - cy0 - 28), YR = (r) => cy1 - 10 - ((r - (base - 700)) / 760) * (cy1 - cy0 - 34);
    R(g, cx0, cy0, cx1 - cx0, cy1 - cy0, { fill: "#0d0d10", stroke: "rgba(242,241,236,.14)", sw: 1, rx: 6 });
    for (let k = 1; k < 4; k++) L(g, cx0 + 1, cy0 + ((cy1 - cy0) * k) / 4, cx1 - 1, cy0 + ((cy1 - cy0) * k) / 4, { stroke: "rgba(242,241,236,.06)", w: 1 });
    const mq = mFor(QUIT, alt); R(g, X(mq), cy0 + 1, cx1 - X(mq) - 1, cy1 - cy0 - 2, { fill: "rgba(242,241,236,.045)" });
    if (cx1 - X(mq) > 34) T(g, (X(mq) + cx1) / 2, cy1 - 12, "quits", { size: 11, anchor: "middle", fill: z === "quit" ? COL.red : DIM });
    let pe = "", pr = "", xl = cx0; for (let mm = 100; mm >= 0; mm -= 1) { const dd = dOf(mm, alt); if (dd < QUIT) break; xl = X(mm); const e = Math.max(-320, dEgt(dd)); pe += (pe ? "L" : "M") + X(mm).toFixed(1) + "," + YE(e).toFixed(1);
      pr += (pr ? "L" : "M") + X(mm).toFixed(1) + "," + YR(base - (1 - power(dd)) * 900).toFixed(1); }
    P(g, pe + `L${xl.toFixed(1)},${cy1 - 1}L${cx0},${cy1 - 1}Z`, { fill: "rgba(217,178,58,.07)", stroke: "none" });
    P(g, pe, { stroke: COL.yellow, w: 2.2 }); P(g, pr, { stroke: ACC, w: 2.2 });
    const mp = mFor(0, alt), mr = mFor(0.2, alt);
    L(g, X(mp), cy0, X(mp), cy1, { stroke: z === "peak" ? INK : DIM, w: 1, dash: "3 4" }); L(g, X(mr), cy0, X(mr), cy1, { stroke: z === "rec" ? INK : DIM, w: 1, dash: "3 4" });
    T(g, X(mp) + 4, cy0 - 8, "peak EGT", { size: 11, fill: z === "peak" ? INK : GRAY }); T(g, X(mr) - 4, cy0 - 8, "50 °F rich", { size: 11, anchor: "end", fill: z === "rec" ? INK : GRAY });
    T(g, cx0, cy1 + 16, "◂ rich", { size: 11, fill: DIM }); T(g, cx1, cy1 + 16, "lean ▸", { size: 11, anchor: "end", fill: DIM });
    const d0 = dOf(100, alt); T(g, cx0 + 8, YE(dEgt(d0)) - 9, "EGT", { size: 11, fill: COL.yellow, weight: 600 }); T(g, cx0 + 8, YR(base - (1 - power(d0)) * 900) + 17, "RPM", { size: 11, fill: ACC, weight: 600 });
    // where you are now: a cursor line and two glowing points
    L(g, X(m), cy0 + 2, X(m), cy1 - 2, { stroke: pw ? "rgba(242,241,236,.35)" : COL.red, w: pw ? 1.2 : 2 });
    if (pw) { C(g, X(m), YE(Math.max(-320, dEgt(d))), 10, { fill: "rgba(217,178,58,.22)" }); C(g, X(m), YE(Math.max(-320, dEgt(d))), 5.5, { fill: COL.yellow, stroke: INK, sw: 1.4 });
      C(g, X(m), YR(rpm), 10, { fill: "rgba(59,130,246,.25)" }); C(g, X(m), YR(rpm), 5.5, { fill: ACC, stroke: INK, sw: 1.4 }); }
    // instruments
    const ix0 = wide ? W * 0.6 + 24 : 16, ix1 = W - 16, iy0 = wide ? top + 4 : cy1 + 34, iy1 = H - 14, iw = ix1 - ix0, ih = iy1 - iy0;
    // the red mixture knob: pushed in = full rich, pulled out = lean (idle cutoff all the way out)
    const knob = (kx, ky, len) => { const out = (100 - m) / 100 * len; R(g, kx, ky - 9, len + 14, 18, { fill: "#0d0d10", stroke: "rgba(242,241,236,.14)", sw: 1, rx: 4 });
      R(g, kx + 4, ky - 2.5, out + 6, 5, { fill: "#8c8c90" }); C(g, kx + out + 14, ky, 11, { fill: COL.red, stroke: "#f2a39c", sw: 1 }); for (let j = -1; j <= 1; j++) L(g, kx + out + 9, ky + j * 4.5, kx + out + 19, ky + j * 4.5, { stroke: "rgba(0,0,0,.35)", w: 1.2 });
      T(g, kx, ky + 26, "MIXTURE", { size: 11, fill: GRAY }); T(g, kx + len + 14, ky + 26, m >= 100 ? "in: full rich" : m <= 0 ? "out: cutoff" : "pulled " + (100 - m) + "%", { size: 11, anchor: "end", fill: INK }); };
    if (panel === "round") {
      const kH = wide ? 58 : 0, r = Math.min(wide ? (ih - kH) * 0.22 : iw * 0.2, wide ? iw * 0.4 : ih * 0.42, 70), ax = wide ? ix0 + iw / 2 : ix0 + iw * 0.27, ay = wide ? iy0 + r + 8 : iy0 + ih / 2, bx = wide ? ax : ix0 + iw * 0.73, by = wide ? iy0 + (ih - kH) - r - 4 : ay;
      dial(g, ax, ay, r, { min: 0, max: 3500, arcs: [[2100, 2500 + alt / 50, "green"]], reds: [2700], ticks: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500], nums: [[1000, "10"], [2000, "20"], [3000, "30"]], title: "RPM ×100", focus: true, value: rpm, fmt: (v) => String(Math.round(v / 10) * 10) });
      const eg = dial(g, bx, by, r, { min: 0, max: 1, ticks: [0.25, 0.5, 0.75], title: "EGT", focus: true, value: pw ? egtV(d) : 0.15 });
      const a = eg.ang(0.85) * Math.PI / 180; L(g, bx + Math.sin(a) * (r - 18), by - Math.cos(a) * (r - 18), bx + Math.sin(a) * (r - 2), by - Math.cos(a) * (r - 2), { stroke: COL.yellow, w: 3 });
      if (wide) knob(ix0 + 6, iy1 - 30, iw - 30);
    } else {
      // a G1000 engine strip: dark screen in a bezel, RPM cell, then a bar per cylinder with the first to peak in cyan
      const sw2 = Math.min(iw, 320), sx = ix0, sy = iy0, sh = (wide ? ih - 62 : ih);
      R(g, sx - 6, sy - 2, sw2 + 12, sh + 4, { fill: "#1b1b1f", stroke: "rgba(242,241,236,.18)", sw: 1, rx: 10 }); R(g, sx, sy + 4, sw2, sh - 8, { fill: "#050506", rx: 4 });
      const ix = sx + 12, iwx = sw2 - 24; T(g, sx + sw2 / 2, sy + 22, "ENGINE", { size: 11, anchor: "middle", fill: COL.cyan, weight: 600 });
      eisCell(g, ix, sy + 46, iwx, { label: "RPM", min: 0, max: 3000, bands: [[2100, 2500 + alt / 50, "green"], [2700, 3000, "red"]], value: rpm, fmt: (v) => String(Math.round(v / 10) * 10), focus: true });
      const ds = OFF.map((o) => d + o), first = 1, past = (peaked = peaked || ds[first] < 0) && m < 95, bw = Math.min(12, iwx / 14), gap = (iwx - 48 - 4 * bw) / 3, bx0 = ix + 24, bTop = sy + 96, bBot = sy + sh - 34;
      T(g, ix, sy + 86, "EGT °F", { size: 11, fill: GRAY });
      ds.forEach((dd, i) => { const v = pw ? Math.max(0.1, Math.min(1, egtV(dd))) : 0.1, x = bx0 + i * (bw + gap), hh = (bBot - bTop) * v, hot = i === first;
        R(g, x, bTop, bw, bBot - bTop, { stroke: "rgba(242,241,236,.12)", sw: 1, rx: 2 }); R(g, x + 2, bBot - hh, bw - 4, hh, { fill: hot && past ? COL.cyan : "rgba(242,241,236,.34)", rx: 1 }); L(g, x - 3, bBot - hh, x + bw + 3, bBot - hh, { stroke: hot && past ? COL.cyan : INK, w: 2 }); T(g, x + bw / 2, bBot + 16, String(i + 1), { size: 11, anchor: "middle", fill: hot && past ? COL.cyan : GRAY }); });
      T(g, ix + iwx, sy + 86, pw && past ? `ΔPEAK ${Math.round(dEgt(ds[first]))} °F` : pw ? "peak not reached" : "", { size: 12, anchor: "end", fill: past ? COL.cyan : GRAY, weight: 600 });
      if (wide) knob(ix0 + 6, iy1 - 30, iw - 30);
    }
    S.F.caption(SAY[z][0], SAY[z][1]);
  }
  S.F.explain(`<p>Slide the mixture lean and watch EGT rise to a peak. No EGT gauge and a fixed-pitch prop? Lean until RPM peaks, then enrich slightly. The G1000 shows every cylinder; the first one to peak is the reference. Your airplane's POH gives the leaning procedure.</p>`);
  return { destroy: () => S.F.destroy() };
}
