// Ignition and the magneto check, on a 3D flat-four engine seen from behind and above (planeStage): two magnetos on the
// accessory case, a harness lead from each to one plug in every cylinder, and the P-leads that run to the key. Turn the
// key (OFF-R-L-BOTH-START) in the strip below, watch which leads and plugs fire and what the runup tach does at 1,800 RPM,
// then try the faults. Facts: C172S POH Sec 7 (two magnetos, two plugs per cylinder: right
// magneto fires lower right + upper left plugs, left magneto fires lower left + upper right; rotary switch OFF, R, L,
// BOTH, START; START is spring-loaded back to BOTH) and Sec 4 (check at 1,800 RPM: R, BOTH, L, BOTH; drop no more than
// 150 RPM on either, no more than 50 RPM difference; no drop may mean faulty grounding or advanced timing).
// PHAK 7: no drop is not normal; if the engine quits on one magneto or the drop exceeds limits, don't fly; a broken
// magneto ground wire can let the engine fire with the switch OFF, and only idle cutoff stops it.
// The RPM drops shown for each case are examples, not published values.
import { frame, chips, row } from "./base.js?v=0134b87946";
import { planeStage } from "./planestage.js?v=0134b87946";
import { modelKit, fitView } from "./section-models.js?v=0134b87946";
import { h, s, reduced } from "../core/util.js?v=0134b87946";
import * as THREE from "three";
import { T, L, C, R, hit, INK, GRAY, DIM, ACC } from "./kit.js?v=0134b87946";
import { dial, anim, toward, COL } from "./dial.js?v=0134b87946";
const POS = ["OFF", "R", "L", "BOTH", "START"], ANG = { OFF: -84, R: -42, L: 0, BOTH: 42, START: 84 };
const FAULT = {
  normal: { name: "Normal", dR: 75, dL: 100 },
  fouled: { name: "Fouled plug", dR: 75, dL: 225, rough: "L" },
  nodrop: { name: "Broken P-lead", dR: 0, dL: 100, hot: "L" },   // the left P-lead is broken: the left magneto can never be grounded, so the R check shows no drop
  dead: { name: "Dead magneto", dR: 75, dL: null },
};
export function verdict(f) { const F = FAULT[f]; if (F.dL == null || F.dR == null) return "dont"; if (F.dR === 0 || F.dL === 0) return "dont";
  return Math.max(F.dR, F.dL) <= 150 && Math.abs(F.dR - F.dL) <= 50 ? "ok" : "dont"; }
// ---------- 3D engine (inches; x forward, y up, z right). Cylinders 1 and 3 on the right, 2 and 4 on the left (staggered). ----------
const CYL = [{ n: 1, x: 3.4, s: 1 }, { n: 2, x: 1.4, s: -1 }, { n: 3, x: -2.6, s: 1 }, { n: 4, x: -4.6, s: -1 }];
// harness, C172S POH 7: the right magneto fires the lower right and upper left plugs, the left magneto the lower left and upper right
const plugMag = (c, up) => (c.s > 0 ? (up ? "l" : "r") : up ? "r" : "l");
const plugPos = (c, up) => [c.x, up ? 2.55 : -2.55, c.s * 11.2];
const MAG = { r: [-11.6, 2.6, 2.5], l: [-11.6, 2.6, -2.5] }, KEYP = { r: [-19, 3.4, 1.0], l: [-19, 3.4, -1.0] };
const D = Math.PI / 180;
// a rounded-rectangle section (in y-z) extruded along x: crankcase, accessory case, rocker covers
function slab(x0, x1, w, hgt, r, y = 0, z = 0) { const sh = new THREE.Shape(), hw = w / 2, hh = hgt / 2;
  sh.moveTo(-hw + r, -hh); sh.lineTo(hw - r, -hh); sh.quadraticCurveTo(hw, -hh, hw, -hh + r); sh.lineTo(hw, hh - r); sh.quadraticCurveTo(hw, hh, hw - r, hh); sh.lineTo(-hw + r, hh); sh.quadraticCurveTo(-hw, hh, -hw, hh - r); sh.lineTo(-hw, -hh + r); sh.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  const g = new THREE.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.25, bevelSegments: 3, curveSegments: 6 }); g.rotateY(Math.PI / 2); g.translate(x0, y, z); g.computeVertexNormals(); return g; }
