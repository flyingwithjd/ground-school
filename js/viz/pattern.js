// Traffic pattern in ink 3D (AC 90-66C, AIM 4-3-3): the C172 model flies a rectangle with round turns around runway 9 on a loop,
// climbing on upwind, level at pattern altitude on downwind, descending from abeam the approach end to a touch-and-go. The
// leg it is on (or the leg you pick) is drawn in the accent, the rest of the track in dim ink; corner drop lines show height.
import { frame, chips, row } from "./base.js?v=0e1a30e374";
import { planeStage } from "./planestage.js?v=0e1a30e374";
import { reduced } from "../core/util.js?v=0e1a30e374";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
const LEGS = {
  dep: ["Upwind / departure", "Climb straight ahead", "After takeoff, continue straight ahead until beyond the departure end of the runway. Climb at VY (74 KIAS in the 172S, POH) unless a different speed is called for."],
  xw: ["Crosswind", "Turn near pattern altitude", "Do not turn crosswind until beyond the departure end and within 300 feet below traffic pattern altitude. Level off at pattern altitude and turn downwind. <span class=\"src\">AC 90-66C 11.7</span>"],
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
// Schematic units of 20 ft: a 4,400 ft runway, 1,000 ft pattern altitude, downwind about half a mile out. The runway width and the
// airplane are drawn about 6x so the airplane still reads on a phone; the airplane stays narrower than the runway.
const K = 0.9, RWL = 220, RWW = 34, OFF = 130, XX = RWL + 45, BX = -50, PA = 50, R = 22;
const NAME = { roll: "Runway", dep: "Upwind", xw: "Crosswind", dw: "Downwind", base: "Base", final: "Final" };
const CIRCUIT = [[40, 0, 0, "roll"], [95, 0, 0, "dep"], [XX, 36, 0, "xw"], [XX, PA, OFF, "dw"], [0, PA, OFF, "dw"], [BX, 38, OFF, "base"], [BX, 24, 0, "final"]];
const PATHS = {
  circuit: { loop: true, pts: CIRCUIT },
  e45: { pts: [[RWL / 2 + 120, PA, OFF + 120, "dw"], [RWL / 2, PA, OFF, "dw"], [0, PA, OFF, "dw"], [BX, 38, OFF, "base"], [BX, 24, 0, "final"], [40, 0, 0, "roll"], [150, 0, 0, "roll"]], entry: [0, 1] },
  mid: { pts: [[RWL / 2, PA, -130, "dw"], [RWL / 2, PA, OFF, "dw"], [0, PA, OFF, "dw"], [BX, 38, OFF, "base"], [BX, 24, 0, "final"], [40, 0, 0, "roll"], [150, 0, 0, "roll"]], entry: [0, 1] },
  out: { pts: [[10, 0, 0, "roll"], [65, 0, 0, "dep"], [XX, PA, 0, "dep"], [XX + 110, PA + 4, 110, "dep"]], entry: [2, 3] },
  si: { pts: [[-200, 44, 0, "final"], [40, 0, 0, "roll"], [150, 0, 0, "roll"]], entry: [0, 1] },
};
// Straight legs joined by round turns: each corner becomes an arc of radius R (a quadratic curve through the corner, which is
// nearly circular for a 90° turn); the turn belongs to the leg it rolls out on. Then even resampling with a tag per sample.
function build(def, side) { const pts = def.pts.map((p) => [p[0], p[1], p[2] * side, p[3]]); const loop = !!def.loop, n = pts.length;
  const lerp = (a, b, t) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t), dist = (a, b) => Math.hypot(b[0] - a[0], b[2] - a[2]);
  const pieces = [];   // [kind, a, b, c, tag]: line a->b, or curve a (ctrl b) c
  const corner = (i) => { const p = pts[(i + n - 1) % n], c = pts[i], q = pts[(i + 1) % n]; const r1 = Math.min(R, dist(p, c) * 0.45), r2 = Math.min(R, dist(c, q) * 0.45);
    return { in: lerp(c, p, r1 / Math.max(1e-6, dist(p, c))), out: lerp(c, q, r2 / Math.max(1e-6, dist(c, q))), c }; };
  const C = pts.map((_, i) => (loop || (i > 0 && i < n - 1)) ? corner(i) : { in: pts[i], out: pts[i], c: pts[i] });
  const m = loop ? n : n - 1;
  for (let i = 0; i < m; i++) { const j = (i + 1) % n, tag = pts[i][3]; pieces.push(["L", C[i].out, C[j].in, null, tag]); if (loop || j < n - 1) pieces.push(["Q", C[j].in, C[j].c, C[j].out, pts[j][3]]); }
  const S = []; let acc = 0; const step = 1.5, at = (pc, t) => pc[0] === "L" ? lerp(pc[1], pc[2], t) : [0, 1, 2].map((k) => (1 - t) ** 2 * pc[1][k] + 2 * (1 - t) * t * pc[2][k] + t * t * pc[3][k]);
  for (const pc of pieces) { let prev = at(pc, 0), L = 0; const fine = 24; for (let k = 1; k <= fine; k++) { const q = at(pc, k / fine); L += Math.hypot(q[0] - prev[0], q[1] - prev[1], q[2] - prev[2]); prev = q; }
    const cnt = Math.max(1, Math.round(L / step)); for (let k = 0; k < cnt; k++) S.push({ p: at(pc, k / cnt), tag: pc[4], s: acc + (L * k) / cnt }); acc += L; }
  const lp = pieces[pieces.length - 1]; S.push({ p: at(lp, 1), tag: lp[4], s: acc });
  // heading, bank (from turn rate) and pitch (from climb gradient, slightly exaggerated) per sample
  const N = S.length; S.forEach((o, i) => { const a = S[Math.max(0, i - 2)].p, b = S[Math.min(N - 1, i + 2)].p; o.yaw = Math.atan2(b[2] - a[2], b[0] - a[0]) * 180 / Math.PI; o.pitch = Math.atan2(b[1] - a[1], Math.hypot(b[0] - a[0], b[2] - a[2])) * 180 / Math.PI * 1.4; });
  S.forEach((o, i) => { const a = S[Math.max(0, i - 4)], b = S[Math.min(N - 1, i + 4)]; let d = b.yaw - a.yaw; while (d > 180) d -= 360; while (d < -180) d += 360; const ds = Math.max(1e-3, b.s - a.s); o.bank = o.p[1] > 1 ? Math.max(-30, Math.min(30, (d / ds) * 30)) : 0; });
  for (let r = 0; r < 4; r++) S.forEach((o, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(N - 1, i + 1)]; o.bank = (a.bank + o.bank * 2 + b.bank) / 4; });
  return { S, len: acc, loop }; }
