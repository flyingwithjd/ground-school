// Subcomponents overlay for the 172 (GL1 "subs"), called from plane3d mode "systems". Airframe and flight controls light
// model parts. Electrical and brakes add x-ray pieces the model doesn't have (drawn on top in blue, with leader labels),
// placed per the C172S POH Sec 7:
//  - main battery on the left forward side of the firewall, inside the cowling; belt-driven 60 A alternator and the starter
//    on the front of the engine; MASTER switch (ALT/BAT) on the pilot's switch panel and the circuit breaker panel along
//    the lower left of the instrument panel; navigation lights on the wing tips and top of the rudder, landing/taxi lights
//    in the left wing leading edge, flashing beacon on top of the fin, a strobe on each wing tip, and a heated
//    pitot tube (short L) on the lower surface of the left wing just outboard of the strut.
//  - a single-disc, hydraulically actuated brake on the inboard side of each MAIN wheel (none on the nose wheel), each
//    connected by a hydraulic line to a master cylinder on the pilot's rudder pedal; braking is by toe pressure on the
//    tops of the pedals.
// Coordinates are the model's (x forward, y up, z right; firewall x 3.62 = FS 0, mains x -1.22, track 4.1 ft each side).
// Exact routing of wires and lines is schematic; locations of the parts follow the POH.
import { chips } from "./base.js?v=964a60d052";
import { tags3d } from "./tags3d.js?v=964a60d052";
import { glowSprite, lightPulse, landingBeam } from "./lightglow.js?v=964a60d052";
import { buildPitot } from "./pitot3d.js?v=964a60d052";
import { rich } from "../core/rich.js?v=964a60d052";
import { h } from "../core/util.js?v=964a60d052";
const ACC = 0x3b82f6, XM = -1.22, WZ = -4.1;
export function systems(S, F, { cowl, animatePose }) {
  const THREE = S.THREE, G = S.cueGroup, groups = { elec: new THREE.Group(), brk: new THREE.Group(), brkLine: new THREE.Group(), pedals: new THREE.Group() };
  Object.values(groups).forEach((g) => { g.visible = false; G.add(g); });
  const fill = new THREE.MeshBasicMaterial({ color: 0x0c2c6e, transparent: true, opacity: 0.85, depthTest: false, depthWrite: false });
  const edge = new THREE.LineBasicMaterial({ color: ACC, transparent: true, depthTest: false });
  const solid = (geo, at, grp, rot) => { const m = new THREE.Mesh(geo, fill); const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edge); [m, e].forEach((o) => { o.position.set(...at); if (rot) o.rotation.set(...rot); o.renderOrder = 8; grp.add(o); }); };
  const lines = []; const wire = (pts, grp, w = 2.2) => { const l = S.cueLine(pts.length, { color: ACC, width: w, opacity: 0.95 }); l.set(pts); l.obj.material.depthTest = false; l.obj.renderOrder = 9; G.remove(l.obj); grp.add(l.obj); lines.push(l); };
  // ---- electrical ----
  const E = groups.elec, BAT = [3.95, 4.2, -0.95], ALT = [6.7, 4.35, -0.65], STR = [6.5, 3.55, 0.45], BUS = [2.15, 4.55, -1.05], AV = [2.15, 5.35, 0];
  const LDG = [1.62, 6.72, -7.6], TIPL = [0.1, 7.12, -18.0], TIPR = [0.1, 7.12, 18.0], BCN = [-17.75, 9.05, 0], TAIL = [-18.95, 8.55, 0], STBL = [-0.75, 7.30, -18.65], STBR = [-0.75, 7.30, 18.65];
  solid(new THREE.BoxGeometry(0.75, 0.6, 0.45), BAT, E); solid(new THREE.CylinderGeometry(0.28, 0.28, 0.32, 16), ALT, E, [Math.PI / 2, 0, 0]); solid(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 14), STR, E, [0, 0, Math.PI / 2]);
  solid(new THREE.BoxGeometry(0.12, 0.42, 1.2), BUS, E); solid(new THREE.BoxGeometry(0.12, 0.5, 0.9), AV, E);
  [LDG, TIPL, TIPR, BCN, TAIL, STBL, STBR].forEach((p) => solid(new THREE.SphereGeometry(0.2, 12, 8), p, E));
  const FW = (z, y = 4.6) => [3.55, y, z];   // through the firewall
  wire([BAT, FW(-0.95, 4.3), BUS], E); wire([ALT, [5.2, 4.6, -0.8], FW(-0.8), BUS], E); wire([BUS, FW(-0.4, 3.8), [5.6, 3.5, 0.4], STR], E);
  wire([BUS, AV], E, 1.8); wire([BUS, [1.4, 6.3, -1.1], [1.55, 6.7, -3.5], LDG], E, 1.8); wire([LDG, [0.6, 6.95, -12], TIPL], E, 1.6); wire([[1.4, 6.3, 1.0], [0.6, 6.8, 6], [0.4, 7.0, 12], TIPR], E, 1.6);
  wire([BUS, [1.4, 6.3, -1.1], [1.4, 6.3, 1.0]], E, 1.6); wire([BUS, [0.5, 3.6, -0.6], [-12, 4.6, 0], [-17.2, 6.0, 0], BCN], E, 1.6); wire([[-17.2, 6.0, 0], TAIL], E, 1.6); wire([[0.4, 7.05, -14], STBL], E, 1.5); wire([[0.4, 7.0, 12], STBR], E, 1.5);
  const pitot = buildPitot(THREE, { parent: E, fill, edge, depthTest: false, renderOrder: 8 });
  const PIT = pitot.tip;
  wire([[1.55, 6.7, -3.5], [1.4, 6.5, -7.2], pitot.plate], E, 1.6);
  const glows = {
    land: glowSprite(S, { color: 0xfff4d4, size: 3.2 }),
    navL: glowSprite(S, { color: 0xff2a2a, size: 1.7, tight: true }), navR: glowSprite(S, { color: 0x22c55e, size: 1.7, tight: true }), navT: glowSprite(S, { color: 0xf2f1ec, size: 1.5, tight: true }),
    beacon: glowSprite(S, { color: 0xff2a2a, size: 3.8 }),
    strobesL: glowSprite(S, { color: 0xffffff, size: 3.6 }), strobesR: glowSprite(S, { color: 0xffffff, size: 3.6 })
  };
  const beam = landingBeam(S);
  Object.values(glows).forEach((g) => { G.remove(g.obj); groups.elec.add(g.obj); });
  G.remove(beam.obj); groups.elec.add(beam.obj);
  // ---- brakes: left main wheel close-up (Cleveland single-disc brake, C172) ----
  // Real proportions (ft): 6.00-6 tire ~17.5 in OD (r 0.729, same as the model), 6 in rim, ~10 in disc 1/4 in thick on the
  // INBOARD side, spaced off the wheel half; a compact (~3 x 2.5 in) caliper straddles the disc rim aft: piston housing
  // inboard, backplate outboard behind the disc, bridged over the rim, pads on both faces, two through-bolts, a bleeder on
  // top and the brake line into the housing. The model's coarse left wheel and its fairing hide while this close-up shows
  // (fairing drawn removed, as on a brake inspection); the close-up draws its own ink wheel with depth.
  const B = groups.brk, WC = [XM, 17.5 / 24, WZ], DR = 0.42, DZL = 0.30, DC = [XM, WC[1], WZ + DZL];
  const ink = (geo, at, grp, rot, { lines = null, op = 0.55, thr = 30 } = {}) => {
    const m = new THREE.Mesh(geo, inkFill); const l = new THREE.LineSegments(lines || new THREE.EdgesGeometry(geo, thr), new THREE.LineBasicMaterial({ color: 0xf2f1ec, transparent: true, opacity: op }));
    [m, l].forEach((o) => { o.position.set(...at); if (rot) o.rotation.set(...rot); grp.add(o); }); return m; };
  const inkFill = new THREE.MeshBasicMaterial({ color: 0x0a0a0b, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const W3 = new THREE.Group(); W3.position.set(...WC); B.add(W3);
  { // tire: elliptical-section lathe, axis along z; ink rings for tread, shoulders and bead
    const prof = []; for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + (i / 24) * Math.PI; prof.push(new THREE.Vector2(0.515 + 0.214 * Math.cos(a), 0.21 * Math.sin(a))); }
    const tg = new THREE.LatheGeometry(prof, 48); tg.rotateX(Math.PI / 2);
    const ring = (r, z, n = 64) => { const s = []; for (let i = 0; i < n; i++) { const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI; s.push(r * Math.cos(a0), r * Math.sin(a0), z, r * Math.cos(a1), r * Math.sin(a1), z); } return s; };
    const at = (a) => [0.515 + 0.214 * Math.cos(a), 0.21 * Math.sin(a)];
    const segs = [...ring(...at(0)), ...ring(...at(0.5)), ...ring(...at(-0.5)), ...ring(...at(1.15)), ...ring(...at(-1.15)), ...ring(0.302, 0.205), ...ring(0.302, -0.205)];
    for (let i = 0; i < 24; i++) { const a = (i / 24) * 2 * Math.PI, [r1, z1] = at(-0.35), [r2, z2] = at(0.35); segs.push(r1 * Math.cos(a), r1 * Math.sin(a), z1, r2 * Math.cos(a + 0.08), r2 * Math.sin(a + 0.08), z2); }   // tread grooves
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    ink(tg, [0, 0, 0], W3, null, { lines: lg, op: 0.5 });
    // rim / wheel halves (6 in), inboard hub boss that carries the disc, six through-bolts
    ink(new THREE.CylinderGeometry(0.30, 0.30, 0.40, 40).rotateX(Math.PI / 2), [0, 0, 0], W3, null, { op: 0.6 });
    ink(new THREE.CylinderGeometry(0.205, 0.225, 0.10, 32).rotateX(Math.PI / 2), [0, 0, 0.245], W3, null, { op: 0.6 });
    ink(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20).rotateX(Math.PI / 2), [0, 0, 0.33], W3, null, { op: 0.6 });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 2 * Math.PI + 0.26; ink(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6).rotateX(Math.PI / 2), [0.175 * Math.cos(a), 0.175 * Math.sin(a), DZL + 0.025], W3, null, { op: 0.6 }); }
  }
  // disc: pale, semi-transparent blue so the caliper reads in front of it; center hole + six bolt holes + six lightening holes
  const discFill = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
  const discEdge = new THREE.LineBasicMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.9 });
  { const sh = new THREE.Shape(); sh.absarc(0, 0, DR, 0, Math.PI * 2, false);
    const hole = (x, y, r) => { const p = new THREE.Path(); p.absarc(x, y, r, 0, Math.PI * 2, true); sh.holes.push(p); };
    hole(0, 0, 0.12); for (let i = 0; i < 6; i++) { const a = (i / 6) * 2 * Math.PI + 0.26; hole(0.175 * Math.cos(a), 0.175 * Math.sin(a), 0.022); const b = a + Math.PI / 6; hole(0.265 * Math.cos(b), 0.265 * Math.sin(b), 0.03); }
    const dg = new THREE.ExtrudeGeometry(sh, { depth: 0.025, bevelEnabled: false, curveSegments: 40 }); dg.translate(0, 0, DZL - 0.0125);
    const m = new THREE.Mesh(dg, discFill), l = new THREE.LineSegments(new THREE.EdgesGeometry(dg, 30), discEdge); m.renderOrder = 4; l.renderOrder = 5; W3.add(m, l); }
  // caliper (local frame: x radial out, y along the rim, z axial inboard from the disc mid-plane). A matcap (no lights
  // needed) shades the cast body so its rounded form reads; light edges outline it.
  const matcap = (c0, c1, c2) => { const cv = document.createElement("canvas"); cv.width = cv.height = 128; const x = cv.getContext("2d");
    const g = x.createRadialGradient(48, 40, 4, 64, 64, 66); g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshMatcapMaterial({ matcap: t, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }); };
  const calFill = matcap("#bfdbfe", "#2f6fe8", "#0b1f55");
  const calEdge = new THREE.LineBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.85 });
  const padFill = matcap("#e5e7eb", "#8b93a1", "#2b2f36");
  const padEdge = new THREE.LineBasicMaterial({ color: 0xf2f1ec, transparent: true, opacity: 0.9 });
  const CA = 125 * Math.PI / 180, calG = new THREE.Group(); calG.position.z = DZL; calG.rotation.z = CA; W3.add(calG);
  const cp = (geo, at, rot, f = calFill, e = calEdge, thr = 28) => { const m = new THREE.Mesh(geo, f), l = new THREE.LineSegments(new THREE.EdgesGeometry(geo, thr), e); [m, l].forEach((o) => { o.position.set(...at); if (rot) o.rotation.set(...rot); calG.add(o); }); };
  // rounded plate in the (radial, along-rim) plane, extruded axially z0..z1 with a soft bevel
  const rr = (x0, x1, hw, r) => { const s = new THREE.Shape(); s.moveTo(x0 + r, -hw); s.lineTo(x1 - r, -hw); s.quadraticCurveTo(x1, -hw, x1, -hw + r); s.lineTo(x1, hw - r); s.quadraticCurveTo(x1, hw, x1 - r, hw); s.lineTo(x0 + r, hw); s.quadraticCurveTo(x0, hw, x0, hw - r); s.lineTo(x0, -hw + r); s.quadraticCurveTo(x0, -hw, x0 + r, -hw); return s; };
  const slab = (x0, x1, hw, r, z0, z1, f, e, b = 0.006) => { const g = new THREE.ExtrudeGeometry(rr(x0 + b, x1 - b, hw - b, r), { depth: Math.max(0.002, z1 - z0 - 2 * b), bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 2, curveSegments: 8 }); g.translate(0, 0, z0 + b); cp(g, [0, 0, 0], null, f, e, 32); };
  slab(0.295, 0.49, 0.125, 0.055, 0.031, 0.09, calFill, calEdge, 0.008);    // inboard cylinder body (cast)
  slab(0.31, 0.485, 0.115, 0.045, -0.072, -0.031, calFill, calEdge);       // outboard backplate behind the disc
  slab(0.445, 0.49, 0.075, 0.02, -0.072, 0.09, calFill, calEdge, 0.005);   // bridge over the disc rim
  slab(0.315, 0.43, 0.105, 0.025, 0.0125, 0.031, padFill, padEdge, 0.003);  // inboard pad
  slab(0.315, 0.43, 0.105, 0.025, -0.031, -0.0125, padFill, padEdge, 0.003); // outboard pad
  // piston housing on the inboard face, with the cylinder bore cap
  cp(new THREE.CylinderGeometry(0.068, 0.074, 0.07, 32).rotateX(Math.PI / 2), [0.375, 0, 0.12]);
  cp(new THREE.CylinderGeometry(0.05, 0.058, 0.018, 32).rotateX(Math.PI / 2), [0.375, 0, 0.163]);
  cp(new THREE.CylinderGeometry(0.026, 0.026, 0.008, 6).rotateX(Math.PI / 2), [0.375, 0, 0.175]);
  // two through-bolts over the disc rim, hex heads both sides
  [-0.098, 0.098].forEach((y) => { cp(new THREE.CylinderGeometry(0.012, 0.012, 0.19, 10).rotateX(Math.PI / 2), [0.465, y, 0.01]);
    cp(new THREE.CylinderGeometry(0.022, 0.022, 0.018, 6).rotateX(Math.PI / 2), [0.465, y, 0.1]); cp(new THREE.CylinderGeometry(0.022, 0.022, 0.018, 6).rotateX(Math.PI / 2), [0.465, y, -0.082]); });
  // bleeder nub on top (radially out) of the body, beside the housing
  cp(new THREE.CylinderGeometry(0.011, 0.013, 0.04, 10).rotateZ(-Math.PI / 2), [0.51, 0.045, 0.065]);
  cp(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 6).rotateZ(-Math.PI / 2), [0.525, 0.045, 0.065]);
  // brake line fitting into the housing (inboard)
  cp(new THREE.CylinderGeometry(0.018, 0.018, 0.045, 6).rotateX(Math.PI / 2), [0.44, -0.055, 0.135]);
  const toW = (x, y, z) => { const c = Math.cos(CA), s = Math.sin(CA); return [WC[0] + c * x - s * y, WC[1] + s * x + c * y, WC[2] + DZL + z]; };
  const FITW = toW(0.44, -0.055, 0.16), CAL = toW(0.48, 0.1, 0.07), PADW = toW(0.33, 0.105, 0.022), DISCW = [WC[0] + DR * Math.cos(-0.55), WC[1] + DR * Math.sin(-0.55), WC[2] + DZL];
  // brake line: a real tube from the fitting up the inboard side of the gear leg, then the schematic run to the cockpit
  const LINE0 = [FITW, [FITW[0], FITW[1] + 0.03, FITW[2] + 0.07], [XM - 0.24, 1.32, -3.44], [XM - 0.22, 1.7, -3.2]];
  { const curve = new THREE.CatmullRomCurve3(LINE0.map((p) => new THREE.Vector3(...p))); const g = new THREE.TubeGeometry(curve, 40, 0.016, 8, false);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: ACC })); B.add(m); }
  const LINE = [LINE0[3], [XM - 0.2, 2.2, -2.4], [XM + 0.2, 3.05, -0.7], [1.6, 3.2, -0.65], [3.05, 3.45, -0.62]]; wire(LINE, groups.brkLine, 2.4);
  const BLP = LINE0[2];
  const mWheel = S.P.meshes.find((m) => m.userData.tag === "wheel" + WZ), mPant = S.P.meshes.find((m) => m.userData.tag === "pant" + WZ), mLeg = S.P.meshes.find((m) => m.userData.tag === "leg" + WZ);
  // the spring-steel leg stays as a faint ink outline in the close-up, so it does not hide the disc it bolts behind
  if (mLeg) { const gl = new THREE.LineSegments(new THREE.EdgesGeometry(mLeg.geometry, 30), new THREE.LineBasicMaterial({ color: 0xf2f1ec, transparent: true, opacity: 0.28 })); B.add(gl); }
  const hideModelWheel = (on) => { if (mWheel) mWheel.parent.visible = !on; if (mPant) mPant.parent.visible = !on; if (mLeg) mLeg.parent.visible = !on; };
  // ---- pedals: two pilot pedals with master cylinders (toe brakes) ----
  const P = groups.pedals; [-0.85, -0.4].forEach((z) => { solid(new THREE.BoxGeometry(0.08, 0.5, 0.26), [3.1, 3.8, z], P, [0, 0, 0.35]); solid(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 10), [3.2, 3.35, z], P, [0, 0, 0.5]); });
  wire([[3.05, 3.45, -0.62], [3.2, 3.35, -0.85]], P, 2); wire([[3.05, 3.45, -0.62], [3.2, 3.35, -0.4]], P, 2);
  // ---- labels ----
  const TG = tags3d(F.stage); const T = (txt, at, dx, dy, grp, cls = "", tight = false) => ({ t: TG.add(txt, { dx, dy, cls: (tight ? "tight " : "") + cls, tight }), at, grp });
  const LBL = [T("Battery", BAT, -26, 46, "elec"), T("Alternator", ALT, 24, -46, "elec"), T("Starter", STR, 30, 34, "elec"), T("Master + breakers", BUS, -56, 22, "elec"),
    T("Landing/taxi lts", LDG, 44, -16, "elec", "", true), T("Nav · red", TIPL, 14, 10, "elec", "nav-l", true), T("Nav · green", TIPR, -16, -16, "elec", "nav-r", true), T("Nav · white", TAIL, 12, 12, "elec", "nav-w", true),
    T("Beacon", BCN, 10, -16, "elec", "", true), T("Strobe", STBL, 14, 22, "elec", "strobe", true), T("Strobe", STBR, -16, 16, "elec", "strobe", true), T("Pitot tube", PIT, 36, 52, "elec"),
    T("Disc", DISCW, 40, 40, "brk"), T("Caliper", CAL, -40, -40, "brk"), T("Pads", PADW, -60, 34, "brk"), T("Brake line", BLP, 40, -30, "brk"), T("Brake line", [1.6, 3.2, -0.65], -20, -40, "pedals"),
    T("Toe brakes", [3.1, 3.95, -0.6], -30, -46, "pedals"), T("Master cylinders", [3.2, 3.35, -0.6], 30, 44, "pedals")];
  LBL.forEach((l) => (l.t.on = false));
  let live = null, raf = 0; const loop = () => { raf = 0;
    const on = live && live.includes("elec"), t = performance.now() / 1000;
    glows.land.set(LDG, on ? 1 : 0); beam.set(LDG, on ? 1 : 0); glows.navL.set(TIPL, on ? 0.95 : 0); glows.navR.set(TIPR, on ? 0.95 : 0); glows.navT.set(TAIL, on ? 0.8 : 0);
    glows.beacon.set(BCN, on ? lightPulse(t, "beacon") : 0); const fl = on ? lightPulse(t, "strobe") : 0; glows.strobesL.set(STBL, fl); glows.strobesR.set(STBR, fl);
    TG.place(LBL.filter((l) => l.t.on).map((l) => ({ t: l.t, q: S.project(l.at), qs: (l.ats || []).map((p) => S.project(p)) })), live && live.includes("brk") ? 62 : 34);
    LBL.filter((l) => !l.t.on).forEach((l) => TG.place([{ t: l.t, q: null }])); if (live) raf = requestAnimationFrame(loop); };
  const show = (keys) => { hideModelWheel(keys.includes("brk")); Object.entries(groups).forEach(([k, g]) => (g.visible = keys.includes(k))); LBL.forEach((l) => (l.t.on = keys.includes(l.grp))); live = keys.length ? keys : null; S.setFlow(!!(live && live.includes("elec"))); if (live && !raf) raf = requestAnimationFrame(loop); if (!live) loop(); S.kick(); };
  const VIEW = { elec: { tg: [-3.5, 4.8, 0], az: -38, el: 24, d: 52 }, brk: { tg: [XM - 0.08, 0.72, WZ + 0.25], az: 145, el: -8, d: 2.75 }, pedals: { tg: [2.6, 3.55, -0.62], az: -58, el: 22, d: 6.5 } };
  const SYS = {
    air: ["Airframe", "The basic structure", ["fuselage", "fairing", "wing", "fin", "hstab", "struts"], "iso", {}, "Fuselage, wings, struts and tail: built to carry the air loads plus the weight of fuel, crew and payload.", "PHAK 3"],
    elec: ["Electrical system", "28-volt DC", [], VIEW.elec, {}, "The engine-driven alternator and the battery feed the buses through the MASTER switch (ALT and BAT halves); circuit breakers protect each circuit out to the starter, avionics and lights. [[Position lights|Nav lights]] are red on the left wingtip, green on the right and white on the tail. The [[Beacon|beacon]] on top of the fin flashes red; white [[Strobe lights|strobes]] flash at each wingtip. The landing and taxi lights sit in the left wing leading edge. A heated pitot tube hangs under the left wing, just outboard of the strut. Seen x-ray through the cowling and skin; wire routes are schematic.", "C172S POH 7 · PHAK 7 · 14 CFR 91.209"],
    ctl: ["Flight controls", "Ailerons, elevator, rudder, flaps, trim", ["ailerons", "elevator", "rudder", "flaps", "trimtab"], "iso", { ail: 18, elev: -16, rud: 16, flap: 20, trim: 8 }, "The surfaces that change the airplane's attitude, worked from the yoke, pedals, flap switch and trim wheel. Shown deflected for clarity.", "PHAK 3"],
    brk: ["Brakes", "Disc brakes on the main wheels", [], VIEW.brk, {}, "Each main wheel has a single hydraulic disc brake on its inboard side; the nose wheel has none. Press the top of a rudder pedal (toe brake) and its master cylinder pushes fluid down the brake line to squeeze the disc. On the walkaround: no leaks, line secure, disc and pads not worn.", "C172S POH 7 · AFH 2"],
  };
  const sub = h("div", { class: "sys-sub" }); const subChips = chips(sub, [["wheel", "Main wheel"], ["pedals", "Rudder pedals"]], "wheel", (v) => { const p = v === "pedals"; S.setInkOpacity(p ? 0.16 : 0.38); S.setView(p ? VIEW.pedals : VIEW.brk); show(p ? ["brkLine", "pedals"] : ["brk", "brkLine"]); F.caption("Brakes", p ? "Toe brakes and master cylinders" : "Disc brakes on the main wheels"); }, { label: "Brake view" });
  const pick = (k) => { sub.hidden = k !== "brk"; S.setInkOpacity(0.5);
    if (!k) { cowl(true); S.highlight([]); S.setView("iso"); animatePose({}); show([]); F.caption("Four subcomponents", "Pick a system"); F.explain("Each chip lights only that system's parts. Drag to orbit."); return; }
    const [name, big, hl, view, pose, text, src] = SYS[k]; cowl(k !== "elec", k === "elec"); S.highlight(hl); S.setView(view); animatePose(pose); show(k === "elec" ? ["elec"] : k === "brk" ? ["brk", "brkLine"] : []);
    if (k === "brk") subChips.set("wheel"); F.caption(name, big); F.explain(`${rich(text)} <span class="src">${src}</span>`); };
  chips(F.ctrl, Object.keys(SYS).map((k) => [k, SYS[k][0]]), null, pick, { label: "System", toggle: true }); F.ctrl.append(sub); sub.hidden = true;
  pick(null);
  return () => { live = null; cancelAnimationFrame(raf); };
}