function engModel() { const K = modelKit(THREE), root = K.root;
  const alu = new THREE.MeshStandardMaterial({ color: 0xa6abb3, metalness: 0.55, roughness: 0.36 }), paint = new THREE.MeshStandardMaterial({ color: 0x5a5e66, metalness: 0.3, roughness: 0.5 }), black = new THREE.MeshStandardMaterial({ color: 0x24262b, metalness: 0.25, roughness: 0.55 }), white = new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.35 }), pipe = new THREE.MeshStandardMaterial({ color: 0x7c766c, metalness: 0.5, roughness: 0.45 });
  const mesh = (g, m, parent = root) => { const o = new THREE.Mesh(g, m); parent.add(o); return o; };
  const tube = (pts, r, m) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), 32, r, 10), m);
  // crankcase (two halves split on the centerline), sump, accessory case at the rear, prop flange at the front
  mesh(slab(-6.8, 6.6, 7.0, 6.2, 1.6, 0.4), paint); mesh(slab(-6.9, 6.7, 0.25, 6.5, 0.1, 0.4), black);
  mesh(slab(-5.5, 4.5, 6.0, 2.4, 1.0, -3.6), paint);
  mesh(slab(-9.6, -7.1, 9.2, 7.2, 1.8, 1.0), paint);
  { const f = new THREE.CylinderGeometry(2.3, 2.3, 0.9, 36); f.rotateZ(Math.PI / 2); f.translate(7.4, 0.8, 0); mesh(f, alu); const nb = new THREE.CylinderGeometry(1.4, 1.6, 1.0, 32); nb.rotateZ(Math.PI / 2); nb.translate(8.2, 0.8, 0); mesh(nb, alu); }
  // cylinders: finned barrels, finned heads, rocker covers, intake tubes from the sump, short exhaust stacks; two plugs each
  const plugs = [];
  for (const c of CYL) { const prof = []; for (let i = 0; i <= 14; i++) { const z = 3.5 + i * 0.44; prof.push(new THREE.Vector2(i % 2 ? 2.95 : 2.3, z), new THREE.Vector2(i % 2 ? 2.95 : 2.3, z + 0.44)); }
    const bg = new THREE.LatheGeometry(prof, 36); bg.rotateX(c.s * Math.PI / 2); bg.translate(c.x, 0, 0); mesh(bg, alu);
    const hprof = []; for (let i = 0; i <= 7; i++) { const z = 9.9 + i * 0.4; hprof.push(new THREE.Vector2(i % 2 ? 3.35 : 2.8, z), new THREE.Vector2(i % 2 ? 3.35 : 2.8, z + 0.4)); } hprof.push(new THREE.Vector2(2.6, 13.2), new THREE.Vector2(0.01, 13.3));
    const hg = new THREE.LatheGeometry(hprof, 36); hg.rotateX(c.s * Math.PI / 2); hg.translate(c.x, 0.1, 0); mesh(hg, alu);
    mesh(slab(c.x - 2.1, c.x + 2.1, 2.6, 1.2, 0.5, 3.35, c.s * 11.6), black);   // rocker cover
    tube([[c.x, -4.4, c.s * 3.2], [c.x, -4.6, c.s * 7.5], [c.x, -3.4, c.s * 10.6], [c.x, -2.6, c.s * 11.0]], 0.42, alu);   // intake from the sump
    tube([[c.x + 0.9, -2.6, c.s * 11.9], [c.x + 0.9, -4.6, c.s * 12.4], [c.x + 0.6, -6.4, c.s * 12.2]], 0.5, pipe);   // exhaust
    for (const up of [true, false]) { const p = plugPos(c, up), g = new THREE.Group(); g.position.set(...p); root.add(g); g.rotation.x = c.s * (up ? -0.5 : 0.5);
      const ins = new THREE.CylinderGeometry(0.32, 0.38, 1.3, 16); ins.translate(0, up ? 0.65 : -0.65, 0); mesh(ins, white, g);
      const boot = new THREE.CylinderGeometry(0.46, 0.46, 0.9, 16); boot.translate(0, up ? 1.6 : -1.6, 0); mesh(boot, black, g);
      plugs.push({ c, up, g, mag: plugMag(c, up), end: new THREE.Vector3(0, up ? 2.05 : -2.05, 0) }); } }
  // magnetos on the accessory case: body, cap where the harness leaves
  const mags = {}; for (const [k, p] of Object.entries(MAG)) { const g = new THREE.Group(); g.position.set(...p); root.add(g); const b = new THREE.CylinderGeometry(1.45, 1.45, 3.2, 28); b.rotateZ(Math.PI / 2); mesh(b, black, g); const cap = new THREE.CylinderGeometry(1.25, 1.45, 0.9, 28); cap.rotateZ(Math.PI / 2); cap.translate(-2.0, 0, 0); mesh(cap, alu, g); mags[k] = g; }
  K.add("ref", root, null, []);
  // Squawk School ink look: every engine part is a near-black face with thin ink edges (no lighting)
  const ink = new THREE.LineBasicMaterial({ color: 0xf2f1ec, transparent: true, opacity: 0.42 }), ms = []; root.traverse((o) => { if (o.isMesh) ms.push(o); });
  ms.forEach((o) => { o.material = K.faceMat; const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 24), ink); e.position.copy(o.position); e.rotation.copy(o.rotation); e.scale.copy(o.scale); o.parent.add(e); });
  return K.model({ plugs, mags }); }