// 7-segment digits painted on the runway (unit cell 1 wide, 2 tall)
const SEG = { a: [[0, 2], [1, 2]], b: [[1, 2], [1, 1]], c: [[1, 1], [1, 0]], d: [[0, 0], [1, 0]], e: [[0, 1], [0, 0]], f: [[0, 2], [0, 1]], g: [[0, 1], [1, 1]] };
const DIG = { 9: "abcdfg", 2: "abged", 7: "abc" };
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "capin pt3", corners: { tl: "Schematic" } });
  const still = reduced();
  const S = planeStage(F.stage, { view: { tg: [125, 8, -60], az: 90, el: 56, d: 520 }, orbit: false, maxFps: 30 }); const T = S.THREE;
  S.pivot.children[0].scale.setScalar(K); S.pivot.children[0].position.copy(S.CG).multiplyScalar(-K);
  const world = new T.Group(); S.scene.add(world);
  const res = new T.Vector2(1, 1), mats = [];
  const lm = (color, width, opacity) => { const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false }); mats.push(m); return m; };
  const segs = (pairs, mat) => { const g = new LineSegmentsGeometry(); g.setPositions(new Float32Array(pairs.flat(2))); const l = new LineSegments2(g, mat); l.frustumCulled = false; world.add(l); return l; };
  const INK = 0xf2f1ec, ACC = 0x3b82f6;
  // ground: faint grid; runway outline, threshold bars, numbers, centerline, aiming-point blocks
  const grid = new T.GridHelper(700, 28, INK, INK); grid.material.transparent = true; grid.material.opacity = 0.05; grid.position.set(RWL / 2, 0, 0); world.add(grid);
  const w = RWW / 2, rw = [[[0, 0, -w], [RWL, 0, -w]], [[0, 0, w], [RWL, 0, w]], [[0, 0, -w], [0, 0, w]], [[RWL, 0, -w], [RWL, 0, w]]];
  for (let x = 34; x < RWL - 34; x += 12) rw.push([[x, 0, 0], [x + 6, 0, 0]]);
  for (const [x0, dir] of [[2, 1], [RWL - 2, -1]]) { for (let z = -w + 3; z <= w - 3 + 1e-6; z += 3) rw.push([[x0, 0, z], [x0 + dir * 7, 0, z]]);
    // aiming point: two blocks either side of the centerline
    for (const zz of [-6, 6]) { const xa = x0 + dir * 48, xb = xa + dir * 10; rw.push([[xa, 0, zz - 1.5], [xb, 0, zz - 1.5]], [[xa, 0, zz + 1.5], [xb, 0, zz + 1.5]], [[xa, 0, zz - 1.5], [xa, 0, zz + 1.5]], [[xb, 0, zz - 1.5], [xb, 0, zz + 1.5]]); } }
  // numbers read by the pilot on approach: "9" at the west end (landing east), "27" at the east end (landing west)
  const paint = (str, x0, dir) => { const hgt = 5, wid = 3.2, gap = 1.6, tot = str.length * wid + (str.length - 1) * gap; [...str].forEach((ch, i) => { const u0 = -tot / 2 + i * (wid + gap);
      for (const k of DIG[ch]) { const [p, q] = SEG[k]; const map = ([u, v]) => [x0 + dir * v * hgt / 2 * 1.6, 0, dir * (u0 + u * wid)]; rw.push([map(p), map(q)]); } }); };
  paint("9", 12, 1); paint("27", RWL - 12, -1);
  segs(rw, lm(INK, 1.3, 0.8));
  let windL = null; const mWind = lm(INK, 1.6, 0.7);
  const windArrow = () => { kill(windL); const z = -side * 46, x0 = RWL * 0.62, x1 = RWL * 0.38; windL = segs([[[x0, 0, z], [x1, 0, z]], [[x1, 0, z], [x1 + 9, 0, z - 5]], [[x1, 0, z], [x1 + 9, 0, z + 5]]], mWind); };
  // the path: solid, dim white; the current (or picked) leg in the accent; corner drop lines show height; a blue line under the airplane
  let side = opts.right ? 1 : -1, mode = opts.entries ? "e45" : "circuit", pick = "live", P = null, curTag = null, t0 = performance.now();
  let ghost = null, faint = null, drops = null, accent = null, entryL = null;
  const pairsOf = (S0, f = () => true) => { const out = []; for (let i = 0; i + 1 < S0.length; i++) if (f(S0[i])) out.push([S0[i].p, S0[i + 1].p]); return out; };
  function kill(l) { if (l) { world.remove(l); l.geometry.dispose(); } }
  const mFaint = lm(INK, 1.6, 0.42), mGhost = lm(INK, 1.2, 0.16), mDrop = lm(INK, 1, 0.16), mAcc = lm(ACC, 3.4, 1), mEntry = lm(ACC, 2, 0.5), mShadow = lm(ACC, 1.4, 0.7);
  const shadow = segs([[[0, 0, 0], [0, 1, 0]]], mShadow); const shArr = shadow.geometry.attributes.instanceStart.data;
  function rebuild() { P = build(PATHS[mode], side); [ghost, faint, drops, accent, entryL].forEach(kill); accent = null; entryL = null; ghost = null;
    if (mode !== "circuit") ghost = segs(pairsOf(build(PATHS.circuit, side).S), mGhost);
    faint = segs(pairsOf(P.S), mFaint); windArrow();
    const def = PATHS[mode]; const dp = def.pts.filter((p) => p[1] > 2).map((p) => [[p[0], p[1], p[2] * side], [p[0], 0, p[2] * side]]); drops = dp.length ? segs(dp, mDrop) : null;
    if (mode !== "circuit" && def.entry) { const [a, b] = def.entry;
      const near = (q) => P.S.reduce((bi, o, i) => (Math.hypot(o.p[0] - q[0], o.p[2] - q[2] * side) < Math.hypot(P.S[bi].p[0] - q[0], P.S[bi].p[2] - q[2] * side) ? i : bi), 0);
      const lo = near(def.pts[a]), hi = near(def.pts[b]); if (hi > lo) entryL = segs(pairsOf(P.S.slice(lo, hi + 1)), mEntry); }
    curTag = null; setAccent(); placeTags(); fit(); }
  function setAccent() { const tag = pick === "live" ? curTag : pick; kill(accent); accent = null; if (!tag) return; const pr = pairsOf(P.S, (o) => o.tag === tag); if (pr.length) accent = segs(pr, mAcc); tagEls.forEach((e) => e.classList.toggle("on", e.dataset.k === tag)); }
  // labels sit OUTSIDE the track: each leg's tag is pushed away from the pattern's middle
  const TAG = "position:absolute;left:0;top:0;z-index:3;pointer-events:none;white-space:nowrap;font:600 10px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:rgba(242,241,236,.8);background:rgba(10,10,11,.72);border:1px solid rgba(242,241,236,.25);border-radius:4px;padding:4px 6px;transform:translate(-50%,-50%)";
  const sty = document.createElement("style"); sty.textContent = ".pt3-tag.on{color:#bfdbfe!important;border-color:#3b82f6!important}.pt3-tag.wind{border-color:transparent!important;background:none!important;color:rgba(242,241,236,.6)!important}"; F.stage.append(sty);
  const tagEls = []; const mkTag = (k, text) => { const e = document.createElement("div"); e.className = "pt3-tag"; e.dataset.k = k; e.style.cssText = TAG; e.textContent = text; e.setAttribute("aria-hidden", "true"); F.stage.append(e); tagEls.push(e); return e; };
  ["dep", "xw", "dw", "base", "final"].forEach((k) => mkTag(k, NAME[k])); mkTag("wind", "Wind 090°").classList.add("wind");
  let tagPos = {};
  function placeTags() { const z = side, has = (k) => P.S.some((o) => o.tag === k);
    tagPos = { dw: [RWL / 2, PA, z * (OFF + 26)], xw: [XX - 8, PA * 0.9, z * OFF * 0.5, "in"], base: [BX + 8, 40, z * OFF * 0.5, "in"], final: [BX * 0.5, 0, -z * 34], dep: [(RWL + XX) / 2 + 6, 0, -z * 34], wind: [RWL / 2, 0, -z * 60] };
    if (mode !== "circuit") for (const k of ["dep", "xw", "dw", "base", "final"]) if (!has(k)) delete tagPos[k];
    if (mode === "out") tagPos.dep = [XX + 50, PA, z * 26];
    if (mode === "e45" || mode === "mid") tagPos.dw = [RWL * 0.2, PA, z * (OFF + 26)]; }   // keep the label off the entry line, which joins at midfield
  function drawTags() { tagEls.forEach((e) => { const p3 = tagPos[e.dataset.k]; if (!p3) { e.style.display = "none"; return; } const q = S.project(p3, false); e.style.display = ""; e.style.left = Math.round(q.x) + "px"; e.style.top = Math.round(q.y) + "px";
      // "in" tags sit just inside the rectangle beside their leg: the label grows toward the pattern's middle, never across the line
      if (p3[3] === "in") { const c = S.project([(BX + XX) / 2, PA, side * OFF * 0.5], false); e.style.transform = q.x > c.x ? "translate(-100%,-50%)" : "translate(0,-50%)"; } }); }
  // camera: look straight across the runway from the side away from the pattern, then fit the whole scene in the stage
  const BOX = { circuit: [BX - 12, XX + 12, -66, OFF + 26], e45: [BX - 12, RWL / 2 + 130, -66, OFF + 130], mid: [BX - 12, XX + 12, -136, OFF + 26], out: [-10, XX + 120, -66, 130], si: [-205, RWL + 10, -66, 40] };
  const cam = new T.PerspectiveCamera(34, 1, 0.1, 4000), EL = 60;
  function fit(dur = 1) { const r = F.stage.getBoundingClientRect(); const band = +(F.stage.dataset.band || 0); const asp = r.width / Math.max(1, r.height - band); if (!r.width) return;
    const [x0, x1, za, zb] = BOX[mode], zlo = Math.min(za * side, zb * side), zhi = Math.max(za * side, zb * side), tg = [(x0 + x1) / 2, 0, (zlo + zhi) / 2];
    const corners = []; for (const x of [x0, x1]) for (const zz of [zlo, zhi]) for (const y of [0, PA]) corners.push(new T.Vector3(x, y, zz));
    cam.aspect = asp; cam.updateProjectionMatrix(); const az = side < 0 ? 90 : -90; let lo = 50, hi = 3000;
    for (let it = 0; it < 30; it++) { const d = (lo + hi) / 2; const e = EL * Math.PI / 180, a = az * Math.PI / 180; cam.position.set(tg[0] + d * Math.cos(e) * Math.cos(a), tg[1] + d * Math.sin(e), tg[2] + d * Math.cos(e) * Math.sin(a)); cam.lookAt(...tg); cam.updateMatrixWorld();
      const ok = corners.every((c) => { const q = c.clone().project(cam); return Math.abs(q.x) < 0.96 && q.y < 0.86 && q.y > -0.94; }); if (ok) hi = d; else lo = d; }
    S.setView({ tg, az, el: EL, d: hi }, dur); }
  new ResizeObserver(() => fit()).observe(F.stage);
  const SPEED = 34;   // schematic units per second: one circuit in about 30 s
  function frameAt(now) { const r = S.renderer.getDrawingBufferSize(new T.Vector2()); if (r.x !== res.x || r.y !== res.y) { res.copy(r); mats.forEach((m) => m.resolution.copy(res)); }
    const dist = still ? stillS() : ((now - t0) / 1000) * SPEED; let s = P.loop ? dist % P.len : dist % (P.len + 45);
    if (!P.loop && s > P.len) s = P.len;   // pause at the end of an entry demo, then start over
    const S0 = P.S; let lo = 0, hi = S0.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S0[m].s <= s) lo = m; else hi = m; }
    const a = S0[lo], b = S0[hi], t = Math.min(1, Math.max(0, (s - a.s) / Math.max(1e-6, b.s - a.s)));
    const p = a.p.map((v, i) => v + (b.p[i] - v) * t); let dy = b.yaw - a.yaw; while (dy > 180) dy -= 360; while (dy < -180) dy += 360;
    S.pivot.position.set(p[0], p[1] + S.CG.y * K, p[2]); S.setAttitude({ yaw: a.yaw + dy * t, bank: a.bank + (b.bank - a.bank) * t, pitch: a.pitch + (b.pitch - a.pitch) * t });
    shArr.array.set([p[0], 0, p[2], p[0], Math.max(0, p[1]), p[2]]); shArr.needsUpdate = true; shadow.visible = p[1] > 1.5;
    if (a.tag !== curTag) { curTag = a.tag; if (pick === "live") { setAccent(); if (mode === "circuit") say(curTag); } }
    drawTags(); return !still; }
  function stillS() { const d = P.S.filter((o) => o.tag === "dw"); return d.length ? d[Math.floor(d.length / 2)].s : P.len * 0.45; }
  function say(k) { const L = LEGS[k] || ENTRY[k]; if (!L) return; F.caption(L[0], L[1]); F.explain(L[2]); }
  // controls: direction, then legs (legs page) or entries (entries page)
  const r1 = row(F.ctrl, "Pattern"); chips(r1, [["-1", "Left traffic"], ["1", "Right traffic"]], String(side), (v) => { side = +v; rebuild(); fit(900); intro(); }, { label: "Pattern direction" });
  if (opts.entries) { const r2 = row(F.ctrl, "Fly"); chips(r2, [["e45", "45° entry"], ["mid", "Midfield"], ["out", "Departure"], ["si", "Straight-in"], ["circuit", "Full circuit"]], mode, (v) => { mode = v; t0 = performance.now(); rebuild(); fit(900); if (ENTRY[v]) say(v); else intro(); }, { label: "Entries and exits" }); }
  else { const r2 = row(F.ctrl, "Leg"); chips(r2, [["live", "Follow"], ["dep", "Upwind"], ["xw", "Crosswind"], ["dw", "Downwind"], ["base", "Base"], ["final", "Final"]], "live", (v) => { pick = v; setAccent(); if (v === "live") { if (curTag) say(curTag); } else say(v); }, { label: "Pattern leg" }); }
  function intro() { if (mode !== "circuit" && ENTRY[mode]) return say(mode); F.caption(side < 0 ? "Left traffic · runway 9" : "Right traffic · runway 9", "Pick a leg, or follow the airplane"); F.explain((side < 0 ? "Left traffic is the default: at a non-towered airport in Class G, fixed-wing airplanes make all turns to the left unless approved lights or markings show right traffic. <span class=\"src\">14 CFR 91.126(b)</span>" : "Right traffic is used only where the airport shows it with approved lights or markings (or the Chart Supplement lists it). Look for traffic pattern indicators at the segmented circle. <span class=\"src\">14 CFR 91.126(b)</span>") + " <span class=\"src\">Schematic: the pattern is drawn to scale for a 5,000 ft runway and 1,000 ft pattern altitude; the runway width and the airplane are enlarged.</span>"); }
  rebuild(); intro();
  S.animate((now) => frameAt(now), { idle: still });
  if (still) frameAt(performance.now());
  return { destroy() { kill(windL); [ghost, faint, drops, accent, entryL, shadow].forEach(kill); mats.forEach((m) => m.dispose()); S.destroy(); F.destroy(); } };
}
