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
import { chips } from "./base.js?v=e5f54f3664";
import { tags3d } from "./tags3d.js?v=e5f54f3664";
import { glowSprite, lightPulse, landingBeam } from "./lightglow.js?v=e5f54f3664";
import { buildPitot } from "./pitot3d.js?v=e5f54f3664";
import { rich } from "../core/rich.js?v=e5f54f3664";
import { h } from "../core/util.js?v=e5f54f3664";
const ACC = 0x3b82f6, XM = -1.22, WZ = -4.1;
export function systems(S, F, { cowl, animatePose }) {
  const THREE = S.THREE, G = S.cueGroup, groups = { elec: new THREE.Group(), brk: new THREE.Group(), pedals: new THREE.Group() };
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
  // ---- brakes: left main wheel close-up ----
  const B = groups.brk, DZ = WZ + 0.36, DC = [XM, 0.73, DZ];
  solid(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 28), DC, B, [Math.PI / 2, 0, 0]);
  solid(new THREE.BoxGeometry(0.26, 0.24, 0.18), [XM - 0.3, 1.0, DZ + 0.06], B);
  const LINE = [[XM - 0.3, 1.12, DZ + 0.06], [XM - 0.15, 1.9, -3.0], [XM, 2.7, -1.6], [XM + 0.2, 3.05, -0.7], [1.6, 3.2, -0.65], [3.05, 3.45, -0.62]]; wire(LINE, B, 2.4);
  // ---- pedals: two pilot pedals with master cylinders (toe brakes) ----
  const P = groups.pedals; [-0.85, -0.4].forEach((z) => { solid(new THREE.BoxGeometry(0.08, 0.5, 0.26), [3.1, 3.8, z], P, [0, 0, 0.35]); solid(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 10), [3.2, 3.35, z], P, [0, 0, 0.5]); });
  wire([[3.05, 3.45, -0.62], [3.2, 3.35, -0.85]], P, 2); wire([[3.05, 3.45, -0.62], [3.2, 3.35, -0.4]], P, 2);
  // ---- labels ----
  const TG = tags3d(F.stage); const T = (txt, at, dx, dy, grp, cls = "", tight = false) => ({ t: TG.add(txt, { dx, dy, cls: (tight ? "tight " : "") + cls, tight }), at, grp });
  const LBL = [T("Battery", BAT, -26, 46, "elec"), T("Alternator", ALT, 24, -46, "elec"), T("Starter", STR, 30, 34, "elec"), T("Master + breakers", BUS, -56, 22, "elec"),
    T("Landing/taxi lts", LDG, 44, -16, "elec", "", true), T("Nav · red", TIPL, 14, 10, "elec", "nav-l", true), T("Nav · green", TIPR, -16, -16, "elec", "nav-r", true), T("Nav · white", TAIL, 12, 12, "elec", "nav-w", true),
    T("Beacon", BCN, 10, -16, "elec", "", true), T("Strobe", STBL, 14, 22, "elec", "strobe", true), T("Strobe", STBR, -16, 16, "elec", "strobe", true), T("Pitot tube", PIT, 36, 52, "elec"),
    T("Disc", DC, -40, 40, "brk"), T("Caliper", [XM - 0.3, 1.0, DZ + 0.06], -30, -50, "brk"), T("Brake line", LINE[1], 30, -40, "brk"),
    T("Toe brakes", [3.1, 3.95, -0.6], -30, -46, "pedals"), T("Master cylinders", [3.2, 3.35, -0.6], 30, 44, "pedals")];
  LBL.forEach((l) => (l.t.on = false));
  let live = null, raf = 0; const loop = () => { raf = 0;
    const on = live && live.includes("elec"), t = performance.now() / 1000;
    glows.land.set(LDG, on ? 1 : 0); beam.set(LDG, on ? 1 : 0); glows.navL.set(TIPL, on ? 0.95 : 0); glows.navR.set(TIPR, on ? 0.95 : 0); glows.navT.set(TAIL, on ? 0.8 : 0);
    glows.beacon.set(BCN, on ? lightPulse(t, "beacon") : 0); const fl = on ? lightPulse(t, "strobe") : 0; glows.strobesL.set(STBL, fl); glows.strobesR.set(STBR, fl);
    TG.place(LBL.filter((l) => l.t.on).map((l) => ({ t: l.t, q: S.project(l.at), qs: (l.ats || []).map((p) => S.project(p)) })), 34);
    LBL.filter((l) => !l.t.on).forEach((l) => TG.place([{ t: l.t, q: null }])); if (live) raf = requestAnimationFrame(loop); };
  const show = (keys) => { Object.entries(groups).forEach(([k, g]) => (g.visible = keys.includes(k))); LBL.forEach((l) => (l.t.on = keys.includes(l.grp))); live = keys.length ? keys : null; S.setFlow(!!(live && live.includes("elec"))); if (live && !raf) raf = requestAnimationFrame(loop); if (!live) loop(); S.kick(); };
  const VIEW = { elec: { tg: [-3.5, 4.8, 0], az: -38, el: 24, d: 52 }, brk: { tg: [XM - 0.1, 1.05, DZ], az: 62, el: -14, d: 5.2 }, pedals: { tg: [2.6, 3.55, -0.62], az: -58, el: 22, d: 6.5 } };
  const SYS = {
    air: ["Airframe", "The basic structure", ["fuselage", "fairing", "wing", "fin", "hstab", "struts"], "iso", {}, "Fuselage, wings, struts and tail: built to carry the air loads plus the weight of fuel, crew and payload.", "PHAK 3"],
    elec: ["Electrical system", "28-volt DC", [], VIEW.elec, {}, "The engine-driven alternator and the battery feed the buses through the MASTER switch (ALT and BAT halves); circuit breakers protect each circuit out to the starter, avionics and lights. [[Position lights|Nav lights]] are red on the left wingtip, green on the right and white on the tail. The [[Beacon|beacon]] on top of the fin flashes red; white [[Strobe lights|strobes]] flash at each wingtip. The landing and taxi lights sit in the left wing leading edge. A heated pitot tube hangs under the left wing, just outboard of the strut. Seen x-ray through the cowling and skin; wire routes are schematic.", "C172S POH 7 · PHAK 7 · 14 CFR 91.209"],
    ctl: ["Flight controls", "Ailerons, elevator, rudder, flaps, trim", ["ailerons", "elevator", "rudder", "flaps", "trimtab"], "iso", { ail: 18, elev: -16, rud: 16, flap: 20, trim: 8 }, "The surfaces that change the airplane's attitude, worked from the yoke, pedals, flap switch and trim wheel. Shown deflected for clarity.", "PHAK 3"],
    brk: ["Brakes", "Disc brakes on the main wheels", [], VIEW.brk, {}, "Each main wheel has a single hydraulic disc brake on its inboard side; the nose wheel has none. Press the top of a rudder pedal (toe brake) and its master cylinder pushes fluid down the brake line to squeeze the disc. On the walkaround: no leaks, line secure, disc and pads not worn.", "C172S POH 7 · AFH 2"],
  };
  const sub = h("div", { class: "sys-sub" }); const subChips = chips(sub, [["wheel", "Main wheel"], ["pedals", "Rudder pedals"]], "wheel", (v) => { const p = v === "pedals"; S.setInkOpacity(p ? 0.16 : 0.5); S.setView(p ? VIEW.pedals : VIEW.brk); show(p ? ["brk", "pedals"] : ["brk"]); F.caption("Brakes", p ? "Toe brakes and master cylinders" : "Disc brakes on the main wheels"); }, { label: "Brake view" });
  const pick = (k) => { sub.hidden = k !== "brk"; S.setInkOpacity(0.5);
    if (!k) { cowl(true); S.highlight([]); S.setView("iso"); animatePose({}); show([]); F.caption("Four subcomponents", "Pick a system"); F.explain("Each chip lights only that system's parts. Drag to orbit."); return; }
    const [name, big, hl, view, pose, text, src] = SYS[k]; cowl(k !== "elec", k === "elec"); S.highlight(hl); S.setView(view); animatePose(pose); show(k === "elec" ? ["elec"] : k === "brk" ? ["brk"] : []);
    if (k === "brk") subChips.set("wheel"); F.caption(name, big); F.explain(`${rich(text)} <span class="src">${src}</span>`); };
  chips(F.ctrl, Object.keys(SYS).map((k) => [k, SYS[k][0]]), null, pick, { label: "System", toggle: true }); F.ctrl.append(sub); sub.hidden = true;
  pick(null);
  return () => { live = null; cancelAnimationFrame(raf); };
}
