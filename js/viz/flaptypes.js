// Secondary flight controls on a 3D wing section (same stage, materials and airflow as the trim and flaps visual).
// Wing: plain, split, slotted and Fowler flaps, a fixed slot, a movable slat and a spoiler, with an angle-of-attack slider
// that shows where the wing stalls. Tail: trim, balance, servo and antiservo tabs, showing which way the tab moves against
// its surface. Airflow: dashed 3D streamlines drift aft; where the flow separates they leave the surface and slow eddies
// roll along in the wake. Lift (blue) and drag (ink) are 3D arrows.
// Facts, PHAK 6 (Flaps, Leading Edge Devices, Spoilers, Trim Systems): plain flap = simplest, more lift and drag, center of
// pressure moves aft (nose-down pitch); split flap = hinged from the lower surface, slightly more lift than plain but more
// drag; slotted flap = a slot lets high-energy air from below flow over the flap, delaying separation, more lift than plain
// or split; Fowler flap = slides aft on tracks before hinging down, adding camber and wing area: the largest lift increase
// with the least drag. Slots route air to the upper surface and slats move forward to open a slot; both delay separation to
// a higher angle of attack. Spoilers kill lift and add drag (descent, roll control on some airplanes, after touchdown).
// Trim tab: moves opposite the surface and holds it. Balance tab: linked so it moves opposite the surface and helps move it.
// Servo tab: the cockpit control moves only the tab, and the tab's force moves the surface. Antiservo tab: moves in the
// same direction as the stabilator's trailing edge, making it less sensitive (more feel); it also trims.
// Lift/drag values, deflection angles and stall angles are illustrative, not published values.
import { frame, chips, slider, row } from "./base.js?v=2481aa7edd";
import { planeStage } from "./planestage.js?v=2481aa7edd";
import { sectionModel, airfoil, rotP } from "./section-models.js?v=2481aa7edd";
import { h, clamp, reduced } from "../core/util.js?v=2481aa7edd";
const D = Math.PI / 180;
export const WING = {
  plain: { name: "Plain flap", dl: 0.5, dd: 0.6, crit: 16, say: ["Plain flap", "The simplest flap: more camber, more lift and a lot more drag. The nose tends to pitch down."] },
  split: { name: "Split flap", dl: 0.55, dd: 0.9, crit: 16, say: ["Split flap", "Only the lower surface hinges down: a little more lift than a plain flap, but even more drag."] },
  slotted: { name: "Slotted flap", dl: 0.7, dd: 0.45, crit: 16, say: ["Slotted flap", "Air from below flows through the slot and keeps the flow attached: more lift than plain or split."] },
  fowler: { name: "Fowler flap", dl: 0.9, dd: 0.35, crit: 16, say: ["Fowler flap", "It slides aft, then down: more camber and more wing area. The most lift for the least drag."] },
  slot: { name: "Slot", dl: 0, dd: 0.05, crit: 22, say: ["Fixed slot", "A gap near the leading edge feeds fast air over the top, so the wing stalls at a higher angle."] },
  slat: { name: "Slat", dl: 0.15, dd: 0.1, crit: 22, say: ["Slat", "The leading edge moves forward to open a slot, delaying the stall to a higher angle of attack."] },
  spoiler: { name: "Spoiler", dl: -0.6, dd: 0.8, crit: 16, say: ["Spoiler", "A panel on top spoils the airflow: less lift, more drag. Descend without speeding up."] },
};
export const TAIL = {
  trim: { name: "Trim tab", say: ["Trim tab", "The trim wheel moves the tab; air on the tab holds the elevator the opposite way. Pressure relieved."] },
  balance: { name: "Balance tab", say: ["Balance tab", "Linked to move opposite the elevator, so air on the tab helps move it. Lighter control forces."] },
  servo: { name: "Servo tab", say: ["Servo tab", "The cockpit control moves only the tab; air on the tab moves the surface the opposite way."] },
  anti: { name: "Antiservo tab", say: ["Antiservo tab", "On a stabilator, the tab moves the same way as the trailing edge. Heavier, steadier feel."] },
};
// ---------- geometry (chord units -> model feet). Leading edge toward +x, flying left on screen. ----------
const CH = 5, XLE = 2.5, QC = [XLE - CH * 0.25, 0], ZF = -2.2, ZB = 1.4;   // chord, leading edge, quarter-chord pivot, near and far airflow stations
const M = ([u, y]) => [XLE - CH * u, CH * y];
const [FU, FL] = airfoil(48), [SU, SL] = airfoil(40, 0.1, 0);
const yAt = (pts, u) => { for (let i = 0; i + 1 < pts.length; i++) if (u >= pts[i][0] && u <= pts[i + 1][0]) { const k = (u - pts[i][0]) / (pts[i + 1][0] - pts[i][0] || 1); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k; } return pts.at(-1)[1]; };
const cut = (pts, lo, hi) => { const a = pts.filter(([x]) => x > lo && x < hi); return [[lo, yAt(pts, lo)], ...a, [hi, yAt(pts, hi)]]; };
const sec = (U, Lo, lo, hi, nose) => [...(nose ? [[lo - 0.012, (yAt(U, lo) + yAt(Lo, lo)) / 2]] : []), ...cut(U, lo, hi), ...cut(Lo, lo, hi).reverse()].map(M);
const HF = 0.75, HY = yAt(FL, HF) + 0.012;   // flap hinge, just inside the lower surface
const PIECES = [
  { name: "wing", pts: sec(FU, FL, 0, 1) },                                   // clean section (spoiler)
  { name: "wingTE", pts: sec(FU, FL, 0, HF) },                                // cut for a trailing-edge flap
  { name: "wingLE", pts: [...cut(FU, 0.12, 1), ...cut(FL, 0.055, 1).reverse(), [0.07, 0.004]].map(M) },   // cut for a slot or slat
  { name: "flap", pts: sec(FU, FL, HF + 0.006, 1, true), pivot: M([HF, HY]) },
  { name: "plate", pts: [[0.7, yAt(FL, 0.7) + 0.009], [1, yAt(FL, 1) + 0.004], [1, yAt(FL, 1)], [0.7, yAt(FL, 0.7)]].map(M), pivot: M([0.7, yAt(FL, 0.7)]) },
  { name: "spoiler", pts: [[0.45, yAt(FU, 0.45)], [0.63, yAt(FU, 0.63)], [0.63, yAt(FU, 0.63) - 0.011], [0.45, yAt(FU, 0.45) - 0.011]].map(M), pivot: M([0.45, yAt(FU, 0.45)]) },
  { name: "slat", pts: [...cut(FU, 0, 0.105), [0.085, 0.03], [0.052, 0.006], ...cut(FL, 0, 0.045).reverse()].map(M), pivot: M([0, 0]) },
  { name: "stab", pts: sec(SU, SL, 0, 0.6) },
  { name: "elev", pts: sec(SU, SL, 0.605, 0.9, true), pivot: M([0.6, 0]) },
  { name: "tab", pts: sec(SU, SL, 0.903, 1, true), pivot: M([0.9, 0]), parent: "elev" },
  { name: "stabtor", pts: sec(SU, SL, 0, 0.9) , pivot: M([0.25, 0]) },
  { name: "atab", pts: sec(SU, SL, 0.903, 1, true), pivot: M([0.9, 0]), parent: "stabtor" },
];
const SHOW = { plain: ["wingTE", "flap"], split: ["wing", "plate"], slotted: ["wingTE", "flap"], fowler: ["wingTE", "flap"], slot: ["wingLE", "slat"], slat: ["wingLE", "slat"], spoiler: ["wing", "spoiler"],
  trim: ["stab", "elev", "tab"], balance: ["stab", "elev", "tab"], servo: ["stab", "elev", "tab"], anti: ["stabtor", "atab"] };
