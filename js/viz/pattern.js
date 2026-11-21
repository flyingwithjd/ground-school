// Traffic pattern in ink 3D (AC 90-66C, AIM 4-3-3): the C172 model flies the rectangle around runway 9 on a loop, climbing
// on upwind, level at pattern altitude on downwind, descending from abeam the approach end to a touch-and-go. The leg it is
// on (or the leg you pick) is drawn in the accent; drop lines to the ground track show the height. Schematic: the airplane
// is enlarged and distances are not to scale.
import { frame, chips, row } from "./base.js?v=a658135e5c";
import { planeStage } from "./planestage.js?v=a658135e5c";
import { reduced } from "../core/util.js?v=a658135e5c";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
const LEGS = {
  dep: ["Upwind / departure", "Climb straight ahead", "After takeoff, continue straight ahead until beyond the departure end of the runway. Climb at VY (74 KIAS in the 172S, POH) unless a different speed is called for."],
  xw: ["Crosswind", "Within 300 ft of pattern altitude", "Do not turn crosswind until beyond the departure end and within 300 feet below traffic pattern altitude. Level off at pattern altitude and turn downwind. <span class=\"src\">AC 90-66C 11.7</span>"],
  dw: ["Downwind", "Pattern altitude", "Parallel to the runway, opposite the landing direction, at traffic pattern altitude: usually 1,000 ft AGL for propeller airplanes unless the Chart Supplement publishes another. Hold it until at least abeam the approach end. <span class=\"src\">AC 90-66C App A, 11.4</span>"],
  base: ["Base", "Descending", "Turn base about 45° relative bearing from the approach end of the runway. Keep descending and managing energy toward a stabilized final. <span class=\"src\">AC 90-66C 11.4</span>"],
  final: ["Final", "Aligned with the centerline", "Complete the turn to final at least ¼ mile from the runway. Stay aligned with the extended centerline to the landing. <span class=\"src\">AIM 4-3-3 (via AC 90-66C App A)</span>"],
};
const ENTRY = {
  e45: ["45° entry to downwind", "The standard entry", "Arrive at pattern altitude, well clear, and enter the downwind at a 45° angle abeam the midpoint of the runway. Everyone at the same altitude makes traffic easier to see. <span class=\"src\">AC 90-66C 11.3</span>"],
  mid: ["Midfield crossing", "An alternate entry", "From the upwind side, cross over midfield at pattern altitude and enter the downwind directly. Do not use it when the pattern is congested. <span class=\"src\">AC 90-66C App A</span>"],
  out: ["Departing the pattern", "Straight out or 45°", "Continue straight out, or exit with a 45° turn in the pattern direction, beyond the departure end and after reaching pattern altitude. <span class=\"src\">AC 90-66C 11.8</span>"],
  si: ["Straight-in", "Discouraged", "The FAA discourages VFR straight-in approaches because they conflict with traffic in the pattern. If used, announce it about 10 miles out and yield to traffic already established. <span class=\"src\">AC 90-66C 9.11.1</span>"],
};
LEGS.roll = ["Touch and go", "On the runway", "The wheels touch down near the numbers, the airplane rolls, then power goes back in and it lifts off again for another circuit. On a real touch and go: flaps up, carb heat off, full power, then rotate. Confirm the procedure with your CFI."];
const K = 2.2, RWL = 150, RWW = 32, OFF = 92, XX = 205, BX = -55, PA = 34;   // schematic units; the airplane is drawn about 2x
const NAME = { roll: "Runway", dep: "Upwind", xw: "Crosswind", dw: "Downwind", base: "Base", final: "Final" };
// waypoints [x, y, z, tag of the segment that starts here]; z is multiplied by the pattern side (-1 = left traffic, north of runway 9)
const CIRCUIT = [[28, 0, 0, "roll"], [72, 0, 0, "dep"], [XX, 24, 0, "xw"], [XX, PA, OFF, "dw"], [0, PA, OFF, "dw"], [BX, 25, OFF, "base"], [BX, 15, 0, "final"]];
const PATHS = {
  circuit: { loop: true, pts: CIRCUIT },
  e45: { pts: [[75 + 125, PA, OFF + 125, "dw"], [75, PA, OFF, "dw"], [0, PA, OFF, "dw"], [BX, 25, OFF, "base"], [BX, 15, 0, "final"], [28, 0, 0, "roll"], [110, 0, 0, "roll"]], entry: [0, 1] },
  mid: { pts: [[75, PA, -150, "dw"], [75, PA, 50, "dw"], [45, PA, OFF, "dw"], [0, PA, OFF, "dw"], [BX, 25, OFF, "base"], [BX, 15, 0, "final"], [28, 0, 0, "roll"], [110, 0, 0, "roll"]], entry: [0, 2] },
  out: { pts: [[10, 0, 0, "roll"], [55, 0, 0, "dep"], [XX, PA, 0, "dep"], [XX + 30, PA, 0, "dep"], [XX + 140, PA + 4, 110, "dep"]], entry: [2, 4] },
  si: { pts: [[-185, 30, 0, "final"], [28, 0, 0, "roll"], [110, 0, 0, "roll"]], entry: [0, 1] },
};
// corner-cutting (Chaikin) then even resampling: smooth turns, a tag per sample, cumulative length
function build(def, side) { let pts = def.pts.map((p) => [p[0], p[1], p[2] * side, p[3]]); const loop = !!def.loop;
  for (let it = 0; it < 3; it++) { const out = []; const n = pts.length, m = loop ? n : n - 1; if (!loop) out.push(pts[0]);
    for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % n]; const q = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      out.push([...q(0.25), a[3]], [...q(0.75), a[3]]); }
    if (!loop) out.push(pts[n - 1]); pts = out; }
  if (loop) pts.push(pts[0]);
  const S = []; let acc = 0; const step = 2;
  for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1]; const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const n = Math.max(1, Math.round(L / step));
    for (let k = 0; k < n; k++) { const t = k / n; S.push({ p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], tag: a[3], s: acc + L * t }); } acc += L; }
  const last = pts[pts.length - 1]; S.push({ p: [last[0], last[1], last[2]], tag: last[3], s: acc });
  // heading, bank (from turn rate) and pitch (from climb gradient, slightly exaggerated) per sample
  const N = S.length; S.forEach((o, i) => { const a = S[Math.max(0, i - 2)].p, b = S[Math.min(N - 1, i + 2)].p; o.yaw = Math.atan2(b[2] - a[2], b[0] - a[0]) * 180 / Math.PI; o.pitch = Math.atan2(b[1] - a[1], Math.hypot(b[0] - a[0], b[2] - a[2])) * 180 / Math.PI * 1.6; });
  S.forEach((o, i) => { const a = S[Math.max(0, i - 4)], b = S[Math.min(N - 1, i + 4)]; let d = b.yaw - a.yaw; while (d > 180) d -= 360; while (d < -180) d += 360; const ds = Math.max(1e-3, b.s - a.s); o.bank = o.p[1] > 1 ? Math.max(-30, Math.min(30, (d / ds) * 26)) : 0; });
  for (let r = 0; r < 3; r++) S.forEach((o, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(N - 1, i + 1)]; o.bank = (a.bank + o.bank * 2 + b.bank) / 4; });
  return { S, len: acc, loop }; }
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "capin", corners: { tl: "Not to scale" } });
  const still = reduced();
  const S = planeStage(F.stage, { view: { tg: [75, 8, -62], az: 100, el: 52, d: 470 }, orbit: false, maxFps: 30 }); const T = S.THREE;
  // enlarge the airplane about its CG; it is then moved along the path by its pivot
  S.pivot.children[0].scale.setScalar(K); S.pivot.children[0].position.copy(S.CG).multiplyScalar(-K);
  const world = new T.Group(); S.scene.add(world);
  const res = new T.Vector2(1, 1), mats = [];
  const lm = (color, width, opacity, dashed) => { const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false, dashed: !!dashed, dashSize: 3, gapSize: 3 }); mats.push(m); return m; };
  const segs = (pairs, mat) => { const g = new LineSegmentsGeometry(); g.setPositions(new Float32Array(pairs.flat(2))); const l = new LineSegments2(g, mat); if (mat.dashed) l.computeLineDistances(); l.frustumCulled = false; world.add(l); return l; };
  const INK = 0xf2f1ec, ACC = 0x3b82f6;
  // ground: faint grid, runway outline, centerline dashes, threshold bars, wind arrow
  const grid = new T.GridHelper(520, 26, INK, INK); grid.material.transparent = true; grid.material.opacity = 0.06; grid.position.set(75, 0, 0); world.add(grid);
  const w = RWW / 2, rw = [[[0, 0, -w], [RWL, 0, -w]], [[0, 0, w], [RWL, 0, w]], [[0, 0, -w], [0, 0, w]], [[RWL, 0, -w], [RWL, 0, w]]];
  for (let x = 22; x < RWL - 22; x += 14) rw.push([[x, 0, 0], [x + 7, 0, 0]]);
  for (const x0 of [3, RWL - 9]) for (let z = -w + 4; z <= w - 4; z += 4) rw.push([[x0, 0, z], [x0 + 6, 0, z]]);
  segs(rw, lm(INK, 1.4, 0.75));
  let windL = null; const mWind = lm(INK, 1.6, 0.6); const windArrow = () => { kill(windL); const z = -side * 48, x0 = RWL - 10, x1 = RWL - 50; windL = segs([[[x0, 0, z], [x1, 0, z]], [[x1, 0, z], [x1 + 8, 0, z - 5]], [[x1, 0, z], [x1 + 8, 0, z + 5]]], mWind); };
  // the path: faint full circuit, accent overlay for one leg, dashed ground track, drop lines
  let side = opts.right ? 1 : -1, mode = opts.entries ? "e45" : "circuit", pick = "live", P = null, curTag = null, t0 = performance.now();
  let ghost = null, faint = null, track = null, drops = null, accent = null, entryL = null;
  const pairsOf = (S0, f = () => true) => { const out = []; for (let i = 0; i + 1 < S0.length; i++) if (f(S0[i])) out.push([S0[i].p, S0[i + 1].p]); return out; };
  function kill(l) { if (l) { world.remove(l); l.geometry.dispose(); } }
  const mFaint = lm(INK, 1.6, 0.4), mGhost = lm(INK, 1, 0.14, true), mTrack = lm(INK, 1, 0.16, true), mDrop = lm(INK, 1, 0.12), mAcc = lm(ACC, 3.2, 1), mEntry = lm(ACC, 2.2, 0.55, true);
  function rebuild() { P = build(PATHS[mode], side); [ghost, faint, track, drops, accent, entryL].forEach(kill); accent = null; entryL = null; ghost = null;
    if (mode !== "circuit") ghost = segs(pairsOf(build(PATHS.circuit, side).S), mGhost);
    faint = segs(pairsOf(P.S), mFaint); windArrow();
    track = segs(pairsOf(P.S.map((o) => ({ ...o, p: [o.p[0], 0.05, o.p[2]] }))), mTrack);
    const dp = []; for (let s = 0, i = 0; i < P.S.length; i++) if (P.S[i].s >= s && P.S[i].p[1] > 2) { dp.push([P.S[i].p, [P.S[i].p[0], 0, P.S[i].p[2]]]); s = P.S[i].s + 22; } drops = segs(dp, mDrop);
    if (mode !== "circuit" && PATHS[mode].entry) { const [a, b] = PATHS[mode].entry; const def = PATHS[mode]; // highlight the entry or exit portion
      const lo = P.S.findIndex((o) => Math.hypot(o.p[0] - def.pts[a][0], o.p[2] - def.pts[a][2] * side) < 3), hi = P.S.findIndex((o) => Math.hypot(o.p[0] - def.pts[b][0], o.p[2] - def.pts[b][2] * side) < 3);
      if (lo >= 0 && hi > lo) entryL = segs(pairsOf(P.S.slice(lo, hi + 1)), mEntry); }
    curTag = null; setAccent(); placeTags(); }
  function setAccent() { const tag = pick === "live" ? curTag : pick; kill(accent); accent = null; if (!tag) return; const pr = pairsOf(P.S, (o) => o.tag === tag); if (pr.length) accent = segs(pr, mAcc); tagEls.forEach((e) => e.classList.toggle("on", e.dataset.k === tag)); }
  // leg labels pinned to the middle of each leg, and the runway numbers
  const TAG = "position:absolute;left:0;top:0;z-index:3;pointer-events:none;white-space:nowrap;font:600 10px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:rgba(242,241,236,.8);background:rgba(10,10,11,.72);border:1px solid rgba(242,241,236,.25);border-radius:4px;padding:4px 6px;transform:translate(-50%,-50%)";
  const sty = document.createElement("style"); sty.textContent = ".pt3-tag.on{color:#bfdbfe!important;border-color:#3b82f6!important}"; F.stage.append(sty);
  const tagEls = []; const mkTag = (k, text) => { const e = document.createElement("div"); e.className = "pt3-tag"; e.dataset.k = k; e.style.cssText = TAG; e.textContent = text; e.setAttribute("aria-hidden", "true"); F.stage.append(e); tagEls.push(e); return e; };
  ["dep", "xw", "dw", "base", "final"].forEach((k) => mkTag(k, NAME[k])); mkTag("rw9", "9"); mkTag("rw27", "27"); mkTag("wind", "Wind 090°");
  let tagPos = {};
  function placeTags() { tagPos = {}; const S0 = P.S; for (const k of ["dep", "xw", "dw", "base", "final"]) { const ii = S0.filter((o) => o.tag === k); if (!ii.length) continue; const o = ii[Math.floor(ii.length / 2)].p; tagPos[k] = [o[0], o[1] + 7, o[2]]; }
    tagPos.rw9 = [4, 0, -side * 28]; tagPos.rw27 = [RWL - 4, 0, -side * 28]; tagPos.wind = [RWL - 30, 0, -side * 64]; }
  function drawTags() { tagEls.forEach((e) => { const p3 = tagPos[e.dataset.k]; if (!p3) { e.style.display = "none"; return; } const q = S.project(p3, false); e.style.display = ""; e.style.left = Math.round(q.x) + "px"; e.style.top = Math.round(q.y) + "px"; }); }
  // camera: look at the middle of the pattern from the runway side
  const VIEWS = { circuit: [75, 62, 470], e45: [85, 105, 560], mid: [75, 30, 540], out: [140, 70, 560], si: [20, 40, 540] };
  const view = () => { const v = VIEWS[mode]; return { tg: [v[0], 8, side * v[1]], az: side < 0 ? 100 : -100, el: 52, d: v[2] }; };
  const SPEED = 30;   // schematic units per second: one circuit in about 25 s
  function frameAt(now) { const r = S.renderer.getDrawingBufferSize(new T.Vector2()); if (r.x !== res.x || r.y !== res.y) { res.copy(r); mats.forEach((m) => m.resolution.copy(res)); }
    const dist = still ? P.len * 0.45 : ((now - t0) / 1000) * SPEED; let s = P.loop ? dist % P.len : dist % (P.len + 45);
    if (!P.loop && s > P.len) s = P.len;   // pause at the end of an entry demo, then start over
    const S0 = P.S; let lo = 0, hi = S0.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S0[m].s <= s) lo = m; else hi = m; }
    const a = S0[lo], b = S0[hi], t = Math.min(1, Math.max(0, (s - a.s) / Math.max(1e-6, b.s - a.s)));
    const p = a.p.map((v, i) => v + (b.p[i] - v) * t); let dy = b.yaw - a.yaw; while (dy > 180) dy -= 360; while (dy < -180) dy += 360;
    S.pivot.position.set(p[0], p[1] + S.CG.y * K, p[2]); S.setAttitude({ yaw: a.yaw + dy * t, bank: a.bank + (b.bank - a.bank) * t, pitch: a.pitch + (b.pitch - a.pitch) * t });
    if (a.tag !== curTag) { curTag = a.tag; if (pick === "live") { setAccent(); if (mode === "circuit") say(curTag); } }
    drawTags(); return !still; }
  function say(k) { const L = LEGS[k] || ENTRY[k]; if (!L) return; F.caption(L[0], L[1]); F.explain(L[2]); }
  // controls: direction, then legs (legs page) or entries (entries page)
  const r1 = row(F.ctrl, "Pattern"); chips(r1, [["-1", "Left traffic"], ["1", "Right traffic"]], String(side), (v) => { side = +v; rebuild(); S.setView(view(), 900); intro(); }, { label: "Pattern direction" });
  if (opts.entries) { const r2 = row(F.ctrl, "Fly"); chips(r2, [["e45", "45° entry"], ["mid", "Midfield"], ["out", "Departure"], ["si", "Straight-in"], ["circuit", "Full circuit"]], mode, (v) => { mode = v; t0 = performance.now(); rebuild(); S.setView(view(), 900); if (ENTRY[v]) say(v); else intro(); }, { label: "Entries and exits" }); }
  else { const r2 = row(F.ctrl, "Leg"); chips(r2, [["live", "Follow"], ["dep", "Upwind"], ["xw", "Crosswind"], ["dw", "Downwind"], ["base", "Base"], ["final", "Final"]], "live", (v) => { pick = v; setAccent(); if (v === "live") { if (curTag) say(curTag); } else say(v); }, { label: "Pattern leg" }); }
  function intro() { if (mode !== "circuit" && ENTRY[mode]) return say(mode); F.caption(side < 0 ? "Left traffic · runway 9" : "Right traffic · runway 9", "Pick a leg, or follow the airplane"); F.explain((side < 0 ? "Left traffic is the default: at a non-towered airport in Class G, fixed-wing airplanes make all turns to the left unless approved lights or markings show right traffic. <span class=\"src\">14 CFR 91.126(b)</span>" : "Right traffic is used only where the airport shows it with approved lights or markings (or the Chart Supplement lists it). Look for traffic pattern indicators at the segmented circle. <span class=\"src\">14 CFR 91.126(b)</span>") + " <span class=\"src\">Schematic: the airplane is enlarged and distances are not to scale.</span>"); }
  rebuild(); S.setView(view(), 1); intro();
  S.animate((now) => frameAt(now), { idle: still });
  if (still) frameAt(performance.now());
  return { destroy() { kill(windL); [ghost, faint, track, drops, accent, entryL].forEach(kill); mats.forEach((m) => m.dispose()); S.destroy(); F.destroy(); } };
}