// Harness: each magneto's leads leave its cap as one bundle. The leads to the plugs on the magneto's own side run along a
// low rail on that side; the leads to the other bank cross behind the accessory case (never over the crankcase) and run
// along a high rail above the far bank's rocker covers. Leads in a bundle sit side by side, a little apart.
function leadPts(mag, pl, slot) { const k = mag, sm = k === "r" ? 1 : -1, cap = [MAG[k][0] - 2.45, MAG[k][1], MAG[k][2]], end = pl.g.localToWorld(pl.end.clone()).toArray(), o = slot * 0.34, sp = pl.c.s;
  if (pl.up) { const back = k === "r" ? -15.0 : -16.2, hy = k === "r" ? 6.2 : 7.0;   // crossover heights differ so the two bundles stay apart
    return [cap, [cap[0] - 1.0, cap[1] + 1.6, cap[2]], [back, hy, sm * 1.2 + o], [back, hy, -sm * 3.5 + o], [-8.6, hy - 0.4, sp * (8.6 + o)], [pl.c.x - 1.8, 5.6, sp * (9.8 + o)], [end[0], end[1] + 0.9, end[2]], end]; }
  return [cap, [cap[0] - 0.8, cap[1] - 1.2, cap[2] + sm * 0.8], [-13.2, 0.4, sm * (5.4 + o)], [-8.2, -1.6, sm * (8.9 + o)], [pl.c.x - 1.8, -3.0, sm * (9.8 + o)], [end[0], end[1] - 0.6, end[2]], end]; }