const FOCUS = { plain: ["flap"], split: ["plate"], slotted: ["flap"], fowler: ["flap"], slot: [], slat: ["slat"], spoiler: ["spoiler"], trim: ["tab"], balance: ["tab"], servo: ["tab"], anti: ["atab"] };
const ALSO = { trim: ["elev"], balance: ["elev"], servo: ["elev"], anti: ["stabtor"] };   // the surface the tab moves gets accent lines too (tint stays on the tab)
// pose of every piece for a device at deflection k (0-1): [dx, dy] in feet, angle in rad (+ = trailing edge down)
function poseOf(dev, k) { const p = {};
  if (dev === "plain") p.flap = [0, 0, 40 * D * k];
  else if (dev === "slotted") p.flap = [-0.04 * CH * k, -0.035 * CH * k, 35 * D * k];
  else if (dev === "fowler") { const sl = Math.min(1, k * 1.6), dn = Math.max(0, k * 1.6 - 0.6); p.flap = [-0.2 * CH * sl, -0.03 * CH * k, 32 * D * dn]; }
  else if (dev === "split") p.plate = [0, 0, 50 * D * k];
  else if (dev === "spoiler") p.spoiler = [0, 0, -50 * D * k];
  else if (dev === "slat") p.slat = [0.075 * CH * k, -0.045 * CH * k, 0.12 * k];
  else if (dev === "slot") p.slat = [0.045 * CH, -0.03 * CH, 0.07];   // fixed gap: the slot is always open
  else if (dev === "trim") { p.tab = [0, 0, 22 * D * k]; p.elev = [0, 0, -10 * D * k]; }
  else if (dev === "balance") { p.elev = [0, 0, -18 * D * k]; p.tab = [0, 0, 16 * D * k]; }
  else if (dev === "servo") { p.tab = [0, 0, 20 * D * k]; p.elev = [0, 0, -14 * D * k]; }
  else if (dev === "anti") { p.stabtor = [0, 0, -12 * D * k]; p.atab = [0, 0, -10 * D * k]; }
  return p; }
