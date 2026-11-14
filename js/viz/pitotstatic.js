// Pitot-static blockage trainer. Pick a failure, then fly a steady climb or descent and watch which gauges go wrong.
// Each gauge shows what it SHOULD read under it, and turns blue (with an ✗) when it disagrees with the truth.
// Pressures use ~1 in. Hg per 1,000 ft (PHAK 8) and q = ½ρV²; magnitudes are illustrative of direction and size.
import { chips, row, loop } from "./base.js?v=0134b87946";
import { clamp, h as el } from "../core/util.js?v=0134b87946";
import { pxScene, T, L, P, R, C, ACC, INK, GRAY, tw } from "./kit.js?v=0134b87946";
const CASES = {
  ok: ["Normal", "All three instruments read correctly. Pick a failure to see what changes."],
  pitot: ["Pitot blocked, drain open", "Ram air can't enter and the air in the line leaks out the drain, so the airspeed indicator drops to zero. The altimeter and VSI still work because they use only static pressure."],
  pitotdrain: ["Pitot and drain blocked", "Pitot pressure is trapped. The airspeed indicator now acts like an altimeter: it reads higher in a climb and lower in a descent. Trusting it in a climb can lead to a stall."],
  static: ["Static port blocked", "Static pressure is trapped. The altimeter freezes, the VSI sits at zero, and the airspeed indicator reads lower than actual in a climb and higher than actual in a descent."],
  alt: ["Alternate static open", "Static pressure now comes from the cabin, which is slightly lower than outside. The altimeter and airspeed read a little high; your airplane's POH has a correction table."],
};
const FLY = [[-500, "Descend"], [0, "Level"], [500, "Climb"]];
const V0 = 100, H0 = 4500, Q0 = 0.478, HMIN = 2500, HMAX = 6500; // 100 KIAS ≈ 0.478 in. Hg dynamic pressure near sea-level density
const SIM = 4;      // simulated seconds per real second: a 500 fpm climb gains about 33 ft each real second
const TAU = 1.6;    // VSI needle lag, real seconds (a real VSI lags several seconds)
export function mount(host) {
  let mode = "ok", hh = H0, hBlock = H0, cmd = 0, vsi = 0, G = [], last = { a: null, b: null, c: null }, nowHtml = "";
  const S = pxScene(host, { cls: "tall", corners: { tl: "Pitot-static system", tr: "PHAK 8" } }, draw);
  function draw(g, W, H, top) {
    const ph = W < 520, n = 3, gw = (W - 24) / n, lab = ph ? 15 : 17, r = Math.max(30, Math.min(gw / 2 - 12, (H - top) * 0.2, 70)), gy = top + lab * 2 + 10 + r;
    const names = ["AIRSPEED", "ALTIMETER", "VSI"];
    G = names.map((nm, i) => { const cx = 12 + gw * (i + 0.5);
      const name = T(g, cx, top + lab * 0.8, nm, { anchor: "middle", size: ph ? 11 : 12, fill: GRAY, weight: 600 });
      const norm = T(g, cx, top + lab * 1.9, "", { anchor: "middle", size: 11, fill: GRAY });
      const ring = C(g, cx, gy, r, { stroke: GRAY, sw: 1.5 });
      const needle = L(g, cx, gy, cx, gy - r + 8, { stroke: INK, w: 3 });
      C(g, cx, gy, 4, { fill: INK });
      const val = T(g, cx, gy + r * 0.48, "", { anchor: "middle", size: ph ? 16 : 22, fill: INK, mono: false, weight: 800 });
      const unit = T(g, cx, gy + r * 0.48 + (ph ? 14 : 17), "", { anchor: "middle", size: 11, fill: GRAY });
      return { cx, cy: gy, r, nm, name, norm, ring, needle, val, unit, gw }; });
    // plumbing: pipes run up into the bottom of each gauge, so no line crosses a label
    const pitBlocked = mode === "pitot" || mode === "pitotdrain", stBlocked = mode === "static", altSt = mode === "alt";
    const gb = gy + r + 2, yP = gb + Math.max(26, (H - gb) * 0.28), yS = H - 50, xL = 24, x0 = G[0].cx, x1 = G[1].cx, x2 = G[2].cx, PL = Math.max(22, Math.min(40, x0 - 10 - xL - 6));
    P(g, `M${xL + PL},${yP} L${x0 - 10},${yP} L${x0 - 10},${gb - 1}`, { stroke: pitBlocked ? ACC : GRAY, w: 2.4 });
    P(g, `M${xL + 14},${yS} L${x2},${yS} L${x2},${gb} M${x0 + 10},${yS} L${x0 + 10},${gb - 1} M${x1},${yS} L${x1},${gb}`, { stroke: stBlocked || altSt ? ACC : GRAY, w: 2.4 });
    // pitot head, drain and labels (labels sit left of the airspeed pipes)
    P(g, `M${xL},${yP - 8} L${xL + PL},${yP - 8} L${xL + PL},${yP + 8} L${xL},${yP + 8}`, { stroke: pitBlocked ? ACC : INK, w: 2 });
    if (pitBlocked) R(g, xL - 4, yP - 10, 8, 20, { fill: ACC });
    C(g, xL + PL * 0.55, yP + 14, mode === "pitotdrain" ? 5 : 3, { fill: mode === "pitotdrain" ? ACC : GRAY });
    // labels stay left of the first vertical pipe; on a narrow screen they shorten instead of crossing it
    const room = x0 - 10 - xL - 6, fit = (a, b) => (tw(a, 11) <= room ? a : b);
    T(g, xL, yP - 18, pitBlocked ? fit("PITOT · BLOCKED", "PITOT ✗") : fit("PITOT TUBE", "PITOT"), { size: 11, fill: pitBlocked ? ACC : GRAY });
    T(g, xL, yP + 34, mode === "pitotdrain" ? fit("DRAIN · BLOCKED", "DRAIN ✗") : "DRAIN", { size: 11, fill: mode === "pitotdrain" ? ACC : GRAY });
    R(g, xL, yS - 12, 14, 24, { stroke: stBlocked ? ACC : INK, sw: 2, rx: 3 }); if (stBlocked) R(g, xL - 3, yS - 15, 20, 30, { fill: ACC, rx: 4 });
    T(g, xL, yS + 30, stBlocked ? "STATIC PORT · BLOCKED" : "STATIC PORT", { size: 11, fill: stBlocked ? ACC : GRAY });
    if (altSt) { const xa = (x0 + 10 + x1) / 2; P(g, `M${xa},${yS} L${xa},${yS - 22}`, { stroke: ACC, w: 2.4 }); C(g, xa, yS - 24, 4, { fill: ACC }); T(g, xa, yS - 34, "CABIN AIR (ALTERNATE)", { anchor: "middle", size: 11, fill: ACC }); }
    last = { a: null, b: null, c: null }; read();
  }
  const fmtFt = (v) => (Math.round(v / 10) * 10).toLocaleString();
  function setG(Gi, v, u, frac, normal, wrong) { if (!Gi) return;
    if (Gi.val.textContent !== v) Gi.val.textContent = v; Gi.unit.textContent = u;
    const nt = `NORMAL ${normal}${tw(`NORMAL ${normal} ${u}`, 11) < Gi.gw - 8 ? " " + u : ""}`; if (Gi.norm.textContent !== nt) Gi.norm.textContent = nt;
    if (Gi.wrong !== wrong) { Gi.wrong = wrong; const c = wrong ? ACC : GRAY;
      Gi.ring.setAttribute("stroke", wrong ? ACC : GRAY); Gi.ring.setAttribute("stroke-width", wrong ? 3 : 1.5);
      Gi.needle.setAttribute("stroke", wrong ? ACC : INK); Gi.val.setAttribute("fill", wrong ? ACC : INK);
      Gi.name.textContent = (wrong ? "✗ " : "✓ ") + Gi.nm; Gi.name.setAttribute("fill", wrong ? ACC : GRAY); Gi.norm.setAttribute("fill", wrong ? INK : GRAY); void c; }
    const a = (-140 + 280 * clamp(frac, 0, 1)) * Math.PI / 180;
    Gi.needle.setAttribute("x2", (Gi.cx + Math.sin(a) * (Gi.r - 8)).toFixed(1)); Gi.needle.setAttribute("y2", (Gi.cy - Math.cos(a) * (Gi.r - 8)).toFixed(1)); }
  function read() {
    const Ps = 29.92 - hh / 1000; let Pt = Ps + Q0, Pst = Ps;
    if (mode === "pitot") Pt = Pst;
    if (mode === "pitotdrain") Pt = 29.92 - hBlock / 1000 + Q0;
    if (mode === "static") Pst = 29.92 - hBlock / 1000;
    if (mode === "alt") Pst = Ps - 0.03;
    const ias = V0 * Math.sqrt(Math.max(0, Pt - Pst) / Q0), ia = (29.92 - Pst) * 1000, vs = mode === "static" ? 0 : vsi;
    const vsTxt = (v) => { const x = Math.round(v / 50) * 50; return (x > 0 ? "+" : "") + x; };
    const wA = Math.abs(ias - V0) > 2, wH = Math.abs(ia - hh) > 15, wV = Math.abs(vs - vsi) > 60;
    setG(G[0], String(Math.round(ias)), "KT", ias / 200, String(V0), wA);
    setG(G[1], fmtFt(ia), "FT", (ia % 1000) / 1000, fmtFt(hh), wH);
    setG(G[2], vsTxt(vs), "FPM", 0.5 + vs / 4000, vsTxt(vsi), wV);
    status(ias, ia, vs, wA, wH, wV);
  }
  // Plain-language "what's wrong right now" line, rebuilt only when its wording changes.
  function status(ias, ia, vs, wA, wH, wV) {
    const dir = cmd > 0 ? "climbing" : cmd < 0 ? "descending" : "level";
    const bits = [];
    if (wA) bits.push(ias < 1 ? "airspeed reads zero" : ias > V0 ? "airspeed reads too high" : "airspeed reads too low");
    if (wH) bits.push(mode === "static" ? "altimeter is frozen" : ia > hh ? "altimeter reads a little high" : "altimeter reads low");
    if (wV) bits.push("VSI stuck at zero");
    const tip = mode === "ok" ? "" : cmd === 0 ? (mode === "static" || mode === "pitotdrain" ? " Tap Climb or Descend to make it show." : "") : "";
    const html = `<p class="ps-now"><b>Now, ${dir}:</b> ${bits.length ? bits.join(", ") + "." : "all three gauges agree with the truth."}${tip}</p>`;
    if (html !== nowHtml) { nowHtml = html; const p = S.F.explainEl.querySelector(".ps-now"); if (p) p.outerHTML = html; }
    altOut.textContent = `${fmtFt(hh)} ft`;
  }
  function explain() { nowHtml = ""; S.F.explain(`<p class="ps-now"></p><p>${CASES[mode][1]} <span class="src">PHAK 8</span></p><p class="ps-how"><b>How to use:</b> pick a failure, then tap Climb or Descend. A gauge that turns blue with an ✗ is reading wrong; the small NORMAL line above it shows what it should say.</p>`); }
  function setMode(m) { mode = m || "ok"; hBlock = hh; S.F.caption("Selected", CASES[mode][0]); explain(); S.redraw(); }
  const r1 = row(S.F.ctrl, "Failure"); chips(r1, Object.entries(CASES).map(([k, v]) => [k, v[0]]), "ok", setMode, { label: "Failure" });
  const r2 = row(S.F.ctrl, "Fly"); const fly = chips(r2, FLY.map(([v, t]) => [String(v), t]), "0", (v) => { cmd = +(v ?? 0); if (!cmd) fly.set("0"); lp.start(); }, { label: "Fly" });
  const altOut = el("span", { class: "ps-alt" }, ""); r2.append(el("span", { class: "ps-altw" }, el("span", { class: "label" }, "True alt "), altOut));
  const lp = loop(S.F, (now, dt) => { const s = dt / 1000;
    let target = cmd; const nh = clamp(hh + (cmd / 60) * s * SIM, HMIN, HMAX);
    if ((nh === HMAX && cmd > 0) || (nh === HMIN && cmd < 0)) { cmd = 0; target = 0; fly.set("0"); }
    hh = nh; vsi += (target - vsi) * (1 - Math.exp(-s / TAU)); if (!cmd && Math.abs(vsi) < 4) vsi = 0;
    read(); if (!cmd && vsi === 0) return false; }, { always: true });
  setMode("ok");
  return { destroy() { S.F.destroy(); } };
}