export function mount(host) {
  let pos = "BOTH", fault = "normal", rpm = 1800, running = true, crank = 0, log = {};
  const F = frame(host, { cls: "capin sec3d mag3d", corners: { tl: "Ignition · runup at 1,800 RPM", tr: "POH 4, 7 · PHAK 7" } });
  F.root.dataset.live = "1";   // plugs flicker while the engine runs on screen; zero frames offscreen
  const S = planeStage(F.stage, { model: engModel, cg: [0, 0, 0], orbit: false, maxFps: 30, fov: 24, view: { tg: [-3, 1, 0], az: -148, el: 36, d: 70, fov: 24 } });
  const M3 = S.P;
  // the camera glides to the part in question: cylinder 1 for a fouled plug, low behind the magnetos for a P-lead
  const CAMS = { normal: [-158, 46], fouled: [-138, 58], nodrop: [-172, 22], dead: [-172, 30] };
  const VZ = { az: -158, el: 46, fov: 24 }, FIT = [[-20.5, 3.4, 0], [-20.5, 3.4, -1.5], [8, 0, 0], [-13, 7, 0], [-11.6, -1.2, 2.5], [-11.6, -1.2, -2.5]];
  for (const c of CYL) for (const dx of [-2.8, 2.8]) for (const y of [-3.4, 4.6]) FIT.push([c.x + dx, y, c.s * 13.1]);
  const band = (dur = 1) => { const sr = F.stage.getBoundingClientRect(); if (!sr.height) return; let b = 0; F.stage.querySelectorAll(".corner").forEach((c) => { if (c.textContent.trim()) b = Math.max(b, c.getBoundingClientRect().bottom - sr.top); }); S.setTopBand(b ? b + 4 : 0);
    const Hh = Math.max(1, sr.height - (+F.stage.dataset.band || 0)); S.setView(fitView(THREE, FIT, VZ, sr.width / Hh, 0.9, 0.84), typeof dur === "number" ? dur : 1); labDirty = performance.now() + (typeof dur === "number" && dur > 1 ? dur + 200 : 400); S.kick(); };
  let labDirty = 0; const bro = new ResizeObserver(() => band()); bro.observe(F.stage); F.on(() => bro.disconnect());
  // harness leads and P-leads as real 3D wires (depth-tested): gray insulation, glowing in the magneto's color while it fires
  const COLM = { r: 0x3b82f6, l: 0xf2f1ec }, wireG = (pts, r = 0.17) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)), false, "catmullrom", 0.2), 64, r, 8);
  const slots = { r: { up: 0, lo: 0 }, l: { up: 0, lo: 0 } };
  const leads = M3.plugs.map((pl) => { const k = pl.mag, sl = slots[k][pl.up ? "up" : "lo"]++, mat = new THREE.MeshBasicMaterial({ color: 0x6b6e75 });
    const m = new THREE.Mesh(wireG(leadPts(k, pl, sl)), mat); M3.root.add(m); return { pl, mat }; });
  const pl2 = {}; for (const k of ["r", "l"]) { const a = [MAG[k][0] - 0.6, MAG[k][1] + 1.45, MAG[k][2]], c = KEYP[k]; const sm = k === "r" ? 1 : -1;
    const pts = [a, [a[0] - 1.2, a[1] + 0.9, a[2]], [a[0] - 3.6, c[1] + 0.6, c[2] + sm * 0.6], c];
    const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), mat = new THREE.MeshBasicMaterial({ color: 0x8a8d94 });
    const whole = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.13, 8), mat), cut = [0, 1].map((j) => { const pp = Array.from({ length: 9 }, (_, i) => curve.getPoint(j ? 0.62 + 0.38 * (i / 8) : 0.5 * (i / 8))); return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp), 16, 0.13, 8), mat); });
    const ends = [0.5, 0.62].map((u) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), new THREE.MeshBasicMaterial({ color: 0xe0503e })); e.position.copy(curve.getPoint(u)); return e; });
    M3.root.add(whole, ...cut, ...ends); pl2[k] = { mat, whole, cut, ends, mid: curve.getPoint(0.56).toArray(), end: c }; }
  // spark flashes at the plug tips
  const sMat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthTest: true, blending: THREE.AdditiveBlending });
  const flashes = M3.plugs.map((pl) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), sMat(pl.mag === "r" ? 0x7fb0ff : 0xffffff)); m.position.copy(pl.g.localToWorld(new THREE.Vector3(0, pl.up ? -0.3 : 0.3, 0))); m.renderOrder = 8; S.scene.add(m); return m; });
  // labels over the stage
  const lab = s("svg", { class: "full lab3d", role: "img" }, F.stage); let lg = s("g", {}, lab);
  function labels() { const W = F.stage.clientWidth, H = F.stage.clientHeight, ph = W < 520, Fa = FAULT[fault]; lab.setAttribute("viewBox", `0 0 ${W} ${H}`); lg.remove(); lg = s("g", {}, lab); const f = shown();
    const at = (p, str, o = {}) => { const q = S.project(p, false); return T(lg, Math.max(6, Math.min(W - 6, q.x + (o.dx || 0))), q.y + (o.dy || 0), str, { size: 11, anchor: o.anchor || "middle", fill: o.fill || GRAY, weight: o.w }); };
    const live = running || crank > 0;
    at([MAG.r[0] - 1, MAG.r[1] - 1.6, MAG.r[2] + 1.6], ph ? "right mag" : "right magneto", { dy: 14, anchor: "start", dx: 2, fill: f.r && live ? ACC : GRAY, w: 600 });
    at([MAG.l[0] - 1, MAG.l[1] - 1.6, MAG.l[2] - 1.6], ph ? "left mag" : "left magneto", { dy: 14, anchor: "end", dx: -2, fill: f.l && live ? INK : GRAY, w: 600 });
    at([KEYP.l[0], KEYP.l[1], 0], ph ? "P-leads to key" : "P-leads to the key", { dy: 16, fill: GRAY });
    for (const c of CYL) { const e = at([c.x, 4.2, c.s * 12.4], "cyl " + c.n + (Fa.rough && c.n === 1 ? " fouled" : ""), { dy: -8, fill: Fa.rough && c.n === 1 ? COL.yellow : INK, w: 600 }); e.setAttribute("font-size", "12"); e.setAttribute("stroke", "#000"); e.setAttribute("stroke-width", "3"); e.setAttribute("paint-order", "stroke"); }
    if (crank > 0) at([8.4, 0.8, 0], "starter cranking", { dy: -22, fill: ACC, w: 600 });
    if (Fa.hot) at([KEYP.l[0], KEYP.l[1], 0], (Fa.hot === "L" ? "left" : "right") + " P-lead broken", { dy: 31, fill: COL.red }); }
  // which plugs fire: flicker in firing order 1-3-2-4 while running or cranking
  let ph0 = 0; const ORDER = [1, 3, 2, 4];
  function scene3d(now = performance.now()) { const f = shown(), Fa = FAULT[fault], live = (running && rpm > 150) || crank > 0, rate = crank > 0 ? 1.2 : 2.6;
    const cur = ORDER[Math.floor(((now / 1000) * rate * 4) % 4)];
    leads.forEach(({ pl, mat }, i) => { const on = live && f[pl.mag], fouled = Fa.rough && pl.c.n === 1 && pl.up, pulse = on && pl.c.n === cur && !reduced();
      mat.color.set(on ? COLM[pl.mag] : 0x6b6e75); if (on && !pulse) mat.color.multiplyScalar(0.62); flashes[i].material.opacity = on && !fouled && (pulse || reduced()) ? (reduced() ? 0.6 : 0.9) : 0; });
    const hot = (Fa.hot || "").toLowerCase();
    for (const k of ["r", "l"]) { const q = pl2[k], grounded = !f[k] && pos !== "START", br = k === hot; q.whole.visible = !br; q.cut.forEach((m) => (m.visible = br)); q.ends.forEach((m) => (m.visible = br));
      q.mat.color.set(grounded ? 0xb9bcc3 : 0x55575d); }
    if (now < labDirty || !lgDone) { labels(); lgDone = now >= labDirty; } }
  let lgDone = false; S.setFlow(true, (now) => scene3d(now));
  // strip: the key switch (tappable), the tach and the check log
  const strip = h("div", { class: "vstrip" }); F.stage.after(strip); const sv = s("svg", { class: "full", role: "img" }, strip); let sg = s("g", {}, sv);
  const sro = new ResizeObserver(() => redraw()); sro.observe(strip); F.on(() => sro.disconnect());
  const rk = row(F.ctrl, "Key"); const keyC = chips(rk, POS.map((p) => [p, p]), pos, (p) => setPos(p || pos), { label: "Key" });
  const rf = row(F.ctrl, "Case"); chips(rf, Object.entries(FAULT).map(([k, v]) => [k, v.name]), fault, (k) => { fault = k || "normal"; log = {}; running = true; const cv = CAMS[fault] || CAMS.normal; VZ.az = cv[0]; VZ.el = cv[1]; band(1400); setPos("BOTH"); }, { label: "Case" });
  let tach = null;
  const A = anim(F, (dt) => { let m1 = false, m2 = false; if (crank > 0) { crank -= dt; m1 = true; if (crank <= 0) { running = true; pos = "BOTH"; keyC.set(pos); redraw(); } }
    [rpm, m2] = toward(rpm, target(), 3.2, dt, 0.5); if (running && rpm < 200 && target() === 0) { running = false; redraw(); } tach && tach.set(rpm); return m1 || m2; });
  // what the 3D shows: at START the POH only says the starter cranks, so no magneto is emphasized there
  const shown = () => (pos === "START" || crank > 0 ? { r: false, l: false } : firing());
  // a magneto fires unless the key grounds it through its P-lead; a broken P-lead means it can't be grounded
  function firing(p = pos) { const Fa = FAULT[fault], hot = (Fa.hot || "").toLowerCase(); const r = p === "R" || p === "BOTH" || p === "START" || hot === "r", l = (p === "L" || p === "BOTH" || p === "START" || hot === "l") && Fa.dL != null; return { r, l }; }
  function target() { if (crank > 0) return 300; if (!running) return 0; const Fa = FAULT[fault], f = firing();
    if (!f.r && !f.l) return 0; if (f.r && f.l) return 1800; if (f.r) return 1800 - Fa.dR; return 1800 - Fa.dL; }
  function setPos(p) { pos = p; keyC.set(p); if (p === "START") { crank = 1.6; } else if (running) { const t = target(); if (p === "R" || p === "L") log[p] = t ? 1800 - t : "quit"; }
    lgDone = false; redraw(); A.kick(); S.kick(); }
  function redraw() { const W = strip.clientWidth || 600; sg.remove(); sg = s("g", {}, sv); const Hh = draw(sg, W); sv.setAttribute("viewBox", `0 0 ${W} ${Hh}`); sv.setAttribute("height", Hh); strip.style.height = Hh + "px"; lgDone = false; S.kick(); }
  function draw(g, W) {
    const Fa = FAULT[fault], wide = W >= 600, kr = wide ? 46 : 40; let Hh = 176;
    // key switch
    const kx = 16 + kr + 34, ky = 26 + kr + 18;
    C(g, kx, ky, kr, { fill: "#0d0d10", stroke: GRAY, sw: 1.4 });
    POS.forEach((p) => { const a = (ANG[p] * Math.PI) / 180, x = kx + Math.sin(a) * (kr + 16), y = ky - Math.cos(a) * (kr + 16);
      T(g, x, y + 4, p, { size: 11, anchor: Math.abs(ANG[p]) > 60 ? (ANG[p] < 0 ? "end" : "start") : "middle", fill: p === pos ? ACC : GRAY, weight: p === pos ? 700 : 500 });
      const hz = C(g, x, y, 16, { fill: "transparent" }); hit(g, hz, "Key " + p, () => setPos(p)); });
    const a = (ANG[pos] * Math.PI) / 180; L(g, kx - Math.sin(a) * kr * 0.55, ky + Math.cos(a) * kr * 0.55, kx + Math.sin(a) * kr * 0.75, ky - Math.cos(a) * kr * 0.75, { stroke: INK, w: 8 });
    C(g, kx, ky, 5, { fill: ACC }); T(g, kx, ky + kr + 22, pos === "START" ? "spring-loaded" : "ignition switch", { size: 11, anchor: "middle", fill: GRAY });
    // tach
    const tr = wide ? 62 : 58, tx = wide ? kx + kr + 60 + tr : W - 16 - tr, ty = ky;
    tach = dial(g, tx, ty, tr, { min: 0, max: 3000, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [500, 1000, 1500, 2000, 2500], nums: [[1000, "10"], [2000, "20"]], title: "RPM ×100", focus: true, fmt: (v) => String(Math.round(v / 5) * 5) }); tach.set(rpm);
    // check log
    const lx = wide ? tx + tr + 28 : 16, ly = wide ? 30 : ky + kr + 52, lw = (wide ? W - 16 : W - 16) - lx;
    const rows = [["Right mag drop", log.R === undefined ? "–" : log.R === "quit" ? "quits" : log.R + " RPM", log.R === "quit" || log.R === 0 || log.R > 150], ["Left mag drop", log.L === undefined ? "–" : log.L === "quit" ? "quits" : log.L + " RPM", log.L === "quit" || log.L === 0 || log.L > 150], ["Limits (172S)", "150 max · 50 apart", false]];
    T(g, lx, ly, "Mag check", { size: 11, fill: INK, weight: 600 });
    rows.forEach(([k, v, bad], i) => { const y = ly + 26 + i * 26; T(g, lx, y, k, { size: 11, fill: GRAY }); T(g, lx + lw, y, v, { size: 12, anchor: "end", fill: bad ? COL.red : INK, weight: 600 }); L(g, lx, y + 9, lx + lw, y + 9, { stroke: "rgba(242,241,236,.07)", w: 1 }); });
    const done = log.R !== undefined && log.L !== undefined, vd = verdict(fault); if (!wide) Hh = ly + 26 * 4 + 16;
    T(g, lx, ly + 26 * 4 + 2, done ? (vd === "ok" ? "Within limits: OK to fly" : "Out of limits: don't fly") : "R, BOTH, L, BOTH", { size: 12, fill: done ? (vd === "ok" ? COL.green : COL.red) : GRAY, weight: 600 });
    // caption
    const drop = (k) => (log[k] === undefined ? "–" : log[k] === "quit" ? "quits" : log[k] + " RPM");
    let cap;
    if (!running) cap = ["Engine stopped",  "Key to START to crank it again."];
    else if (crank > 0) cap = ["Cranking", "START closes the starter contactor and the starter cranks the engine. Release and the key springs back to BOTH. Which magnetos fire at START: check your airplane's POH."];
    else if (pos === "OFF" && Fa.hot) cap = ["Still running with the key OFF", "The left magneto's P-lead is broken, so OFF can't ground it. Only idle cutoff stops this engine. Treat every prop as live."];
    else if (pos === "BOTH") cap = ["Both magnetos", log.R !== undefined && log.L !== undefined ? `Right drop ${drop("R")}, left drop ${drop("L")}. ${verdict(fault) === "ok" ? "Within limits: OK to fly." : "Out of limits: don't fly."}` : "Turn the key to R, back to BOTH, then L, back to BOTH."];
    else if (pos === "R" || pos === "L") { const d = log[pos]; cap = [pos === "R" ? "Right magneto only" : "Left magneto only", d === "quit" ? "The engine quits on this magneto. Don't fly." : d === 0 ? "No drop. That's not normal: suspect a broken P-lead (ground wire) or timing. Don't fly." : `Drop ${d} RPM (example). Limit 150 RPM, and 50 RPM difference between sides.`]; }
    else cap = ["Key OFF", "Both P-leads grounded, so neither magneto fires. The engine stops."];
    F.caption(cap[0], cap[1]); return Hh; }
  F.explain(`<p>Each magneto fires one of the two plugs in every cylinder, so either one alone keeps the engine running, with a small RPM drop. The key works by grounding: a magneto's P-lead runs to the switch, and grounding it stops that magneto from firing. The check: R, back to BOTH to clear the plugs, L, back to BOTH. Your airplane's POH gives the limits; in the 172S, 150 RPM max drop and 50 RPM max difference. Magnetos don't need the battery or the master switch.</p>`);
  band(); redraw();
  return { destroy: () => { A.stop(); S.destroy(); F.destroy(); } };
}