export function mount(host) {
  let tail0 = false, dev = "plain", tail = null, tgt = 0.7, k = 0, aoaT = 6, aoa = 6, first = true;
  const F = frame(host, { cls: "capin sec3d", corners: { tl: "Secondary flight controls", tr: "PHAK 6" } });
  F.root.dataset.live = "1";   // airflow drifts while on screen; zero frames offscreen
  const S = planeStage(F.stage, { model: (THREE) => sectionModel(THREE, PIECES, { stations: 3, spanEvery: 5 }), cg: [0, 0, 0], orbit: false, maxFps: 30, fov: 18, view: { tg: [-0.6, 0.2, 0], az: -112, el: 13, d: 60, fov: 18 } });
  const O = S.P.objs, byName = Object.fromEntries(PIECES.map((p) => [p.name, p]));
  // corner labels sit in a band above the canvas, never over the section
  const band = () => { const sr = F.stage.getBoundingClientRect(); if (!sr.height) return; let b = 0; F.stage.querySelectorAll(".corner").forEach((c) => { if (c.textContent.trim()) b = Math.max(b, c.getBoundingClientRect().bottom - sr.top); }); S.setTopBand(b ? b + 6 : 0); fit(); };
  // fit the section and its airflow (about 15 x 6.5 ft) to the stage
  const fit = (dur = 1) => { const r = F.stage.getBoundingClientRect(), Hh = Math.max(1, r.height - (+F.stage.dataset.band || 0)), Ww = Math.max(1, r.width), TN = Math.tan(9 * D), ph = Ww < 560;
    const wft = ph ? 8.2 : 10.8, hft = ph ? 5.2 : 5.4, d = Math.max(wft / (2 * TN * (Ww / Hh)), hft / (2 * TN)); const tl = !!tail, d2 = tl ? d * 0.78 : d;   // tail tabs: closer and lower, framed on the elevator and tab so their deflections read
    S.setView(tl ? { tg: [ph ? -1.0 : -1.3, 0.1, -0.8], az: -70, el: 9, d: d2, fov: 18 } : { tg: [ph ? -0.5 : -0.9, 0.45, -0.4], az: -66, el: 15, d, fov: 18 }, dur); };
  const bro = new ResizeObserver(band); bro.observe(F.stage); F.on(() => bro.disconnect());
  // live readout band under the stage: three values, fixed slots so nothing moves
  const rb = h("div", { class: "readout sec-read" }); const cells = [0, 1, 2].map(() => { const b = h("b", {}, "–"), sp = h("span", {}); rb.append(h("div", {}, b, sp)); return [b, sp]; }); F.stage.after(rb);
  const setR = (i, v, lab) => { if (cells[i][0].textContent !== v) cells[i][0].textContent = v; if (cells[i][1].textContent !== lab) cells[i][1].textContent = lab; };
  // ---------- airflow cues (3D, model space) ----------
  const NP = 60, XA = 6.4, XB = -8.6;
  // each streamline = a faint continuous line (so it reads as one line) + bright dashes drifting aft along it
  const mk = (d, z, op, dash = [0.9, 0.55]) => { const base = S.cueLine(NP, { width: 1, opacity: op * 0.28 }), dl = S.cueLine(NP, { dash, width: 1.5, opacity: op });
    return { d, z, el: { set(p) { base.set(p); dl.set(p); } } }; };
  const ups = [0.2, 0.7, 1.45].map((d, i) => mk(d, ZF, [0.75, 0.6, 0.42][i])), los = [-0.24, -0.9].map((d, i) => mk(d, ZF, [0.6, 0.42][i]));
  const back = [0.55].map((d) => mk(d, ZB, 0.22));
  const jetB = S.cueLine(30, { width: 4, opacity: 0.2, color: 0x3b82f6 }), jetD = S.cueLine(30, { dash: [0.4, 0.26], width: 2, opacity: 1, color: 0x3b82f6 });
  const jet = { set(p) { jetB.set(p); jetD.set(p); }, set opacity(o) { jetB.opacity = o * 0.25; jetD.opacity = o; } };
  const eddies = Array.from({ length: 5 }, () => S.cueLine(22, { width: 1.2, opacity: 0.3 }));
  const liftA = S.cueArrow({ color: 0x3b82f6, width: 3.4, head: 0.5 }), dragA = S.cueArrow({ color: 0xf2f1ec, width: 2.8, head: 0.42 });
  const tabA = S.cueArrow({ color: 0xf2f1ec, width: 3.2, head: 0.36 }), tailA = S.cueArrow({ color: 0x3b82f6, width: 3.8, head: 0.5 });
  // world outline of a piece under the current pose (mirrors the three.js groups exactly)
  let pose = {}, A = 0;
  const xf = (name, q) => { const pc = byName[name], pv = pc.pivot || [0, 0]; let p = q;
    const own = pose[name]; if (own) { p = rotP(p, own[2], pv); p = [p[0] + own[0], p[1] + own[1]]; }
    if (pc.parent) { const pp = byName[pc.parent], ppv = pp.pivot || [0, 0], po = pose[pc.parent]; if (po) { p = rotP(p, po[2], ppv); p = [p[0] + po[0], p[1] + po[1]]; } }
    return rotP(p, A, QC); };
  let segsW = [];
  const env = (x) => { let lo = Infinity, hi = -Infinity; for (const [a, b] of segsW) if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) { const y = a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); lo = Math.min(lo, y); hi = Math.max(hi, y); } return hi > -Infinity ? [lo, hi] : null; };
  const smooth = (pts, kk = 4) => pts.map((p, i) => { let acc = 0, n = 0; for (let j = -kk; j <= kk; j++) { const q = pts[i + j]; if (q) { const wt = kk + 1 - Math.abs(j); acc += q[1] * wt; n += wt; } } return [p[0], acc / n]; });
  const resample = (pts, n) => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const out = [];
    for (let i = 0; i < n; i++) { const t = (L.at(-1) * i) / (n - 1); let j = 1; while (j < L.length - 1 && L[j] < t) j++; const k2 = (t - L[j - 1]) / (L[j] - L[j - 1] || 1); out.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * k2, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * k2]); } return out; };
  let wake = [], st = {};
  function physics() { const cur = tail || dev, isTail = !!tail;
    if (isTail) { st = { stalled: false, sepX: null, str: 0 }; return; }
    const Wd = WING[dev], crit = Wd.crit - (dev === "slat" ? (1 - k) * 6 : 0), stalled = aoa > crit && dev !== "spoiler";
    let sepU = aoa <= crit - 4 ? 1.02 : aoa <= crit ? 1 - (0.2 * (aoa - crit + 4)) / 4 : Math.max(0.12, 0.6 - (aoa - crit) * 0.1), str = stalled ? 1 : aoa > crit - 4 ? 0.35 * (aoa - crit + 4) / 4 : 0;
    if (dev === "plain" && k > 0.55) { sepU = Math.min(sepU, 0.86); str = Math.max(str, (k - 0.55) * 1.6); }
    if (dev === "spoiler" && k > 0.08) { sepU = Math.min(sepU, 0.6); str = Math.max(str, Math.min(1, k * 1.3)); }
    const liftV = Math.max(0.05, (stalled ? 0.6 : 1) * (0.35 + aoa / 30 + Wd.dl * k * 0.6)), dragV = 0.2 + aoa / 60 + Wd.dd * k * 0.6 + (stalled ? 0.3 : 0);
    st = { crit, stalled, sepU, str: clamp(str, 0, 1), liftV, dragV, cur }; }
  function cues(now = performance.now()) {
    const cur = tail || dev, vis = SHOW[cur];
    segsW = []; for (const n of vis) { const w = byName[n].pts.map((q) => xf(n, q)); for (let i = 0; i < w.length; i++) segsW.push([w[i], w[(i + 1) % w.length]]); }
    let xLE = -Infinity, xTE = Infinity, pLE = null, pTE = null; for (const [a] of segsW) { if (a[0] > xLE) { xLE = a[0]; pLE = a; } if (a[0] < xTE) { xTE = a[0]; pTE = a; } }
    const Ls = st.liftV || 0.5, dw = tail ? 0 : 0.3 * Ls;
    const sepP = !tail && st.sepU < 1 ? xf(vis[0], M([Math.min(1, st.sepU), yAt(FU, Math.min(1, st.sepU))])) : null;
    const line = (d) => { const pts = []; const up = d > 0, h0 = d + (up ? 0.15 : -0.1);
      for (let i = 0; i < NP; i++) { const x = XA - ((XA - XB) * i) / (NP - 1); let y;
        const e = env(x);
        if (x > xLE) y = h0 + (pLE[1] + d * 0.9 - h0) * Math.exp(-(x - xLE) / 2.2);
        else if (e && x > xTE) y = (up ? e[1] : e[0]) + d;
        else y = pTE[1] + d + (h0 - dw - pTE[1] - d) * (1 - Math.exp(-(xTE - x) / 3.2));
        if (sepP && up && x < sepP[0]) { const wd = st.str * Math.exp(-d / 1.5), det = sepP[1] + d * (1 + 0.5 * st.str) + 0.3 * st.str * (1 - Math.exp(-(sepP[0] - x) / 1.4)), fade = Math.exp(-Math.max(0, xTE - 1.5 - x) / 5);
          y = Math.max(y, y + (det - y) * wd * fade); }
        pts.push([x, y]); }
      return smooth(pts, 4); };
    ups.forEach((l) => l.el.set(line(l.d).map(([x, y]) => [x, y, l.z]))); los.forEach((l) => l.el.set(line(l.d).map(([x, y]) => [x, y, l.z])));
    back.forEach((l) => l.el.set(line(l.d).map(([x, y]) => [x, y, l.z])));
    // wake regions for eddies: behind the separation point, and behind a lowered split flap
    wake = [];
    if (sepP && st.str > 0.05) { const top = line(ups[0].d); wake.push({ x0: sepP[0], x1: xTE - 2.2, str: st.str, top: (x) => { const i = clamp(Math.round(((XA - x) / (XA - XB)) * (NP - 1)), 0, NP - 1); return top[i][1]; }, bot: (x) => { const e = env(x); return e ? e[1] : pTE[1]; } }); }
    if (dev === "split" && !tail && k > 0.25) { const tip = xf("plate", M([1, yAt(FL, 1)])), wte = xf("wing", M([1, yAt(FL, 1)])); wake.push({ x0: wte[0] + 0.6, x1: tip[0] - 2.4, str: clamp((k - 0.25) * 1.6, 0, 1), top: () => wte[1] + 0.05, bot: () => tip[1] + 0.05 }); }
    eddyDraw(now);
    // the teaching flow: through a slot, a slat gap or a slotted flap's gap
    let jp = null;
    if (!tail && (dev === "slot" || (dev === "slat" && k > 0.25))) { const g = xf("slat", M([0.085, 0.03])), m = xf("wingLE", M([0.07, 0.004]));
      jp = [xf("wingLE", M([-0.1, -0.11])), xf("wingLE", M([0.0, -0.075])), [(g[0] + m[0]) / 2 + 0.15, (g[1] + m[1]) / 2 - 0.08], [(g[0] + m[0]) / 2 - 0.05, (g[1] + m[1]) / 2 + 0.05], xf("wingLE", M([0.2, yAt(FU, 0.2) + 0.025])), xf("wingLE", M([0.4, yAt(FU, 0.4) + 0.035])), xf("wingLE", M([0.62, yAt(FU, 0.62) + 0.04]))]; }
    if (!tail && dev === "slotted" && k > 0.15) { const mt = xf("wingTE", M([HF, yAt(FU, HF)])), fn = xf("flap", M([HF, (yAt(FU, HF) + yAt(FL, HF)) / 2]));
      jp = [xf("wingTE", M([0.55, yAt(FL, 0.55) - 0.05])), xf("wingTE", M([0.7, yAt(FL, 0.7) - 0.025])), [(mt[0] + fn[0]) / 2, (mt[1] + fn[1]) / 2 - 0.02], xf("flap", M([0.84, yAt(FU, 0.84) + 0.03])), xf("flap", M([0.94, yAt(FU, 0.94) + 0.03])), xf("flap", M([1.06, yAt(FU, 1) + 0.03])), xf("flap", M([1.25, yAt(FU, 1) + 0.03]))]; }
    if (jp) { const sp = []; for (let i = 0; i + 1 < jp.length; i++) for (let t = 0; t < 1; t += 0.1) { const a = jp[Math.max(0, i - 1)], b = jp[i], c = jp[i + 1], d2 = jp[Math.min(jp.length - 1, i + 2)], t2 = t * t, t3 = t2 * t;   // Catmull-Rom
        sp.push([0, 1].map((j) => 0.5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d2[j]) * t2 + (-a[j] + 3 * b[j] - 3 * c[j] + d2[j]) * t3))); }
      sp.push(jp.at(-1)); let rs = resample(sp, 30); for (let pass = 0; pass < 4; pass++) rs = rs.map((q, i) => (i === 0 || i === rs.length - 1 ? q : [(rs[i - 1][0] + 2 * q[0] + rs[i + 1][0]) / 4, (rs[i - 1][1] + 2 * q[1] + rs[i + 1][1]) / 4]));   // calm the bends
      jet.set(resample(rs, 30).map(([x, y]) => [x, y, ZF - 0.05])); jet.opacity = 0.95; } else jet.opacity = 0;
    // forces
    if (!tail) { const sp2 = dev === "spoiler" && k > 0.05, q = rotP([QC[0] - (sp2 ? CH * 0.57 : 0), QC[1] + CH * 0.09], A, QC), L1 = 0.6 + 1.5 * st.liftV, y0 = q[1] + (sp2 ? 0.95 : 0.75), zl = ZF;   // with a spoiler up, the (small) lift arrow stands behind the panel, never on it
      liftA.set([q[0], y0, zl], [q[0], y0 + L1, zl]); liftA.opacity = 1;
      const L2 = 0.3 + 1.5 * st.dragV; dragA.set([xTE - 0.35, pTE[1], ZF], [xTE - 0.35 - L2, pTE[1], ZF]); dragA.opacity = 1; tabA.opacity = 0; tailA.opacity = 0; }
    else { liftA.opacity = 0; dragA.opacity = 0; const tn = cur === "anti" ? "atab" : "tab", sn = cur === "anti" ? "stabtor" : "elev";
      const tAng = (pose[tn] || [0, 0, 0])[2] + (pose[sn] || [0, 0, 0])[2] + A, mid = xf(tn, M([0.95, 0])), nrm = [-Math.sin(tAng), Math.cos(tAng)];   // tab mid and its upper-surface normal
      const sg = tAng > 0 ? 1 : -1, Lt = 0.35 + 1.2 * Math.min(1, Math.abs(tAng) / (25 * D));   // tab down: air pushes it up (arrow from below)
      tabA.set([mid[0] - nrm[0] * sg * (Lt + 0.15), mid[1] - nrm[1] * sg * (Lt + 0.15), ZF], [mid[0] - nrm[0] * sg * 0.15, mid[1] - nrm[1] * sg * 0.15, ZF]); tabA.opacity = clamp(Math.abs(tAng) / (6 * D), 0, 1);
      const sAng = (pose[sn] || [0, 0, 0])[2], dir = sAng < 0 ? -1 : 1, L3 = 0.4 + 1.6 * Math.min(1, Math.abs(sAng) / (15 * D)), c = xf(sn, M([cur === "anti" ? 0.5 : 0.72, 0]));
      tailA.set([c[0], c[1] + dir * 0.35, ZF], [c[0], c[1] + dir * (0.35 + L3), ZF]); tailA.opacity = clamp(Math.abs(sAng) / (4 * D), 0, 1); }
  }
  // eddies: slow open loops rolling aft in a wake region; top moves aft, so they turn with the flow above them
  function eddyDraw(now) { const ph = reduced() ? 0 : now / 1000; let e = 0;
    for (const w of wake) { const n = w === wake[0] ? 3 : 2, L = w.x0 - w.x1; if (L <= 0.2) continue;
      for (let j = 0; j < n && e < eddies.length; j++, e++) { const s0 = ((j + 0.5) / n + ph * 0.07) % 1, x = w.x0 - s0 * L, top = w.top(x), bot = w.bot(x), gap = Math.max(0, top - bot);
        const fade = Math.sin(Math.PI * s0) ** 0.8, r = Math.min(0.55, gap * 0.36) * (0.55 + 0.45 * fade), cy = bot + gap * 0.5, th0 = ph * 2.2 + j * 1.9;
        const pts = Array.from({ length: 22 }, (_, i) => { const u = i / 21, th = th0 + u * 4.2, rr = r * (0.25 + 0.75 * u); return [x + rr * 1.35 * Math.cos(th), cy + rr * Math.sin(th), ZF]; });   // an open spiral, stretched along the flow
        eddies[e].set(pts); eddies[e].opacity = 0.34 * w.str * fade; } }
    for (; e < eddies.length; e++) eddies[e].opacity = 0; }
  // ---------- state -> scene ----------
  function apply() { const cur = tail || dev, vis = new Set(SHOW[cur]); pose = poseOf(cur, cur === "slot" ? 1 : k); A = tail ? 0 : aoa * D;
    for (const pc of PIECES) { const o = O[pc.name]; o.visible = vis.has(pc.name); if (!o.visible) continue; const pv = pc.pivot || [0, 0], par = pc.parent ? byName[pc.parent].pivot || [0, 0] : [0, 0], p = pose[pc.name] || [0, 0, 0];
      o.position.set(pv[0] - par[0] + p[0], pv[1] - par[1] + p[1], 0); o.rotation.z = p[2]; }
    S.P.root.rotation.z = 0; aoaG(); physics(); cues(); text(); S.kick(); }
  // the wing (not the tail) pitches to the angle of attack about its quarter chord: rotate the top-level pieces
  function aoaG() { for (const pc of PIECES) if (!pc.parent) { const o = O[pc.name]; if (!o.visible) continue; const pv = pc.pivot || [0, 0], p = pose[pc.name] || [0, 0, 0], w = rotP([pv[0] + p[0], pv[1] + p[1]], A, QC); o.position.set(w[0], w[1], 0); o.rotation.z = p[2] + A; } }
  let lastCap = "";
  function text() { const cur = tail || dev;
    if (tail) { const Tl = TAIL[tail], force = { trim: 0, balance: 0.3, servo: 0.25, anti: 0.85 }[tail] * k;
      setR(0, `${Math.round(force * 100)}%`, "control force"); setR(1, k < 0.03 ? "neutral" : tail === "anti" ? "same way" : "opposite", "tab vs surface"); setR(2, `${Math.round(k * 100)}%`, tail === "trim" ? "trim" : "pilot input");
      const key = "t" + tail; if (key !== lastCap) { lastCap = key; F.caption(Tl.say[0], Tl.say[1]); } return; }
    const Wd = WING[dev]; setR(0, `${Math.round((st.liftV / (0.35 + 6 / 30)) * 100)}%`, "lift"); setR(1, `${Math.round((st.dragV / (0.2 + 0.1)) * 100)}%`, "drag");
    setR(2, st.stalled ? "stalled" : st.sepU < 0.99 ? (dev === "spoiler" && k > 0.08 ? "spoiled" : "separating") : "attached", "airflow on top");
    const say = st.stalled ? ["Stalled", dev === "slot" || dev === "slat" ? "Even with the leading-edge device, past the critical angle of attack it stalls." : "Past the critical angle of attack. Try a slot or slat: they delay the stall."] : Wd.say;
    const key = say[0] + say[1]; if (key !== lastCap) { lastCap = key; F.caption(say[0], say[1]); } }
  // ---------- controls: every row stays in place; rows that do not apply are disabled, not hidden ----------
  const r0 = row(F.ctrl, "Wing"); const wc = chips(r0, Object.entries(WING).map(([kk, v]) => [kk, v.name]), dev, (kk) => { if (!kk) return; pick(kk, null); }, { label: "Wing" });
  const r1 = row(F.ctrl, "Tail"); const tc = chips(r1, Object.entries(TAIL).map(([kk, v]) => [kk, v.name]), null, (kk) => { if (!kk) return; pick(null, kk); }, { label: "Tail" });
  const r2 = row(F.ctrl, "Move"); const sd = slider(r2, { label: "Deflection", min: 0, max: 100, value: tgt * 100, fmt: (x) => x + "%", oninput: (x) => { tgt = x / 100; go(); } });
  const ra = row(F.ctrl, "Wing angle"); const sa = slider(ra, { label: "Angle of attack", min: 0, max: 26, value: aoa, fmt: (x) => x + "°", oninput: (x) => { aoaT = x; go(); } });
  function pick(d, t) { dev = d; tail = t; wc.set(d); tc.set(t); sa.input.disabled = !!t; ra.classList.toggle("off", !!t); sd.input.disabled = d === "slot"; r2.classList.toggle("off", d === "slot");
    const wasTail = tail0; tail0 = !!t; k = 0; const f = FOCUS[t || d], fl = [...f, ...(ALSO[t] || [])]; if (first) { S.highlight(fl); first = false; } else S.focus(fl); S.tint(f); if (wasTail !== tail0) fit(1100); apply(); go(); }
  // motion: deflection and angle of attack ease to their targets, then the surfaces stop (the airflow keeps drifting on screen)
  let last = 0, running = false;
  const tick = (now) => { const dt = Math.min(0.064, (now - (last || now)) / 1000); last = now; let busy = false;
    const dk = tgt - k; if (Math.abs(dk) < 0.003) k = tgt; else { k += dk * Math.min(1, dt * 4); busy = true; }
    const da = aoaT - aoa; if (Math.abs(da) < 0.05) aoa = aoaT; else { aoa += da * Math.min(1, dt * 5); busy = true; }
    apply(); if (!busy) { running = false; last = 0; S.animate(null); } };
  function go() { if (reduced()) { k = tgt; aoa = aoaT; apply(); return; } if (!running) { running = true; last = 0; S.animate(tick); } }
  S.setFlow(true, (now) => { if (wake.length) eddyDraw(now); });
  F.explain(`<p>Pick a device, then drag the deflection. On the wing, raise the angle of attack until it stalls. Then try a slot or slat. The 172S has single-slot flaps and an elevator trim tab; your airplane's POH shows what yours has.</p><p class="src">PHAK Ch 6. Airflow, angles and forces are illustrations, not to scale.</p>`);
  band(); fit(1); pick("plain", null);
  return { destroy() { S.destroy(); F.destroy(); } };
}
