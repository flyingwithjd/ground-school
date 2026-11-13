// V-g diagram for the 172S, flaps up. Drag the dot (or use the sliders) through airspeed and load factor and see which
// region you are in: stall, normal, caution (smooth air only), or beyond the structural limit.
// Facts, 172S POH Sec 2 + Sec 5: limit load factors flaps up normal +3.8/-1.52 (2,550 lb), utility +4.4/-1.76 (2,200 lb);
// KCAS: VNE 160, VNO 126, VA 102 at 2,550, 95 at 2,200, 88 at 1,900; stall flaps up, 2,550 lb, aft CG, wings level 53 KCAS.
// Positive stall line n = (V/Vs)^2 with Vs scaled by sqrt(weight/2,550) (PHAK 5: stall speed rises with the square root
// of load factor). The negative stall line is not published for the 172S, so it is drawn as a shape with no number.
import { slider, chips, row } from "./base.js?v=d8e00a0994";
import { pxScene, T, L, P, C, R, hit, INK, GRAY, DIM, ACC, ACCF, r1 } from "./kit.js?v=d8e00a0994";
import { COL } from "./dial.js?v=d8e00a0994";
const VNE = 160, VNO = 126, VA = { 2550: 102, 2200: 95, 1900: 88 }, VAI = { 2550: 105, 2200: 98, 1900: 90 }, VS = 53;
const CAT = { normal: { up: 3.8, dn: -1.52, w: ["2550", "2200", "1900"] }, utility: { up: 4.4, dn: -1.76, w: ["2200", "1900"] } };
const VMAX = 175, NMIN = -2.5, NMAX = 5.6;
// pure: which region is (v, n) in
export function region(v, n, cat = "normal", wt = 2550) {
  const C0 = CAT[cat], vs = VS * Math.sqrt(wt / 2550), sPos = (v / vs) ** 2, sNeg = -((v / (vs * 1.35)) ** 2);
  const negLim = v <= VNO ? C0.dn : C0.dn * (VNE - v) / (VNE - VNO);
  if (v > VNE) return "vne";
  if (n > 0 && n > sPos && sPos < C0.up) return "stall";
  if (n < 0 && n < sNeg && sNeg > C0.dn) return "stall";
  if (n > C0.up || n < negLim) return "over";
  return v > VNO ? "caution" : "normal";
}
const SAY = {
  normal: ["Normal operating range", "Inside the envelope: the wing can make this load and the structure can take it."],
  caution: ["Caution range", "Between VNO and VNE: smooth air only. A gust here can push you past the limit load."],
  stall: ["Stalled", "The wing can't make this much lift at this speed. Below VA, a hard pull stalls before it overstresses."],
  over: ["Beyond the limit load", "Above VA the wing can make more lift than the structure is rated for. Damage is possible."],
  vne: ["Above VNE", "Never exceed. Flutter or structural failure is possible above the red line."],
};
export function mount(host) {
  let cat = "normal", wt = 2550, v = 110, n = 1;
  const S = pxScene(host, { cls: "xtall vg", corners: { tl: "V-g diagram · flaps up", tr: "POH 2 · PHAK 5" } }, draw);
  const r0 = row(S.F.ctrl, "Category"); const catC = chips(r0, [["normal", "Normal"], ["utility", "Utility"]], cat, (k) => { cat = k || "normal"; catC.set(cat); if (!CAT[cat].w.includes(String(wt))) wt = 2200; wC.enable(CAT[cat].w); wC.set(String(wt)); upd(); }, { label: "Category" });
  const r1w = row(S.F.ctrl, "Weight"); const wC = chips(r1w, CAT.normal.w.map((w) => [w, Number(w).toLocaleString("en-US") + " lb"]), String(wt), (k) => { if (k) wt = +k; wC.set(String(wt)); upd(); }, { label: "Weight" });
  const r2 = row(S.F.ctrl, "Fly"); const sv = slider(r2, { label: "Airspeed", min: 30, max: VMAX, value: v, fmt: (x) => x + " KCAS", oninput: (x) => { v = x; upd(false); } });
  const sn = slider(r2, { label: "Load factor", min: -2.4, max: 5, step: 0.1, value: n, fmt: (x) => (x > 0 ? "+" : "") + x.toFixed(1) + " g", oninput: (x) => { n = x; upd(false); } });
  const r3 = row(S.F.ctrl, "Try"); const pre = chips(r3, [["cruise", "Cruise, 1 g"], ["bank", "60° bank"], ["va", "Full pull at VA"], ["fast", "Full pull at VNO"], ["gust", "Gust, yellow arc"]], null, (k) => {
    const lim = CAT[cat].up, P0 = { cruise: [110, 1], bank: [95, 2], va: [VA[wt], lim], fast: [VNO, Math.min(5, lim + 0.8)], gust: [145, lim + 0.4] }[k]; if (!P0) return; [v, n] = P0; sv.set(v, false); sn.set(Math.round(n * 10) / 10, false); upd(); }, { label: "Try", toggle: true });
  function upd(syncS = true) { if (syncS) { sv.set(v, false); sn.set(Math.round(n * 10) / 10, false); } if (!syncS) pre.set(null); S.redraw(); }
  function draw(g, W, H, top) {
    const ph = S.phone, x0 = ph ? 40 : 54, x1 = W - (ph ? 14 : 24), y0 = top + (ph ? 36 : 22), y1 = H - 30, C0 = CAT[cat], vs = VS * Math.sqrt(wt / 2550);
    const X = (s) => x0 + (s / VMAX) * (x1 - x0), Y = (m) => y1 - ((m - NMIN) / (NMAX - NMIN)) * (y1 - y0);
    const vc = vs * Math.sqrt(C0.up), vcn = vs * 1.35 * Math.sqrt(-C0.dn), reg = region(v, n, cat, wt);
    // grid + axes
    for (let m = -2; m <= 5; m++) { L(g, x0, Y(m), x1, Y(m), { stroke: m === 0 ? GRAY : "rgba(242,241,236,.08)", w: m === 0 ? 1.2 : 1 }); T(g, x0 - 6, Y(m) + 4, (m > 0 ? "+" : "") + m, { size: 11, anchor: "end", fill: m === 1 ? INK : DIM }); }
    for (let s = 40; s <= 160; s += 40) T(g, X(s), y1 + 16, String(s), { size: 11, anchor: "middle", fill: DIM });
    T(g, x0, y1 + 16, "KCAS", { size: 11, anchor: "start", fill: GRAY }); T(g, x0 - 6, y0 - 10, "g", { size: 11, anchor: "end", fill: GRAY });
    // envelope polygon
    const pts = []; for (let s = 0; s <= vc; s += 2) pts.push([s, (s / vs) ** 2]); pts.push([vc, C0.up], [VNE, C0.up], [VNE, 0], [VNO, C0.dn], [vcn, C0.dn]);
    for (let s = vcn; s >= 0; s -= 2) pts.push([s, -((s / (vs * 1.35)) ** 2)]);
    const poly = "M" + pts.map(([a, b]) => r1(X(a)) + "," + r1(Y(b))).join(" L") + " Z";
    P(g, poly, { fill: reg === "normal" ? ACCF : "rgba(242,241,236,.03)", stroke: "none" });
    P(g, `M${X(VNO)},${Y(C0.up)} L${X(VNE)},${Y(C0.up)} L${X(VNE)},${Y(0)} L${X(VNO)},${Y(C0.dn)} Z`, { fill: reg === "caution" ? "rgba(217,178,58,.28)" : "rgba(217,178,58,.1)", stroke: "none" });
    const posS = pts.filter(([a, b]) => b > 0 && a <= vc).map(([a, b]) => r1(X(a)) + "," + r1(Y(b))).join(" L");
    P(g, "M" + posS, { stroke: reg === "stall" && n > 0 ? ACC : INK, w: 2 });
    let negS = ""; for (let s = 0; s <= vcn; s += 2) negS += (negS ? " L" : "M") + r1(X(s)) + "," + r1(Y(-((s / (vs * 1.35)) ** 2)));
    P(g, negS, { stroke: reg === "stall" && n < 0 ? ACC : GRAY, w: 1.5, dash: "5 4" });
    const ov = reg === "over"; L(g, X(vc), Y(C0.up), X(VNE), Y(C0.up), { stroke: ov && n > 0 ? ACC : INK, w: 2 });
    P(g, `M${X(vcn)},${Y(C0.dn)} L${X(VNO)},${Y(C0.dn)} L${X(VNE)},${Y(0)}`, { stroke: ov && n < 0 ? ACC : INK, w: 2 });
    L(g, X(VNE), Y(C0.up), X(VNE), Y(0), { stroke: COL.red, w: 3 });
    T(g, X(VNE) - 6, Y(C0.up) - 8, (C0.up > 0 ? "+" : "") + C0.up + " g", { size: 11, anchor: "end", fill: INK });
    T(g, X(VNO) - 6, Y(C0.dn) + 16, C0.dn + " g", { size: 11, anchor: "end", fill: INK });
    T(g, X(vc * 0.55), Y((vc * 0.55 / vs) ** 2) - 10, "stall", { size: 11, anchor: "end", fill: GRAY });
    // speed lines, labels in a row above the plot
    const lines = [["VA", VA[wt], ACC], ["VNO", VNO, COL.yellow], ["VNE", VNE, COL.red]];
    lines.forEach(([k, s, c], i) => { const ly = y0 - 8 - (ph && i === 1 ? 14 : 0); L(g, X(s), ly + 4, X(s), y1, { stroke: c, w: 1, dash: "3 4", op: 0.8 }); T(g, X(s) + (i === 2 ? 2 : 0), ly, k + " " + s, { size: 11, anchor: i === 2 ? "end" : "middle", fill: c }); });
    // the dot
    const dx = X(Math.min(VMAX, Math.max(0, v))), dy = Y(Math.min(NMAX, Math.max(NMIN, n)));
    C(g, dx, dy, 13, { fill: "rgba(59,130,246,.25)" }); const dot = C(g, dx, dy, 7, { fill: ACC, stroke: INK, sw: 2 });
    const grab = C(g, dx, dy, 24, { fill: "transparent" }); grab.style.touchAction = "none"; grab.style.cursor = "grab"; grab.setAttribute("class", "pad");
    hit(g, grab, "Drag the point", () => {});
    const toVN = (e) => { const b = S.el.getBoundingClientRect(), px = ((e.clientX - b.left) / b.width) * W, py = ((e.clientY - b.top) / b.height) * H;
      v = Math.round(Math.min(VMAX, Math.max(30, ((px - x0) / (x1 - x0)) * VMAX))); n = Math.round(Math.min(5, Math.max(-2.4, NMIN + ((y1 - py) / (y1 - y0)) * (NMAX - NMIN))) * 10) / 10; };
    grab.addEventListener("pointerdown", (e) => { e.preventDefault(); const mv = (ev) => { toVN(ev); sv.set(v, false); sn.set(n, false); pre.set(null); S.redraw(); };
      const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
      window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up); });
    const bg = R(g, x0, y0, x1 - x0, y1 - y0, { fill: "transparent" }); g.insertBefore(bg, g.firstChild); bg.addEventListener("click", (e) => { toVN(e); upd(); });
    void dot;
    S.F.caption(SAY[reg][0], SAY[reg][1]);
    S.F.explain(`<p><b>${cat === "normal" ? "Normal" : "Utility"} category, ${wt.toLocaleString("en-US")} lb.</b> Limit load ${C0.up > 0 ? "+" : ""}${C0.up} g / ${C0.dn} g flaps up, +3.0 g flaps down. VA ${VAI[wt]} KIAS at this weight (${VA[wt]} KCAS): it drops as weight drops. VNO 129 KIAS, VNE 163 KIAS.</p>` +
      (cat === "utility" ? `<p>Utility: 2,200 lb max, rear seat empty, baggage empty, aft CG limit 40.5 in. Spins approved. Abrupt control use prohibited above 98 KIAS. Placard: <i>No acrobatic maneuvers approved, except those listed in the POH.</i></p>` :
        `<p>Normal: up to 60° bank, lazy eights, chandelles and stalls (no whip stalls). Abrupt control use prohibited above 105 KIAS. Placard: <i>No acrobatic maneuvers, including spins, approved.</i></p>`) +
      `<p>Speeds on the diagram are calibrated (KCAS). Fly the KIAS numbers in your airplane's POH. Below VA is still not protection against repeated full inputs in one axis, or full inputs in more than one axis at once.</p>`);
  }
  upd();
  return { destroy: () => S.F.destroy() };
}
